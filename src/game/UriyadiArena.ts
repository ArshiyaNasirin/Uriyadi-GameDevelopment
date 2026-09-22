import * as THREE from 'three';
import { audioEngine } from '../audio/WebAudioEngine';

export class UriyadiArena {
  public group: THREE.Group;
  public potMesh: THREE.Group;
  public potWorldPosition = new THREE.Vector3();
  public potRadius = 0.42;

  // Pendulum Physics state
  private anchorPosition = new THREE.Vector3(0, 5.8, 0);
  private ropeLength = 2.8;
  private currentRopeLength = 2.8;
  private targetRopeLength = 2.8;
  private potAngle = new THREE.Vector2(0, 0); // X and Z swing angles
  private potAngleVelocity = new THREE.Vector2(0, 0);
  private ropeLine: THREE.Line;
  private ropeGeometry: THREE.BufferGeometry;

  // Pulley & Boss mechanics
  public isPulleyActive = false;
  private pulleyTimer = 0;
  private pulleyInterval = 4.0;
  private windFactor = 0.2;

  constructor() {
    this.group = new THREE.Group();

    this.buildGallowsStructure();
    this.potMesh = this.buildTerracottaPot();
    this.group.add(this.potMesh);

    // Dynamic Rope
    this.ropeGeometry = new THREE.BufferGeometry().setFromPoints([
      this.anchorPosition,
      new THREE.Vector3(0, 3.0, 0),
    ]);
    const ropeMat = new THREE.LineBasicMaterial({ color: 0x78350f, linewidth: 3 });
    this.ropeLine = new THREE.Line(this.ropeGeometry, ropeMat);
    this.group.add(this.ropeLine);

    this.updatePotPosition();
  }

  // --- 1. WOODEN GALLOWS / SCAFFOLDING POSTS ---
  private buildGallowsStructure() {
    const woodMat = new THREE.MeshStandardMaterial({
      color: 0x451a03,
      roughness: 0.85,
    });
    const ropeWrapMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.9,
    });

    // Two tall upright wooden poles
    const poleH = 6.8;
    for (const px of [-3.2, 3.2]) {
      const poleGeo = new THREE.CylinderGeometry(0.2, 0.25, poleH, 12);
      const pole = new THREE.Mesh(poleGeo, woodMat);
      pole.position.set(px, poleH / 2, 0);
      pole.castShadow = true;
      pole.receiveShadow = true;
      this.group.add(pole);

      // Coir rope wraps at pole joints
      const wrapGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.6, 12);
      const wrap = new THREE.Mesh(wrapGeo, ropeWrapMat);
      wrap.position.set(px, poleH - 0.4, 0);
      this.group.add(wrap);
    }

    // Top crossbeam
    const beamGeo = new THREE.BoxGeometry(7.2, 0.35, 0.35);
    const beam = new THREE.Mesh(beamGeo, woodMat);
    beam.position.set(0, poleH - 0.2, 0);
    beam.castShadow = true;
    this.group.add(beam);

    // Central Pulley wheel (Kapila/Rattinam)
    const pulleyGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.15, 16);
    const pulley = new THREE.Mesh(pulleyGeo, woodMat);
    pulley.rotation.z = Math.PI / 2;
    pulley.position.set(0, poleH - 0.55, 0);
    this.group.add(pulley);
    this.anchorPosition.set(0, poleH - 0.55, 0);

    // Decorative Mango leaf & Marigold garland across the crossbeam
    const garlandPoints = 16;
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x15803d, side: THREE.DoubleSide });
    const marigoldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.8 });

    for (let i = 0; i < garlandPoints; i++) {
      const gx = -3.0 + (i / (garlandPoints - 1)) * 6.0;
      const catenary = Math.sin((i / (garlandPoints - 1)) * Math.PI) * 0.45;
      const leafGeo = new THREE.PlaneGeometry(0.25, 0.6);
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.position.set(gx, poleH - 0.4 - catenary, 0.2);
      leaf.rotation.z = Math.sin(i * 0.8) * 0.2;
      this.group.add(leaf);

      if (i % 2 === 0) {
        const flGeo = new THREE.SphereGeometry(0.09, 6, 6);
        const fl = new THREE.Mesh(flGeo, marigoldMat);
        fl.position.set(gx, poleH - 0.45 - catenary, 0.25);
        this.group.add(fl);
      }
    }

    // Top Toranam Bunting String directly on the gallows (Matching Reference 1)
    const toranColors = [0xdc2626, 0xf59e0b, 0x2563eb, 0x16a34a, 0xec4899];
    for (let f = 0; f < 18; f++) {
      const fx = -3.2 + (f / 17) * 6.4;
      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      shape.lineTo(0.2, 0);
      shape.lineTo(0.1, -0.45);
      shape.closePath();
      const fGeo = new THREE.ShapeGeometry(shape);
      const fMat = new THREE.MeshStandardMaterial({ color: toranColors[f % toranColors.length], side: THREE.DoubleSide });
      const fMesh = new THREE.Mesh(fGeo, fMat);
      fMesh.position.set(fx, poleH + 0.15, 0);
      this.group.add(fMesh);
    }
  }

  // --- 2. AUTHENTIC HANDMADE TERRACOTTA POT ---
  private buildTerracottaPot(): THREE.Group {
    const potGroup = new THREE.Group();

    // Canvas procedural texture for traditional pot markings (chunam stripes and red tilak)
    const potCanvas = document.createElement('canvas');
    potCanvas.width = 512;
    potCanvas.height = 512;
    const ctx = potCanvas.getContext('2d')!;

    // Rich polished South Indian terracotta clay tone
    const clayGrad = ctx.createLinearGradient(0, 0, 0, 512);
    clayGrad.addColorStop(0, '#5a2208');
    clayGrad.addColorStop(0.3, '#8c3812');
    clayGrad.addColorStop(0.7, '#a24419');
    clayGrad.addColorStop(1, '#66270b');
    ctx.fillStyle = clayGrad;
    ctx.fillRect(0, 0, 512, 512);

    // Pottery wheel burnish grooves
    for (let y = 0; y < 512; y += 6) {
      ctx.fillStyle = 'rgba(60, 20, 5, 0.18)';
      ctx.fillRect(0, y, 512, 2);
    }

    // Sacred Chunam (White lime chalk) & Kumkum geometric patterns matching reference Image 2
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;

    // Top border stripes
    ctx.beginPath();
    ctx.moveTo(0, 110); ctx.lineTo(512, 110);
    ctx.moveTo(0, 125); ctx.lineTo(512, 125);
    ctx.moveTo(0, 390); ctx.lineTo(512, 390);
    ctx.moveTo(0, 405); ctx.lineTo(512, 405);
    ctx.stroke();

    // Red Kumkum central band
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(0, 240, 512, 32);

    // Intricate white chevron zigzag band (traditional Pongal paanai)
    ctx.beginPath();
    for (let x = 0; x <= 512; x += 16) {
      const isUp = (x / 16) % 2 === 0;
      if (x === 0) ctx.moveTo(x, isUp ? 140 : 165);
      else ctx.lineTo(x, isUp ? 140 : 165);
    }
    ctx.stroke();

    // White tribal diamonds & circles band
    for (let x = 16; x < 512; x += 32) {
      // Diamond
      ctx.beginPath();
      ctx.moveTo(x, 195);
      ctx.lineTo(x + 10, 210);
      ctx.lineTo(x, 225);
      ctx.lineTo(x - 10, 210);
      ctx.closePath();
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // Red center dot
      ctx.beginPath();
      ctx.arc(x, 210, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#dc2626';
      ctx.fill();

      // White sun ray dots on red band
      ctx.beginPath();
      ctx.arc(x, 256, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // Lower decorative petal
      ctx.beginPath();
      ctx.arc(x, 320, 10, 0, Math.PI);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

    // Traditional Tamil Thiruman / Tilak mark (Namam) on the face of the pot
    const centerX = 256;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(centerX - 18, 200, 8, 110);
    ctx.fillRect(centerX + 10, 200, 8, 110);
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(centerX - 4, 190, 8, 130);

    const potTex = new THREE.CanvasTexture(potCanvas);
    const potMat = new THREE.MeshStandardMaterial({
      map: potTex,
      roughness: 0.78,
      metalness: 0.05,
    });

    // Bulbous pot body
    const bodyGeo = new THREE.SphereGeometry(this.potRadius, 24, 20);
    const body = new THREE.Mesh(bodyGeo, potMat);
    body.castShadow = true;
    potGroup.add(body);

    // Narrow neck and wide flared rim
    const neckGeo = new THREE.CylinderGeometry(0.24, 0.32, 0.22, 20);
    const neck = new THREE.Mesh(neckGeo, potMat);
    neck.position.y = this.potRadius * 0.85;
    potGroup.add(neck);

    const rimGeo = new THREE.TorusGeometry(0.28, 0.05, 8, 20);
    const rim = new THREE.Mesh(rimGeo, potMat);
    rim.position.y = this.potRadius * 0.95;
    rim.rotation.x = Math.PI / 2;
    potGroup.add(rim);

    // Marigold & Jasmine flower garland ring around pot neck
    const marigoldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.9 });
    const flowerCount = 14;
    for (let f = 0; f < flowerCount; f++) {
      const fAngle = (f / flowerCount) * Math.PI * 2;
      const fx = Math.cos(fAngle) * 0.32;
      const fz = Math.sin(fAngle) * 0.32;
      const flGeo = new THREE.DodecahedronGeometry(0.065);
      const flMesh = new THREE.Mesh(flGeo, marigoldMat);
      flMesh.position.set(fx, this.potRadius * 0.8, fz);
      potGroup.add(flMesh);
    }

    // Coir rope harness cradle supporting the pot
    const harnessMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.9 });
    const ringGeo = new THREE.TorusGeometry(0.38, 0.03, 6, 20);
    const ring = new THREE.Mesh(ringGeo, harnessMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -this.potRadius * 0.2;
    potGroup.add(ring);

    return potGroup;
  }

  // --- CONFIGURATION ---
  public configureLevel(baseHeight: number, _swingMultiplier: number, wind: number, pulley: boolean, interval: number) {
    this.ropeLength = 5.8 - baseHeight;
    this.currentRopeLength = this.ropeLength;
    this.targetRopeLength = this.ropeLength;
    this.windFactor = wind;
    this.isPulleyActive = pulley;
    this.pulleyInterval = Math.max(1.5, interval);
  }

  // --- PHYSICS IMPULSE (WHEN STRUCK BY STICK) ---
  public applyImpulse(impulseVector: THREE.Vector3) {
    // Convert impulse to angular acceleration on the pendulum
    const forceX = impulseVector.x / this.currentRopeLength;
    const forceZ = impulseVector.z / this.currentRopeLength;
    this.potAngleVelocity.x += forceZ * 2.2;
    this.potAngleVelocity.y += forceX * 2.2;
  }

  // --- UPDATE PENDULUM MOTION & ROPE PULLEY ---
  public update(delta: number, elapsed: number) {
    // 1. Rope Pulley Height Mechanics (Periya Chinna Boss Action)
    if (this.isPulleyActive) {
      this.pulleyTimer += delta;
      if (this.pulleyTimer >= this.pulleyInterval) {
        this.pulleyTimer = 0;
        // Jerk the pot up by 0.6m to 1.2m or drop it
        const randomShift = (Math.random() - 0.4) * 1.0;
        this.targetRopeLength = Math.max(1.5, Math.min(3.8, this.ropeLength - randomShift));
        audioEngine.playRopeCreak(0.65);
      }
    }
    // Smoothly interpolate current rope length
    this.currentRopeLength += (this.targetRopeLength - this.currentRopeLength) * delta * 2.5;

    // 2. Pendulum harmonic physics with gravity & damping
    const gravity = 9.81;
    const damping = 0.985;
    const omegaSq = gravity / Math.max(1.0, this.currentRopeLength);

    // Wind turbulence perturbation
    const windX = Math.sin(elapsed * 1.8) * this.windFactor * 0.15;
    const windZ = Math.cos(elapsed * 1.3) * this.windFactor * 0.15;

    // Euler integration
    this.potAngleVelocity.x += (-omegaSq * Math.sin(this.potAngle.x) + windX) * delta;
    this.potAngleVelocity.y += (-omegaSq * Math.sin(this.potAngle.y) + windZ) * delta;

    this.potAngleVelocity.x *= damping;
    this.potAngleVelocity.y *= damping;

    this.potAngle.x += this.potAngleVelocity.x * delta;
    this.potAngle.y += this.potAngleVelocity.y * delta;

    this.updatePotPosition();
  }

  private updatePotPosition() {
    // Spherical pendulum coordinates
    const px = this.anchorPosition.x + Math.sin(this.potAngle.y) * this.currentRopeLength;
    const py = this.anchorPosition.y - Math.cos(this.potAngle.x) * Math.cos(this.potAngle.y) * this.currentRopeLength;
    const pz = this.anchorPosition.z + Math.sin(this.potAngle.x) * this.currentRopeLength;

    this.potMesh.position.set(px, py, pz);
    this.potMesh.rotation.z = -this.potAngle.y * 0.7;
    this.potMesh.rotation.x = this.potAngle.x * 0.7;

    this.potMesh.getWorldPosition(this.potWorldPosition);

    // Update dynamic rope line endpoints
    const positions = (this.ropeGeometry.attributes.position as THREE.BufferAttribute).array as Float32Array;
    positions[0] = this.anchorPosition.x;
    positions[1] = this.anchorPosition.y;
    positions[2] = this.anchorPosition.z;
    positions[3] = px;
    positions[4] = py + this.potRadius * 0.9;
    positions[5] = pz;
    this.ropeGeometry.attributes.position.needsUpdate = true;
  }
}
