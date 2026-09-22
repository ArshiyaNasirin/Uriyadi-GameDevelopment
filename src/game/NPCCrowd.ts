import * as THREE from 'three';

export type CrowdMood = 'CONVERSATIONAL' | 'ATTENTIVE' | 'REACTION_MISS' | 'REACTION_HIT' | 'CELEBRATION';

interface NPC {
  group: THREE.Group;
  leftArm: THREE.Mesh;
  rightArm: THREE.Mesh;
  head: THREE.Mesh;
  baseY: number;
  phase: number;
  speed: number;
}

export class NPCCrowd {
  public group: THREE.Group;
  private npcs: NPC[] = [];
  public mood: CrowdMood = 'CONVERSATIONAL';

  constructor() {
    this.group = new THREE.Group();
    this.buildCrowd();
  }

  private buildCrowd() {
    const crowdCount = 36;
    const radiusMin = 8.5;
    const radiusMax = 11.2;

    const skinColors = [0x8d5524, 0xc68642, 0xe0ac69, 0x6e3c15];
    const attireColors = [
      0xfbbf24, // Turmeric Yellow
      0xdc2626, // Kumkum Red
      0x16a34a, // Emerald Leaf Green
      0x2563eb, // Royal Blue
      0x9333ea, // Festive Violet
      0xf8fafc, // Pure Veshti White
      0xec4899, // Rani Pink
    ];

    for (let i = 0; i < crowdCount; i++) {
      const npcGroup = new THREE.Group();
      const angle = (i / crowdCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.15;
      const dist = radiusMin + Math.random() * (radiusMax - radiusMin);

      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;
      npcGroup.position.set(x, 0, z);

      // Face toward center arena
      npcGroup.lookAt(0, 1.5, 0);

      const skinMat = new THREE.MeshStandardMaterial({
        color: skinColors[Math.floor(Math.random() * skinColors.length)],
        roughness: 0.8,
      });

      const shirtColor = attireColors[Math.floor(Math.random() * attireColors.length)];
      const bottomColor = attireColors[Math.floor(Math.random() * attireColors.length)];

      const shirtMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.7 });
      const bottomMat = new THREE.MeshStandardMaterial({ color: bottomColor, roughness: 0.8 });

      // Torso / Shirt
      const torsoGeo = new THREE.BoxGeometry(0.48, 0.65, 0.28);
      const torso = new THREE.Mesh(torsoGeo, shirtMat);
      torso.position.y = 1.15;
      torso.castShadow = true;
      npcGroup.add(torso);

      // Bottom / Veshti or Saree
      const bottomGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.85, 10);
      const bottom = new THREE.Mesh(bottomGeo, bottomMat);
      bottom.position.y = 0.42;
      bottom.castShadow = true;
      npcGroup.add(bottom);

      // Head
      const headGeo = new THREE.SphereGeometry(0.16, 12, 12);
      const head = new THREE.Mesh(headGeo, skinMat);
      head.position.y = 1.62;
      npcGroup.add(head);

      // Headwear: Traditional Straw Hat (Ref 1), Turban, or Hair Bun with Jasmine
      const headwearRoll = Math.random();
      if (headwearRoll < 0.35) {
        // Traditional Straw Hat (Thoppi) as seen in Reference 1!
        const strawMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.9 });
        const brimGeo = new THREE.CylinderGeometry(0.38, 0.42, 0.05, 12);
        const brim = new THREE.Mesh(brimGeo, strawMat);
        brim.position.y = 1.74;
        npcGroup.add(brim);

        const crownGeo = new THREE.ConeGeometry(0.24, 0.28, 10);
        const crown = new THREE.Mesh(crownGeo, strawMat);
        crown.position.y = 1.88;
        npcGroup.add(crown);
      } else if (headwearRoll < 0.6) {
        // Red/Orange Festival Turban
        const turbanMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.8 });
        const turbanGeo = new THREE.TorusGeometry(0.18, 0.08, 8, 12);
        const turban = new THREE.Mesh(turbanGeo, turbanMat);
        turban.rotation.x = Math.PI / 2;
        turban.position.y = 1.72;
        npcGroup.add(turban);
      } else if (headwearRoll < 0.8) {
        // Female Hair Bun with Jasmine Garland (Malli poo)
        const hairMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.9 });
        const bunGeo = new THREE.SphereGeometry(0.1, 8, 8);
        const bun = new THREE.Mesh(bunGeo, hairMat);
        bun.position.set(0, 1.62, -0.16);
        npcGroup.add(bun);

        const jasmineMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
        const flowerRingGeo = new THREE.TorusGeometry(0.12, 0.035, 6, 12);
        const flowerRing = new THREE.Mesh(flowerRingGeo, jasmineMat);
        flowerRing.position.set(0, 1.62, -0.15);
        npcGroup.add(flowerRing);
      }

      // Waist Sash / Angavastram (Thundu)
      if (Math.random() > 0.4) {
        const sashColor = attireColors[Math.floor(Math.random() * attireColors.length)];
        const sashMat = new THREE.MeshStandardMaterial({ color: sashColor, roughness: 0.7 });
        const sashGeo = new THREE.BoxGeometry(0.52, 0.12, 0.32);
        const sash = new THREE.Mesh(sashGeo, sashMat);
        sash.position.y = 0.82;
        npcGroup.add(sash);
      }

      // Scale variation (adults, youths, children)
      const scaleVariation = 0.82 + Math.random() * 0.28;
      npcGroup.scale.setScalar(scaleVariation);

      // Arms
      const armGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.55, 8);

      const leftArm = new THREE.Mesh(armGeo, skinMat);
      leftArm.position.set(-0.32, 1.15, 0);
      npcGroup.add(leftArm);

      const rightArm = new THREE.Mesh(armGeo, skinMat);
      rightArm.position.set(0.32, 1.15, 0);
      npcGroup.add(rightArm);

      this.group.add(npcGroup);
      this.npcs.push({
        group: npcGroup,
        leftArm,
        rightArm,
        head,
        baseY: 0,
        phase: Math.random() * Math.PI * 2,
        speed: 1.8 + Math.random() * 1.5,
      });
    }
  }

  public setMood(mood: CrowdMood) {
    this.mood = mood;
  }

  public update(_delta: number, elapsed: number, targetLookPos?: THREE.Vector3) {
    for (let i = 0; i < this.npcs.length; i++) {
      const npc = this.npcs[i];
      const t = elapsed * npc.speed + npc.phase;

      // Dynamic head look-at tracking toward the pot
      if (targetLookPos && this.mood !== 'REACTION_MISS') {
        const npcWorld = new THREE.Vector3();
        npc.group.getWorldPosition(npcWorld);
        const toTarget = new THREE.Vector3().subVectors(targetLookPos, npcWorld);
        const targetYaw = Math.atan2(toTarget.x, toTarget.z) - npc.group.rotation.y;
        npc.head.rotation.y = THREE.MathUtils.lerp(npc.head.rotation.y, Math.max(-0.6, Math.min(0.6, targetYaw)), 0.05);
      }

      if (this.mood === 'CONVERSATIONAL') {
        // Subtle sway & head nod
        npc.group.position.y = npc.baseY + Math.sin(t) * 0.015;
        if (!targetLookPos) npc.head.rotation.y = Math.sin(t * 0.5) * 0.2;
        npc.leftArm.rotation.x = Math.sin(t * 0.8) * 0.15;
        npc.rightArm.rotation.x = -Math.sin(t * 0.8) * 0.15;
      } else if (this.mood === 'ATTENTIVE') {
        // Leaning in, focused stillness
        npc.group.position.y = npc.baseY;
        npc.leftArm.rotation.x = 0.2;
        npc.rightArm.rotation.x = 0.2;
      } else if (this.mood === 'REACTION_MISS') {
        // Disappointed head shake
        npc.head.rotation.y = Math.sin(elapsed * 12 + npc.phase) * 0.35;
        npc.leftArm.rotation.x = 0.4;
        npc.rightArm.rotation.x = 0.4;
      } else if (this.mood === 'REACTION_HIT') {
        // Clapping hands together
        const clap = Math.sin(elapsed * 18 + npc.phase);
        npc.group.position.y = npc.baseY + Math.abs(clap) * 0.06;
        npc.leftArm.rotation.z = -0.4 + clap * 0.3;
        npc.rightArm.rotation.z = 0.4 - clap * 0.3;
        npc.leftArm.rotation.x = 0.8;
        npc.rightArm.rotation.x = 0.8;
      } else if (this.mood === 'CELEBRATION') {
        // Wild jumping and waving both hands overhead!
        const jump = Math.abs(Math.sin(elapsed * 8 + npc.phase)) * 0.35;
        npc.group.position.y = npc.baseY + jump;
        npc.leftArm.rotation.x = -Math.PI * 0.85 + Math.sin(elapsed * 10 + npc.phase) * 0.4;
        npc.rightArm.rotation.x = -Math.PI * 0.85 + Math.cos(elapsed * 10 + npc.phase) * 0.4;
        npc.head.rotation.y = Math.sin(elapsed * 6) * 0.25;
      }
    }
  }
}
