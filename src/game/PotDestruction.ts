import * as THREE from 'three';

interface Shard {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  rotVelocity: THREE.Vector3;
}

interface Particle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  rotVelocity?: THREE.Vector3;
  life: number;
  maxLife: number;
}

export class PotDestruction {
  public group: THREE.Group;
  public isActive = false;
  public timeDilation = 1.0; // 0.3 during slow-mo

  private shards: Shard[] = [];
  private waterDroplets: Particle[] = [];
  private petals: Particle[] = [];
  private chocolates: Particle[] = [];
  private coins: Particle[] = [];
  private dustPuffs: Particle[] = [];
  private shockwaveMesh: THREE.Mesh | null = null;

  private slowMoTimer = 0;
  private slowMoDuration = 0.5;

  constructor() {
    this.group = new THREE.Group();
  }

  public triggerShatter(origin: THREE.Vector3, strikeImpulse: THREE.Vector3) {
    this.cleanup();
    this.isActive = true;
    this.timeDilation = 0.28;
    this.slowMoTimer = this.slowMoDuration;

    // Golden Expanding Shockwave Ring
    const ringGeo = new THREE.RingGeometry(0.1, 0.35, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    this.shockwaveMesh = new THREE.Mesh(ringGeo, ringMat);
    this.shockwaveMesh.position.copy(origin);
    this.shockwaveMesh.rotation.x = Math.PI / 2;
    this.group.add(this.shockwaveMesh);

    // 1. Ceramic Shards (Predefined fractured pieces)
    const potMat = new THREE.MeshStandardMaterial({
      color: 0xb45309,
      roughness: 0.85,
      metalness: 0.05,
      side: THREE.DoubleSide,
    });

    const shardCount = 28;
    for (let i = 0; i < shardCount; i++) {
      // Irregular curved shard geometry
      const w = 0.12 + Math.random() * 0.18;
      const h = 0.12 + Math.random() * 0.22;
      const shardGeo = new THREE.ConeGeometry(w, h, 3 + Math.floor(Math.random() * 2));
      const shardMesh = new THREE.Mesh(shardGeo, potMat);
      shardMesh.position.copy(origin);
      shardMesh.castShadow = true;

      // Explode outward radially with directional bias from strike
      const dir = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        Math.random() * 1.5 + 0.3,
        (Math.random() - 0.5) * 2
      ).normalize();

      dir.addScaledVector(strikeImpulse.clone().normalize(), 0.6);

      const speed = 4.0 + Math.random() * 6.5;
      const velocity = dir.multiplyScalar(speed);

      const rotVelocity = new THREE.Vector3(
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 15
      );

      this.group.add(shardMesh);
      this.shards.push({ mesh: shardMesh, velocity, rotVelocity });
    }

    // 2. Turmeric / Saffron Water Splashes
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      roughness: 0.1,
      metalness: 0.2,
      transparent: true,
      opacity: 0.85,
    });

    const dropCount = 60;
    for (let j = 0; j < dropCount; j++) {
      const dropGeo = new THREE.SphereGeometry(0.04 + Math.random() * 0.05, 8, 8);
      const dropMesh = new THREE.Mesh(dropGeo, waterMat);
      dropMesh.position.copy(origin);

      const angle = Math.random() * Math.PI * 2;
      const elev = (Math.random() - 0.2) * Math.PI;
      const spd = 3.5 + Math.random() * 5.5;

      const vel = new THREE.Vector3(
        Math.cos(angle) * Math.cos(elev) * spd,
        Math.sin(elev) * spd + 1.2,
        Math.sin(angle) * Math.cos(elev) * spd
      );

      this.group.add(dropMesh);
      this.waterDroplets.push({
        mesh: dropMesh,
        velocity: vel,
        life: 0,
        maxLife: 1.8 + Math.random() * 0.8,
      });
    }

    // 3. MASSIVE SHOWER OF MARIGOLD, ROSE & JASMINE FLOWERS
    const petalColors = [
      0xfbbf24, // Bright Golden Marigold
      0xf59e0b, // Saffron Orange Marigold
      0xea580c, // Deep Tangerine
      0xdc2626, // Crimson Festival Rose
      0xf43f5e, // Pink Lotus / Rose
      0xfffbeb, // Fresh Jasmine White
    ];
    const flowerCount = 180;
    for (let k = 0; k < flowerCount; k++) {
      const pColor = petalColors[Math.floor(Math.random() * petalColors.length)];
      const isBlossom = Math.random() > 0.75;

      let pGeo: THREE.BufferGeometry;
      if (isBlossom) {
        // Whole marigold blossom head
        pGeo = new THREE.DodecahedronGeometry(0.06 + Math.random() * 0.04);
      } else {
        // Flat fluttering petal
        pGeo = new THREE.PlaneGeometry(0.09 + Math.random() * 0.05, 0.14 + Math.random() * 0.08);
      }

      const pMat = new THREE.MeshStandardMaterial({
        color: pColor,
        roughness: 0.65,
        side: THREE.DoubleSide,
      });

      const pMesh = new THREE.Mesh(pGeo, pMat);
      pMesh.position.copy(origin);
      pMesh.castShadow = true;

      // Burst outward with wide festive shower arc
      const pAngle = Math.random() * Math.PI * 2;
      const pRadius = 1.2 + Math.random() * 5.0;
      const pVel = new THREE.Vector3(
        Math.cos(pAngle) * pRadius,
        Math.random() * 4.5 + 2.0, // Upward initial fountain
        Math.sin(pAngle) * pRadius
      );

      const pRot = new THREE.Vector3(
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 12
      );

      this.group.add(pMesh);
      this.petals.push({
        mesh: pMesh,
        velocity: pVel,
        rotVelocity: pRot,
        life: 0,
        maxLife: 4.5 + Math.random() * 2.0,
      });
    }

    // 4. FESTIVE SHOWER OF WRAPPED CHOCOLATES & CANDIES (மிட்டாய் / சாக்லேட்)
    const foilColors = [
      0xf59e0b, // Shiny Gold Foil
      0xdc2626, // Ruby Red Foil
      0x2563eb, // Royal Blue Foil
      0x16a34a, // Emerald Green Foil
      0x9333ea, // Cadbury Silk Purple
      0xec4899, // Shiny Magenta
      0xf1f5f9, // Silver Platinum
    ];

    const chocolateCount = 55;
    for (let m = 0; m < chocolateCount; m++) {
      const foilColor = foilColors[Math.floor(Math.random() * foilColors.length)];
      const chocMat = new THREE.MeshStandardMaterial({
        color: foilColor,
        metalness: 0.85,
        roughness: 0.22,
      });

      const chocType = Math.random();
      let chocGeo: THREE.BufferGeometry;

      if (chocType < 0.4) {
        // Rectangular Mini Chocolate Bar
        chocGeo = new THREE.BoxGeometry(0.12, 0.04, 0.07);
      } else if (chocType < 0.75) {
        // Twist-Wrapped Festival Toffee (Candy cylinder)
        chocGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.12, 8);
      } else {
        // Golden Chocolate Truffle Sphere
        chocGeo = new THREE.SphereGeometry(0.05, 8, 8);
      }

      const chocMesh = new THREE.Mesh(chocGeo, chocMat);
      chocMesh.position.copy(origin);
      chocMesh.castShadow = true;

      // Explode outward radially from pot center
      const cAngle = Math.random() * Math.PI * 2;
      const cSpeed = 2.0 + Math.random() * 4.5;
      const cVel = new THREE.Vector3(
        Math.cos(cAngle) * cSpeed,
        Math.random() * 4.8 + 2.2, // Upward leap before raining down
        Math.sin(cAngle) * cSpeed
      );

      // Add directional bias from the lathi stick strike
      cVel.addScaledVector(strikeImpulse.clone().normalize(), 0.8);

      const cRot = new THREE.Vector3(
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) * 14
      );

      this.group.add(chocMesh);
      this.chocolates.push({
        mesh: chocMesh,
        velocity: cVel,
        rotVelocity: cRot,
        life: 0,
        maxLife: 5.0,
      });
    }

    // 4. Golden Coins (Porkasu)
    const coinMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.9,
      roughness: 0.2,
    });
    for (let c = 0; c < 20; c++) {
      const cGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.02, 10);
      const cMesh = new THREE.Mesh(cGeo, coinMat);
      cMesh.position.copy(origin);
      cMesh.castShadow = true;

      const cVel = new THREE.Vector3(
        (Math.random() - 0.5) * 3.5,
        Math.random() * 4.0 + 1.0,
        (Math.random() - 0.5) * 3.5
      );
      this.group.add(cMesh);
      this.coins.push({
        mesh: cMesh,
        velocity: cVel,
        rotVelocity: new THREE.Vector3(Math.random() * 10, Math.random() * 10, Math.random() * 10),
        life: 0,
        maxLife: 4.0,
      });
    }

    // 5. Terracotta Clay Dust Cloud
    const dustMat = new THREE.MeshBasicMaterial({
      color: 0xb45309,
      transparent: true,
      opacity: 0.55,
    });
    for (let d = 0; d < 12; d++) {
      const dGeo = new THREE.DodecahedronGeometry(0.3 + Math.random() * 0.35);
      const dMesh = new THREE.Mesh(dGeo, dustMat);
      dMesh.position.copy(origin);

      const dVel = new THREE.Vector3(
        (Math.random() - 0.5) * 2.0,
        Math.random() * 1.5 + 0.2,
        (Math.random() - 0.5) * 2.0
      );

      this.group.add(dMesh);
      this.dustPuffs.push({
        mesh: dMesh,
        velocity: dVel,
        life: 0,
        maxLife: 1.2,
      });
    }
  }

  public update(delta: number) {
    if (!this.isActive) return;

    // Slow-motion recovery curve
    if (this.slowMoTimer > 0) {
      this.slowMoTimer -= delta;
      if (this.slowMoTimer <= 0) {
        this.timeDilation = 1.0;
      } else {
        const progress = 1.0 - this.slowMoTimer / this.slowMoDuration;
        this.timeDilation = 0.28 + progress * 0.72;
      }
    }

    const simDelta = delta * this.timeDilation;
    const gravity = -9.81;

    // Update Shards
    for (let i = 0; i < this.shards.length; i++) {
      const s = this.shards[i];
      s.velocity.y += gravity * simDelta;
      s.mesh.position.addScaledVector(s.velocity, simDelta);
      s.mesh.rotation.x += s.rotVelocity.x * simDelta;
      s.mesh.rotation.y += s.rotVelocity.y * simDelta;
      s.mesh.rotation.z += s.rotVelocity.z * simDelta;

      // Ground bounce
      if (s.mesh.position.y < 0.08) {
        s.mesh.position.y = 0.08;
        s.velocity.y *= -0.35;
        s.velocity.x *= 0.7;
        s.velocity.z *= 0.7;
        s.rotVelocity.multiplyScalar(0.7);
      }
    }

    // Update Water Droplets
    for (let j = 0; j < this.waterDroplets.length; j++) {
      const w = this.waterDroplets[j];
      w.life += simDelta;
      w.velocity.y += gravity * simDelta;
      w.mesh.position.addScaledVector(w.velocity, simDelta);

      if (w.mesh.position.y < 0.02) {
        w.mesh.position.y = 0.02;
        w.velocity.set(0, 0, 0);
        // Flatten into puddle
        w.mesh.scale.set(1.5, 0.1, 1.5);
      }
    }

    // Update Floating Petals (gentle aerodynamic flutter & swirling draft)
    for (let k = 0; k < this.petals.length; k++) {
      const p = this.petals[k];
      p.life += simDelta;
      p.velocity.y += (gravity * 0.22) * simDelta;
      p.velocity.y = Math.max(-0.85, p.velocity.y); // Gentle terminal fall velocity

      // Swirling air turbulence
      p.mesh.position.x += Math.sin(p.life * 4 + k) * 0.012;
      p.mesh.position.z += Math.cos(p.life * 4 + k) * 0.012;
      p.mesh.position.addScaledVector(p.velocity, simDelta);

      if (p.rotVelocity) {
        p.mesh.rotation.x += p.rotVelocity.x * simDelta;
        p.mesh.rotation.y += p.rotVelocity.y * simDelta;
        p.mesh.rotation.z += (p.rotVelocity.z + Math.sin(p.life * 5)) * simDelta;
      }

      if (p.mesh.position.y < 0.015) {
        p.mesh.position.y = 0.015;
        p.velocity.set(0, 0, 0);
      }
    }

    // Update Chocolates & Candies (Gravity + Ground Bouncing & Tumbling on Arena Sand)
    for (let m = 0; m < this.chocolates.length; m++) {
      const choc = this.chocolates[m];
      choc.life += simDelta;
      choc.velocity.y += gravity * simDelta;
      choc.mesh.position.addScaledVector(choc.velocity, simDelta);

      if (choc.rotVelocity) {
        choc.mesh.rotation.x += choc.rotVelocity.x * simDelta;
        choc.mesh.rotation.y += choc.rotVelocity.y * simDelta;
        choc.mesh.rotation.z += choc.rotVelocity.z * simDelta;
      }

      // Ground bounce & tumble on sand
      if (choc.mesh.position.y < 0.04) {
        choc.mesh.position.y = 0.04;
        choc.velocity.y *= -0.45; // Energetic bounce
        choc.velocity.x *= 0.72;
        choc.velocity.z *= 0.72;
        if (choc.rotVelocity) choc.rotVelocity.multiplyScalar(0.7);
      }
    }

    // Update Coins
    for (let c = 0; c < this.coins.length; c++) {
      const coin = this.coins[c];
      coin.life += simDelta;
      coin.velocity.y += gravity * simDelta;
      coin.mesh.position.addScaledVector(coin.velocity, simDelta);
      if (coin.rotVelocity) {
        coin.mesh.rotation.x += coin.rotVelocity.x * simDelta;
      }
      if (coin.mesh.position.y < 0.02) {
        coin.mesh.position.y = 0.02;
        coin.velocity.y *= -0.4;
        coin.velocity.x *= 0.6;
        coin.velocity.z *= 0.6;
      }
    }

    // Update Dust Puffs
    for (let d = 0; d < this.dustPuffs.length; d++) {
      const dust = this.dustPuffs[d];
      dust.life += simDelta;
      dust.mesh.position.addScaledVector(dust.velocity, simDelta);
      const scale = 1.0 + (dust.life / dust.maxLife) * 2.5;
      dust.mesh.scale.set(scale, scale, scale);
      (dust.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(
        0,
        0.55 * (1.0 - dust.life / dust.maxLife)
      );
    }

    // Update Shockwave Ring Expansion & Fade
    if (this.shockwaveMesh) {
      const currentScale = this.shockwaveMesh.scale.x + simDelta * 7.5;
      this.shockwaveMesh.scale.set(currentScale, currentScale, currentScale);
      const mat = this.shockwaveMesh.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, mat.opacity - simDelta * 2.2);
    }
  }

  public cleanup() {
    while (this.group.children.length > 0) {
      const child = this.group.children[0] as THREE.Mesh;
      if (child.geometry) child.geometry.dispose();
      this.group.remove(child);
    }
    this.shards = [];
    this.waterDroplets = [];
    this.petals = [];
    this.chocolates = [];
    this.coins = [];
    this.dustPuffs = [];
    this.shockwaveMesh = null;
    this.isActive = false;
    this.timeDilation = 1.0;
  }
}
