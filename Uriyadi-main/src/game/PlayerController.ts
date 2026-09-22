import * as THREE from 'three';
import { CharacterConfig, HitQuality, OutfitConfig, StickConfig } from '../types';

export interface HitResult {
  hit: boolean;
  quality: HitQuality;
  impactPoint: THREE.Vector3;
  impactVelocity: THREE.Vector3;
  accuracy: number;
}

export class PlayerController {
  public camera: THREE.PerspectiveCamera;
  public group: THREE.Group;
  public stickGroup: THREE.Group;
  public stickShaftMesh: THREE.Mesh | null = null;
  public stickGripMesh: THREE.Mesh | null = null;
  public swingTrailMesh: THREE.Mesh | null = null;
  public stickTipWorld = new THREE.Vector3();
  public stickBaseWorld = new THREE.Vector3();

  // Position & Orientation
  public position = new THREE.Vector3(0, 1.65, 3.2);
  public yaw = 0;
  public pitch = 0;

  // Movement & Stamina
  public baseSpeed = 3.2;
  public speed = 3.2;
  public sprintMultiplier = 1.6;
  public isSprinting = false;
  public stamina = 100;
  public maxStamina = 100;
  private headBobTimer = 0;

  // Stick & Swing physics
  public isSwinging = false;
  private swingProgress = 0;
  private swingDuration = 0.35;
  private swingVelocity = new THREE.Vector3();
  private prevStickTip = new THREE.Vector3();
  public currentPowerMultiplier = 1.0;

  // Inputs
  public moveForward = false;
  public moveBackward = false;
  public moveLeft = false;
  public moveRight = false;
  public turnLeft = false;
  public turnRight = false;
  public mouseSensitivity = 0.0022;

  public get isMoving(): boolean {
    return this.moveForward || this.moveBackward || this.moveLeft || this.moveRight;
  }

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
    this.group = new THREE.Group();
    this.group.position.copy(this.position);

    // Build the stick
    this.stickGroup = this.buildStick();
    this.camera.add(this.stickGroup);
  }

  private buildStick(): THREE.Group {
    const group = new THREE.Group();

    // Wood shaft
    const shaftGeo = new THREE.CylinderGeometry(0.024, 0.028, 1.3, 12);
    const shaftMat = new THREE.MeshStandardMaterial({
      color: 0x854d0e,
      roughness: 0.75,
      metalness: 0.05,
    });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.position.y = 0.45;
    shaft.castShadow = true;
    group.add(shaft);
    this.stickShaftMesh = shaft;

    // Handle grip wrap
    const gripGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.3, 12);
    const gripMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      roughness: 0.9,
    });
    const grip = new THREE.Mesh(gripGeo, gripMat);
    grip.position.y = 0.05;
    group.add(grip);
    this.stickGripMesh = grip;

    // Brass ferrule tip
    const tipGeo = new THREE.ConeGeometry(0.028, 0.08, 12);
    const tipMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.3 });
    const tip = new THREE.Mesh(tipGeo, tipMat);
    tip.position.y = 1.12;
    group.add(tip);

    // Kinetic golden swing slash trail
    const trailGeo = new THREE.PlaneGeometry(0.85, 0.45);
    const trailMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const trail = new THREE.Mesh(trailGeo, trailMat);
    trail.position.set(0, 0.65, -0.12);
    trail.rotation.y = Math.PI / 2;
    group.add(trail);
    this.swingTrailMesh = trail;

    // Position in first-person camera view
    group.position.set(0.32, -0.32, -0.48);
    group.rotation.set(0.35, -0.2, -0.4);

    return group;
  }

  // --- APPLY CUSTOMIZATION (CHARACTER, OUTFIT, STICK) ---
  public applyCustomization(char: CharacterConfig, outfit: OutfitConfig, stick: StickConfig) {
    // Character speed multiplier
    this.speed = this.baseSpeed * (char.speed / 85);
    this.currentPowerMultiplier = stick.powerMultiplier;

    // Update stick materials
    if (this.stickShaftMesh) {
      (this.stickShaftMesh.material as THREE.MeshStandardMaterial).color.set(stick.colorHex);
    }
    if (this.stickGripMesh) {
      (this.stickGripMesh.material as THREE.MeshStandardMaterial).color.set(outfit.colorHex || stick.gripHex);
    }
  }

  // --- TRIGGER SWING ---
  public swing(): boolean {
    if (this.isSwinging) return false;
    this.isSwinging = true;
    this.swingProgress = 0;
    return true;
  }

  // --- MOUSE / TOUCH LOOK INPUT ---
  public handleMouseMove(movementX: number, movementY: number) {
    this.yaw -= movementX * this.mouseSensitivity;
    this.pitch -= movementY * this.mouseSensitivity;
    this.pitch = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, this.pitch));
  }

  // --- RESET POSITION ---
  public reset(pos = new THREE.Vector3(0, 1.65, 3.5), yaw = 0) {
    this.position.copy(pos);
    this.yaw = yaw;
    this.pitch = 0;
    this.isSwinging = false;
    this.swingProgress = 0;
    this.stamina = 100;
  }

  // --- UPDATE MOVEMENT & SWING PHYSICS ---
  public update(delta: number): HitResult | null {
    // Smooth turn input from Q/E, arrow keys or D-Pad
    if (this.turnLeft) this.yaw += delta * 2.2;
    if (this.turnRight) this.yaw -= delta * 2.2;

    // 1. Movement vector in local camera space
    const forward = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
    const moveDir = new THREE.Vector3();

    if (this.moveForward) moveDir.add(forward);
    if (this.moveBackward) moveDir.sub(forward);
    if (this.moveRight) moveDir.add(right);
    if (this.moveLeft) moveDir.sub(right);

    const isMoving = moveDir.lengthSq() > 0.001;
    if (isMoving) {
      moveDir.normalize();

      let currentSpeed = this.speed;
      if (this.isSprinting && this.stamina > 5) {
        currentSpeed *= this.sprintMultiplier;
        this.stamina = Math.max(0, this.stamina - delta * 25);
      } else {
        this.stamina = Math.min(this.maxStamina, this.stamina + delta * 15);
      }

      this.position.addScaledVector(moveDir, currentSpeed * delta);

      // Arena boundary clamp
      this.position.x = Math.max(-12, Math.min(12, this.position.x));
      this.position.z = Math.max(-12, Math.min(12, this.position.z));

      this.headBobTimer += delta * (this.isSprinting ? 14 : 9);
    } else {
      this.stamina = Math.min(this.maxStamina, this.stamina + delta * 20);
      this.headBobTimer += delta * 2;
    }

    const headBobY = Math.sin(this.headBobTimer) * (isMoving ? 0.04 : 0.012);
    const headBobX = Math.cos(this.headBobTimer * 0.5) * (isMoving ? 0.02 : 0.006);

    // Apply to camera
    this.camera.position.set(
      this.position.x + headBobX,
      this.position.y + headBobY,
      this.position.z
    );
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;

    // 2. Physical Stick Animation & Kinetic Swing
    if (this.isSwinging) {
      this.swingProgress += delta / this.swingDuration;
      if (this.swingProgress >= 1.0) {
        this.isSwinging = false;
        this.swingProgress = 0;
      }
    }

    this.animateStick(this.swingProgress);

    // Compute stick tip and base in world coordinates
    const baseLocal = new THREE.Vector3(0, 0.1, 0);
    const tipLocal = new THREE.Vector3(0, 1.15, 0);

    this.stickGroup.localToWorld(baseLocal.copy(baseLocal));
    this.stickGroup.localToWorld(tipLocal.copy(tipLocal));

    this.stickBaseWorld.copy(baseLocal);
    this.stickTipWorld.copy(tipLocal);

    this.swingVelocity.subVectors(this.stickTipWorld, this.prevStickTip).divideScalar(Math.max(0.001, delta));
    this.prevStickTip.copy(this.stickTipWorld);

    return null;
  }

  private animateStick(progress: number) {
    if (!this.isSwinging) {
      if (this.swingTrailMesh) {
        (this.swingTrailMesh.material as THREE.MeshBasicMaterial).opacity = 0;
      }
      const breath = Math.sin(this.headBobTimer) * 0.03;
      this.stickGroup.position.set(0.32, -0.32 + breath, -0.48);
      this.stickGroup.rotation.set(0.35 + breath * 0.5, -0.2, -0.4);
      return;
    }

    if (progress < 0.25) {
      if (this.swingTrailMesh) {
        (this.swingTrailMesh.material as THREE.MeshBasicMaterial).opacity = 0;
      }
      // Windup
      const t = progress / 0.25;
      this.stickGroup.position.set(0.32 + t * 0.1, -0.32 + t * 0.3, -0.48 - t * 0.05);
      this.stickGroup.rotation.set(0.35 + t * 0.9, -0.2 - t * 0.3, -0.4 - t * 0.4);
    } else if (progress < 0.65) {
      // Downward and across strike arc
      const t = (progress - 0.25) / 0.4;
      if (this.swingTrailMesh) {
        const trailAlpha = (1.0 - Math.abs(t - 0.5) * 2.0) * 0.85;
        (this.swingTrailMesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, trailAlpha);
      }
      this.stickGroup.position.set(0.42 - t * 0.7, -0.02 - t * 0.5, -0.53 - t * 0.25);
      this.stickGroup.rotation.set(1.25 - t * 2.5, -0.5 + t * 0.9, -0.8 + t * 1.6);
    } else {
      if (this.swingTrailMesh) {
        (this.swingTrailMesh.material as THREE.MeshBasicMaterial).opacity = 0;
      }
      // Recovery
      const t = (progress - 0.65) / 0.35;
      this.stickGroup.position.set(-0.28 + t * 0.6, -0.52 + t * 0.2, -0.78 + t * 0.3);
      this.stickGroup.rotation.set(-1.25 + t * 1.6, 0.4 - t * 0.6, 0.8 - t * 1.2);
    }
  }

  // --- HIT DETECTION ---
  public testPotHit(potPos: THREE.Vector3, potRadius: number): HitResult {
    if (!this.isSwinging || this.swingProgress < 0.15 || this.swingProgress > 0.85) {
      return { hit: false, quality: 'MISS', impactPoint: new THREE.Vector3(), impactVelocity: new THREE.Vector3(), accuracy: 0 };
    }

    // Distance between player camera and pot
    const distToPot = this.position.distanceTo(potPos);

    // Vector to pot
    const toPot = new THREE.Vector3().subVectors(potPos, this.position);
    const forward = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    const dot = forward.dot(toPot.normalize());

    // 1. Precise stick segment intersection test
    const seg = new THREE.Vector3().subVectors(this.stickTipWorld, this.stickBaseWorld);
    const segLen = seg.length();
    const segDir = seg.clone().normalize();
    const toPotFromStick = new THREE.Vector3().subVectors(potPos, this.stickBaseWorld);
    const projection = toPotFromStick.dot(segDir);
    const tClamped = Math.max(0, Math.min(segLen, projection));
    const closestPoint = new THREE.Vector3().copy(this.stickBaseWorld).addScaledVector(segDir, tClamped);
    const stickDist = closestPoint.distanceTo(potPos);

    // Direct geometric hit OR proximity hit when swinging while facing the pot
    const isDirectHit = stickDist <= (potRadius + 0.35);
    const isProximityHit = distToPot <= 2.3 && dot > 0.65;

    if (isDirectHit || isProximityHit) {
      const speed = Math.max(3.5, this.swingVelocity.length()) * this.currentPowerMultiplier;
      let quality: HitQuality = 'GOOD';
      let accuracy = 75;

      if (distToPot < 1.6 && dot > 0.85) {
        quality = 'PERFECT';
        accuracy = 100;
      } else if (distToPot < 2.0 && dot > 0.75) {
        quality = 'GREAT';
        accuracy = 90;
      } else if (distToPot > 2.2) {
        quality = 'WEAK';
        accuracy = 60;
      }

      return {
        hit: true,
        quality,
        impactPoint: isDirectHit ? closestPoint : potPos.clone(),
        impactVelocity: forward.clone().multiplyScalar(speed),
        accuracy,
      };
    }

    return { hit: false, quality: 'MISS', impactPoint: new THREE.Vector3(), impactVelocity: new THREE.Vector3(), accuracy: 0 };
  }
}
