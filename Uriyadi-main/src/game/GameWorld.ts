import * as THREE from 'three';
import { VillageScene } from './VillageScene';
import { UriyadiArena } from './UriyadiArena';
import { PlayerController } from './PlayerController';
import { PotDestruction } from './PotDestruction';
import { NPCCrowd } from './NPCCrowd';
import { audioEngine } from '../audio/WebAudioEngine';
import { DirectionalVoiceCue, HitQuality, LevelConfig, NavigationMetrics } from '../types';
import { crowdAI } from '../ai/CrowdDirectorAI';

export interface GameWorldCallbacks {
  onPotHit?: (quality: HitQuality, points: number) => void;
  onPotShatter?: (stats: { time: number; accuracy: number; quality: HitQuality }) => void;
  onVoiceCue?: (cue: DirectionalVoiceCue) => void;
  onNavigationUpdate?: (metrics: NavigationMetrics) => void;
}

export class GameWorld {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;

  public village: VillageScene;
  public arena: UriyadiArena;
  public player: PlayerController;
  public destruction: PotDestruction;
  public crowd: NPCCrowd;

  private isRunning = false;
  private animFrameId: number | null = null;
  private clock = new THREE.Clock();

  public callbacks: GameWorldCallbacks = {};
  public currentLevel: LevelConfig | null = null;

  // AI Voice guidance timer
  private voiceCueTimer = 0;
  private hasProcessedCurrentSwing = false;
  private levelRemainingTime = 90;

  // Gameplay state
  public isPotBroken = false;
  private roundStartTime = 0;
  private roundHits = 0;

  constructor(container: HTMLDivElement) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb);
    this.scene.fog = new THREE.FogExp2(0xb0d8ef, 0.012);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    this.camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 200);
    this.scene.add(this.camera);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    container.appendChild(this.renderer.domElement);

    // Initialize subsystems
    this.village = new VillageScene();
    this.scene.add(this.village.group);

    this.arena = new UriyadiArena();
    this.scene.add(this.arena.group);

    this.destruction = new PotDestruction();
    this.scene.add(this.destruction.group);

    this.crowd = new NPCCrowd();
    this.scene.add(this.crowd.group);

    this.player = new PlayerController(this.camera);
    this.scene.add(this.player.group);

    window.addEventListener('resize', this.onWindowResize);
  }

  private onWindowResize = () => {
    if (!this.renderer.domElement.parentElement) return;
    const width = this.renderer.domElement.parentElement.clientWidth;
    const height = this.renderer.domElement.parentElement.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  public loadLevel(level: LevelConfig) {
    this.currentLevel = level;
    this.isPotBroken = false;
    this.destruction.cleanup();
    this.arena.potMesh.visible = true;

    this.village.setTimeOfDay(level.timeOfDay);
    this.arena.configureLevel(
      level.potHeight,
      level.potSwingSpeed,
      level.windStrength,
      level.pulleyActive,
      level.pulleyFrequency
    );

    this.player.reset(new THREE.Vector3(0, 1.65, 3.8), 0);
    this.crowd.setMood('CONVERSATIONAL');

    this.voiceCueTimer = 1.6;
    this.roundStartTime = performance.now();
    this.roundHits = 0;

    // Opening audience encouragement right as the blindfold drops
    setTimeout(() => {
      if (this.isRunning && !this.isPotBroken) {
        this.evaluateAndTriggerVoiceCue(false);
      }
    }, 450);
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.clock.start();
    this.tick();
  }

  public stop() {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private tick = () => {
    if (!this.isRunning) return;
    const delta = Math.min(this.clock.getDelta(), 0.1);
    const elapsed = this.clock.getElapsedTime();

    this.update(delta, elapsed);
    this.renderer.render(this.scene, this.camera);

    this.animFrameId = requestAnimationFrame(this.tick);
  };

  private update(delta: number, elapsed: number) {
    // 1. Update Subsystems
    this.village.update(delta, elapsed);
    this.arena.update(delta, elapsed);
    this.crowd.update(delta, elapsed, this.arena.potWorldPosition);
    this.destruction.update(delta);
    this.player.update(delta);

    if (this.isPotBroken) return;

    // Real-time navigation metrics for HUD radar & compass
    const playerPos = this.player.position;
    const potPos = this.arena.potWorldPosition;
    const dx = potPos.x - playerPos.x;
    const dz = potPos.z - playerPos.z;
    const distToPot = Math.sqrt(dx * dx + dz * dz);

    const targetAngle = Math.atan2(-dx, -dz);
    let diff = targetAngle - this.player.yaw;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;

    const bearingDeg = Math.round((diff * 180) / Math.PI);
    const isFacingPot = Math.abs(bearingDeg) <= 45;
    const isInStrikingRange = distToPot <= 2.3;

    if (this.callbacks.onNavigationUpdate) {
      this.callbacks.onNavigationUpdate({
        distanceToPot: Math.round(distToPot * 10) / 10,
        bearingToPot: bearingDeg,
        isInStrikingRange,
        isFacingPot,
      });
    }

    // Directional Voice Guidance (Spatial Tamil crowd shouts powered by CrowdDirectorAI)
    // Near the pot, crowd guidance becomes more frequent and feverish
    const targetInterval = distToPot <= 1.9 ? 1.6 : 2.2;
    this.voiceCueTimer += delta;
    if (this.voiceCueTimer >= targetInterval) {
      this.voiceCueTimer = 0;
      this.evaluateAndTriggerVoiceCue(false);
    }

    // 4. Hit Detection between Stick and Pot
    if (this.player.isSwinging) {
      const hitResult = this.player.testPotHit(this.arena.potWorldPosition, this.arena.potRadius);

      if (hitResult.hit) {
        this.hasProcessedCurrentSwing = true;
        this.roundHits++;
        const impulse = hitResult.impactVelocity.clone().multiplyScalar(0.4);
        this.arena.applyImpulse(impulse);

        audioEngine.playPotHit(hitResult.quality);

        let points = 250;
        if (hitResult.quality === 'PERFECT') points = 1000;
        else if (hitResult.quality === 'GREAT') points = 600;
        else if (hitResult.quality === 'GOOD') points = 400;

        if (this.callbacks.onPotHit) {
          this.callbacks.onPotHit(hitResult.quality, points);
        }

        // Pot breaks on Great or Perfect hit, or accumulated damage
        if (hitResult.quality === 'PERFECT' || hitResult.quality === 'GREAT' || this.roundHits >= 3) {
          this.shatterPot(hitResult.quality, impulse);
        } else {
          this.crowd.setMood('REACTION_HIT');
          audioEngine.playCrowdReaction('cheer');
          setTimeout(() => {
            if (!this.isPotBroken) this.crowd.setMood('ATTENTIVE');
          }, 1200);
        }
      } else if (!this.hasProcessedCurrentSwing) {
        // Player swung into thin air (miss)
        this.hasProcessedCurrentSwing = true;
        this.crowd.setMood('REACTION_MISS');
        audioEngine.playCrowdReaction('gasp');
        // Instantly trigger audience reaction call
        this.evaluateAndTriggerVoiceCue(true);
      }
    } else {
      this.hasProcessedCurrentSwing = false;
    }
  }

  // --- SIGNATURE POT SHATTER MOMENT ---
  private shatterPot(quality: HitQuality, impulse: THREE.Vector3) {
    this.isPotBroken = true;
    this.arena.potMesh.visible = false;

    // Trigger explosive visual destruction
    this.destruction.triggerShatter(this.arena.potWorldPosition, impulse);

    // Audio & crowd climax
    audioEngine.playPotShatter();
    audioEngine.setMusicMood('CELEBRATION');
    this.crowd.setMood('CELEBRATION');
    audioEngine.playCrowdReaction('celebrate');

    // Camera shake impulse
    this.triggerCameraShake(0.6);

    const elapsedSeconds = (performance.now() - this.roundStartTime) / 1000;
    const accuracy = Math.round((this.roundHits / Math.max(1, this.roundHits + 1)) * 100);

    if (this.callbacks.onPotShatter) {
      this.callbacks.onPotShatter({
        time: elapsedSeconds,
        accuracy,
        quality,
      });
    }
  }

  private triggerCameraShake(duration = 0.5) {
    let elapsed = 0;
    const interval = setInterval(() => {
      elapsed += 0.03;
      if (elapsed >= duration) {
        clearInterval(interval);
        return;
      }
      const intensity = (1 - elapsed / duration) * 0.08;
      this.camera.position.x += (Math.random() - 0.5) * intensity;
      this.camera.position.y += (Math.random() - 0.5) * intensity;
    }, 30);
  }

  // --- DIRECTIONAL TAMIL AUDIO NAVIGATION (AI CROWD DIRECTOR) ---
  private evaluateAndTriggerVoiceCue(isMiss = false) {
    const playerPos = this.player.position;
    const potPos = this.arena.potWorldPosition;

    // Vector from player to pot in XZ plane
    const dx = potPos.x - playerPos.x;
    const dz = potPos.z - playerPos.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    // Player heading angle
    const playerHeading = this.player.yaw;
    // Target angle from player to pot
    const targetAngle = Math.atan2(-dx, -dz);
    // Relative difference angle (-PI to PI)
    let diff = targetAngle - playerHeading;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;

    const isMoving = this.player.isMoving;
    const playerSpeed = this.player.speed;
    const isBlindfolded = this.currentLevel?.blindfoldRequired ?? true;

    // AI evaluates full spatial context and picks the authentic Tamil spectator persona
    const cue = crowdAI.generateCrowdGuidance({
      distanceToPot: dist,
      angleDiff: diff,
      isMoving,
      playerSpeed,
      timeRemaining: this.levelRemainingTime,
      isBlindfolded,
      didRecentMiss: isMiss,
    });

    let panX = 0;
    if (cue.angleTarget === 'LEFT') panX = -0.85;
    else if (cue.angleTarget === 'RIGHT') panX = 0.85;
    else if (diff < -0.2) panX = -0.45;
    else if (diff > 0.2) panX = 0.45;

    // Trigger audio spatial cue with Web Speech synthesis
    audioEngine.playSpatialVoiceCue(cue, panX, dist);

    // Dispatch to HUD captions system
    if (this.callbacks.onVoiceCue) {
      this.callbacks.onVoiceCue(cue);
    }
  }

  public setGraphicsQuality(quality: 'LOW' | 'MEDIUM' | 'HIGH' | 'ULTRA') {
    if (quality === 'LOW') {
      this.renderer.shadowMap.enabled = false;
      this.renderer.setPixelRatio(1.0);
    } else if (quality === 'MEDIUM') {
      this.renderer.shadowMap.enabled = true;
      this.renderer.setPixelRatio(1.0);
    } else if (quality === 'HIGH') {
      this.renderer.shadowMap.enabled = true;
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    } else {
      this.renderer.shadowMap.enabled = true;
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
    }
  }

  public captureScreenshot(): string {
    this.renderer.render(this.scene, this.camera);
    return this.renderer.domElement.toDataURL('image/png');
  }

  public destroy() {
    this.stop();
    window.removeEventListener('resize', this.onWindowResize);
    this.destruction.cleanup();
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
