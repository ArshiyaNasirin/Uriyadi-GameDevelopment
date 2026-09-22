import * as THREE from 'three';
import { TimeOfDay } from '../types';

export class VillageScene {
  public group: THREE.Group;
  private animatedFronds: THREE.Mesh[] = [];
  private oilLampLights: THREE.PointLight[] = [];
  private sunLight: THREE.DirectionalLight;
  private hemiLight: THREE.HemisphereLight;
  private ambientLight: THREE.AmbientLight;
  private dustPoints: THREE.Points | null = null;
  private buntingFlags: THREE.Mesh[] = [];
  private skyMesh: THREE.Mesh | null = null;

  // Animated festival elements
  private ferrisWheelRim: THREE.Group | null = null;
  private ferrisGondolas: THREE.Group[] = [];
  private carouselPlatform: THREE.Group | null = null;
  private animatedKites: { group: THREE.Group; baseY: number; phase: number; speed: number }[] = [];
  private animatedElephantTrunk: THREE.Mesh | null = null;

  constructor() {
    this.group = new THREE.Group();

    // Lighting — warm, rich, vibrant festival sunlight
    this.ambientLight = new THREE.AmbientLight(0xfff1db, 0.6);
    this.group.add(this.ambientLight);

    this.hemiLight = new THREE.HemisphereLight(0x7ec8f8, 0x4a7c3f, 0.75);
    this.group.add(this.hemiLight);

    this.sunLight = new THREE.DirectionalLight(0xfffae6, 1.5);
    this.sunLight.position.set(32, 52, 28);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 130;
    this.sunLight.shadow.camera.left = -40;
    this.sunLight.shadow.camera.right = 40;
    this.sunLight.shadow.camera.top = 40;
    this.sunLight.shadow.camera.bottom = -40;
    this.sunLight.shadow.bias = -0.0005;
    this.group.add(this.sunLight);

    this.buildSkyDomeAndKites();
    this.buildGroundAndKolam();
    this.buildTempleGopuram();
    this.buildFerrisWheel();
    this.buildCarousel();
    this.buildFestivalStalls();
    this.buildPongalAndSugarcane();
    this.buildFestivalAnimals();
    this.buildVillageHouses();
    this.buildVegetation();
    this.buildFestivalDecorations();
    this.buildBullockCartAndProps();
    this.buildAtmosphericParticles();
  }

  // =========================================================================
  // 0. SKY DOME & FLYING FESTIVAL KITES (PATAM)
  // =========================================================================
  private buildSkyDomeAndKites() {
    const skyCanvas = document.createElement('canvas');
    skyCanvas.width = 1024;
    skyCanvas.height = 512;
    const ctx = skyCanvas.getContext('2d')!;

    // Rich South Indian blue sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#1d8cf8');    // Deep vibrant zenith blue
    grad.addColorStop(0.28, '#4ea7ff'); // Bright sky blue
    grad.addColorStop(0.55, '#82cbf8'); // Soft sunny cyan
    grad.addColorStop(0.8, '#bde6fd');  // Horizon mist
    grad.addColorStop(1, '#f1f8fc');    // Pale warm haze at base
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);

    // Fluffy painted cumulus clouds
    ctx.globalAlpha = 0.88;
    const drawCloud = (cx: number, cy: number, size: number) => {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, cy, size, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath();
      ctx.arc(cx - size * 0.65, cy + size * 0.15, size * 0.68, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + size * 0.75, cy + size * 0.12, size * 0.72, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + size * 0.28, cy - size * 0.38, size * 0.62, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath();
      ctx.arc(cx - size * 0.28, cy - size * 0.28, size * 0.52, 0, Math.PI * 2); ctx.fill();
    };

    drawCloud(180, 95, 42);
    drawCloud(490, 75, 52);
    drawCloud(780, 110, 38);
    drawCloud(320, 55, 32);
    drawCloud(670, 85, 46);
    drawCloud(920, 130, 32);
    ctx.globalAlpha = 1.0;

    const skyTex = new THREE.CanvasTexture(skyCanvas);
    const skyGeo = new THREE.SphereGeometry(95, 32, 16);
    const skyMat = new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide });
    this.skyMesh = new THREE.Mesh(skyGeo, skyMat);
    this.group.add(this.skyMesh);

    // 3D Flying Festival Kites (Patam)
    const kiteConfigs = [
      { x: -18, y: 18, z: -22, color: 0xec4899, tailColor: 0xf59e0b, scale: 0.9 }, // Rani Pink
      { x: 14, y: 22, z: -26, color: 0xfacc15, tailColor: 0xdc2626, scale: 1.1 }, // Turmeric Yellow
      { x: 2, y: 25, z: -32, color: 0x2563eb, tailColor: 0x10b981, scale: 1.0 },  // Royal Blue
    ];

    kiteConfigs.forEach((kc) => {
      const kiteGroup = new THREE.Group();
      kiteGroup.position.set(kc.x, kc.y, kc.z);
      kiteGroup.scale.setScalar(kc.scale);

      // Diamond kite body
      const shape = new THREE.Shape();
      shape.moveTo(0, 1.2);
      shape.lineTo(0.8, 0.2);
      shape.lineTo(0, -1.0);
      shape.lineTo(-0.8, 0.2);
      shape.closePath();

      const kiteGeo = new THREE.ShapeGeometry(shape);
      const kiteMat = new THREE.MeshStandardMaterial({
        color: kc.color,
        side: THREE.DoubleSide,
        roughness: 0.5,
      });
      const kiteMesh = new THREE.Mesh(kiteGeo, kiteMat);
      kiteMesh.rotation.x = -Math.PI / 4;
      kiteGroup.add(kiteMesh);

      // Wooden bamboo cross spars
      const sparMat = new THREE.MeshBasicMaterial({ color: 0x451a03 });
      const vSparGeo = new THREE.CylinderGeometry(0.015, 0.015, 2.2, 4);
      const vSpar = new THREE.Mesh(vSparGeo, sparMat);
      vSpar.position.set(0, 0.1, 0.01);
      vSpar.rotation.x = -Math.PI / 4;
      kiteGroup.add(vSpar);

      // Fluttering tail ribbons
      const tailMat = new THREE.MeshStandardMaterial({ color: kc.tailColor, side: THREE.DoubleSide });
      for (let t = 0; t < 4; t++) {
        const ribbonGeo = new THREE.PlaneGeometry(0.2, 0.4);
        const ribbon = new THREE.Mesh(ribbonGeo, tailMat);
        ribbon.position.set(0, -1.2 - t * 0.45, -0.4 - t * 0.2);
        ribbon.rotation.z = (t % 2 === 0 ? 0.3 : -0.3);
        kiteGroup.add(ribbon);
      }

      this.group.add(kiteGroup);
      this.animatedKites.push({
        group: kiteGroup,
        baseY: kc.y,
        phase: Math.random() * Math.PI * 2,
        speed: 1.2 + Math.random() * 0.6,
      });
    });
  }

  // =========================================================================
  // 1. LUSH GREEN GROUND WITH DUSTY ARENA & MULTI-COLORED LOTUS KOLAM
  // =========================================================================
  private buildGroundAndKolam() {
    const groundGeo = new THREE.PlaneGeometry(140, 140, 48, 48);
    const groundCanvas = document.createElement('canvas');
    groundCanvas.width = 2048;
    groundCanvas.height = 2048;
    const ctx = groundCanvas.getContext('2d')!;

    // Lush Tamil village grass
    ctx.fillStyle = '#458535';
    ctx.fillRect(0, 0, 2048, 2048);

    // Natural grass & flower lawn flecks
    for (let i = 0; i < 90000; i++) {
      const x = Math.random() * 2048;
      const y = Math.random() * 2048;
      const rnd = Math.random();
      if (rnd > 0.4) {
        ctx.fillStyle = `rgba(90, 165, 68, ${0.25 + Math.random() * 0.3})`;
      } else if (rnd > 0.05) {
        ctx.fillStyle = `rgba(50, 110, 40, ${0.2 + Math.random() * 0.25})`;
      } else {
        // Small yellow/red wildflower blossoms on grass
        ctx.fillStyle = Math.random() > 0.5 ? '#facc15' : '#ef4444';
      }
      ctx.fillRect(x, y, 2, 2);
    }

    // Central sand & terracotta festival arena clearing
    const cx = 1024;
    const cy = 1024;
    const arenaR = 360;

    // Grass to dirt gradient
    const outerGrad = ctx.createRadialGradient(cx, cy, arenaR - 80, cx, cy, arenaR + 70);
    outerGrad.addColorStop(0, 'rgba(195, 135, 75, 0.98)');
    outerGrad.addColorStop(0.75, 'rgba(195, 135, 75, 0.6)');
    outerGrad.addColorStop(1, 'rgba(69, 133, 53, 0)');
    ctx.fillStyle = outerGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, arenaR + 70, 0, Math.PI * 2);
    ctx.fill();

    // Sandy terracotta earth core
    ctx.fillStyle = '#c78a4c';
    ctx.beginPath();
    ctx.arc(cx, cy, arenaR, 0, Math.PI * 2);
    ctx.fill();

    // Footprints & compacted dirt texture
    for (let i = 0; i < 25000; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * arenaR;
      const px = cx + Math.cos(angle) * dist;
      const py = cy + Math.sin(angle) * dist;
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(215, 160, 90, 0.35)' : 'rgba(135, 80, 38, 0.22)';
      ctx.beginPath();
      ctx.arc(px, py, Math.random() * 2.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Sacred Festival Kolam at center — vibrant red, white, yellow
    ctx.shadowColor = 'rgba(255,255,255,0.6)';
    ctx.shadowBlur = 6;

    for (let ring = 45; ring <= 270; ring += 36) {
      const isRedRing = ring % 72 === 0;
      ctx.strokeStyle = isRedRing ? '#dc2626' : '#ffffff';
      ctx.lineWidth = isRedRing ? 5 : 3;
      ctx.beginPath();
      ctx.arc(cx, cy, ring, 0, Math.PI * 2);
      ctx.stroke();

      const petals = Math.floor(10 + (ring / 22));
      for (let p = 0; p < petals; p++) {
        const angle = (p / petals) * Math.PI * 2;
        const px = cx + Math.cos(angle) * ring;
        const py = cy + Math.sin(angle) * ring;
        ctx.fillStyle = isRedRing ? '#dc2626' : '#f59e0b';
        ctx.beginPath();
        ctx.arc(px, py, 7.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    // Pulli Kolam grid dots
    for (let x = cx - 210; x <= cx + 210; x += 28) {
      for (let y = cy - 210; y <= cy + 210; y += 28) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x, y, 2.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.shadowBlur = 0;

    const groundTex = new THREE.CanvasTexture(groundCanvas);
    groundTex.wrapS = THREE.RepeatWrapping;
    groundTex.wrapT = THREE.RepeatWrapping;

    const groundMat = new THREE.MeshStandardMaterial({
      map: groundTex,
      roughness: 0.85,
      metalness: 0.02,
    });

    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.group.add(ground);
  }

  // =========================================================================
  // 2. ICONIC GIANT FERRIS WHEEL (RAATINAM) AS SEEN IN REFERENCE IMAGE 3
  // =========================================================================
  private buildFerrisWheel() {
    const wheelPos = { x: 38, z: -30 };
    const wheelGroup = new THREE.Group();
    wheelGroup.position.set(wheelPos.x, 0, wheelPos.z);
    wheelGroup.rotation.y = -Math.PI / 6;

    const radius = 13.5;
    const hubY = 15.5;

    // A-Frame Support Towers (Steel blue)
    const towerMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, metalness: 0.6, roughness: 0.4 });
    const woodPlinthMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.8 });

    // Concrete/brick base platform
    const platformGeo = new THREE.BoxGeometry(10, 1.2, 12);
    const platform = new THREE.Mesh(platformGeo, woodPlinthMat);
    platform.position.y = 0.6;
    platform.castShadow = true;
    platform.receiveShadow = true;
    wheelGroup.add(platform);

    // Front and back A-frame legs
    for (const sideZ of [-2.5, 2.5]) {
      const legCurveL = new THREE.LineCurve3(new THREE.Vector3(-6, 0.6, sideZ), new THREE.Vector3(0, hubY, sideZ));
      const legCurveR = new THREE.LineCurve3(new THREE.Vector3(6, 0.6, sideZ), new THREE.Vector3(0, hubY, sideZ));
      const legGeoL = new THREE.TubeGeometry(legCurveL, 8, 0.35, 8, false);
      const legGeoR = new THREE.TubeGeometry(legCurveR, 8, 0.35, 8, false);
      const legL = new THREE.Mesh(legGeoL, towerMat);
      const legR = new THREE.Mesh(legGeoR, towerMat);
      legL.castShadow = true;
      legR.castShadow = true;
      wheelGroup.add(legL);
      wheelGroup.add(legR);

      // Horizontal cross-struts
      for (const y of [5, 10]) {
        const strutGeo = new THREE.BoxGeometry(y * 0.85, 0.25, 0.25);
        const strut = new THREE.Mesh(strutGeo, towerMat);
        strut.position.set(0, y, sideZ);
        wheelGroup.add(strut);
      }
    }

    // Central Axle Hub
    const axleGeo = new THREE.CylinderGeometry(0.7, 0.7, 5.8, 16);
    const axleMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.2 });
    const axle = new THREE.Mesh(axleGeo, axleMat);
    axle.position.set(0, hubY, 0);
    axle.rotation.x = Math.PI / 2;
    wheelGroup.add(axle);

    // The Rotating Wheel Assembly
    const rimGroup = new THREE.Group();
    rimGroup.position.set(0, hubY, 0);

    const rimMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.5, roughness: 0.3 });
    const spokeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.6, roughness: 0.3 });

    // Outer double rings
    for (const rz of [-1.8, 1.8]) {
      const ringGeo = new THREE.TorusGeometry(radius, 0.22, 10, 36);
      const ring = new THREE.Mesh(ringGeo, rimMat);
      ring.position.z = rz;
      rimGroup.add(ring);

      const innerRingGeo = new THREE.TorusGeometry(radius * 0.7, 0.16, 8, 30);
      const innerRing = new THREE.Mesh(innerRingGeo, rimMat);
      innerRing.position.z = rz;
      rimGroup.add(innerRing);
    }

    // 12 Spokes & 12 Gondolas (Cabins)
    const gondolaCount = 12;
    const gondolaColors = [0xef4444, 0xfacc15, 0x10b981, 0x3b82f6, 0xec4899, 0xf97316];

    for (let i = 0; i < gondolaCount; i++) {
      const angle = (i / gondolaCount) * Math.PI * 2;

      // Cross spokes
      for (const rz of [-1.8, 1.8]) {
        const spokeGeo = new THREE.CylinderGeometry(0.08, 0.08, radius, 6);
        const spoke = new THREE.Mesh(spokeGeo, spokeMat);
        spoke.position.set(Math.cos(angle) * (radius / 2), Math.sin(angle) * (radius / 2), rz);
        spoke.rotation.z = angle - Math.PI / 2;
        rimGroup.add(spoke);
      }

      // Cross-connectors between the two rims
      const crossGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.6, 6);
      const cross = new THREE.Mesh(crossGeo, spokeMat);
      cross.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
      cross.rotation.x = Math.PI / 2;
      rimGroup.add(cross);

      // Passenger Gondola (hanging cabin)
      const gondolaGroup = new THREE.Group();
      gondolaGroup.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);

      const colorHex = gondolaColors[i % gondolaColors.length];
      const cabinMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.6 });
      const roofMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });

      // Cabin tub
      const tubGeo = new THREE.BoxGeometry(1.6, 1.1, 1.8);
      const tub = new THREE.Mesh(tubGeo, cabinMat);
      tub.position.y = -0.9;
      gondolaGroup.add(tub);

      // Canopy roof
      const roofGeo = new THREE.ConeGeometry(1.4, 0.7, 4);
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.y = -0.05;
      roof.rotation.y = Math.PI / 4;
      gondolaGroup.add(roof);

      rimGroup.add(gondolaGroup);
      this.ferrisGondolas.push(gondolaGroup);
    }

    wheelGroup.add(rimGroup);
    this.ferrisWheelRim = rimGroup;

    this.group.add(wheelGroup);
  }

  // =========================================================================
  // 2B. CAROUSEL / MERRY-GO-ROUND (KUDHIRAI RAATINAM) AS SEEN IN REFERENCE 1
  // =========================================================================
  private buildCarousel() {
    const carouselGroup = new THREE.Group();
    carouselGroup.position.set(-36, 0, -24);

    const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.25 });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
    const horseMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.7 });
    const saddleMat = new THREE.MeshStandardMaterial({ color: 0xdc2626 });

    // Raised Circular Base
    const baseGeo = new THREE.CylinderGeometry(5.2, 5.5, 0.6, 24);
    const base = new THREE.Mesh(baseGeo, woodMat);
    base.position.y = 0.3;
    base.receiveShadow = true;
    carouselGroup.add(base);

    // Central Decorated Column
    const colGeo = new THREE.CylinderGeometry(0.8, 0.9, 5, 16);
    const col = new THREE.Mesh(colGeo, goldMat);
    col.position.y = 2.8;
    carouselGroup.add(col);

    // Rotating Platform
    const rotGroup = new THREE.Group();
    rotGroup.position.y = 0.6;

    // Conical Scalloped Roof Canopy (Red and Gold)
    const roofGeo = new THREE.ConeGeometry(5.4, 2.2, 16);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.5 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 4.8;
    rotGroup.add(roof);

    // Golden Spire on Top
    const spireGeo = new THREE.ConeGeometry(0.35, 1.4, 12);
    const spire = new THREE.Mesh(spireGeo, goldMat);
    spire.position.y = 6.4;
    rotGroup.add(spire);

    // 6 Carved Carousel Horses on Brass Poles
    const horseCount = 6;
    for (let h = 0; h < horseCount; h++) {
      const angle = (h / horseCount) * Math.PI * 2;
      const hx = Math.cos(angle) * 3.8;
      const hz = Math.sin(angle) * 3.8;

      // Brass Pole
      const poleGeo = new THREE.CylinderGeometry(0.04, 0.04, 4.4, 8);
      const pole = new THREE.Mesh(poleGeo, goldMat);
      pole.position.set(hx, 2.4, hz);
      rotGroup.add(pole);

      // Horse body
      const horse = new THREE.Group();
      horse.position.set(hx, 1.8 + (h % 2 === 0 ? 0.3 : -0.2), hz);
      horse.rotation.y = angle + Math.PI / 2;

      const bodyGeo = new THREE.BoxGeometry(0.5, 0.6, 1.3);
      const body = new THREE.Mesh(bodyGeo, horseMat);
      horse.add(body);

      const hHeadGeo = new THREE.BoxGeometry(0.4, 0.6, 0.6);
      const hHead = new THREE.Mesh(hHeadGeo, horseMat);
      hHead.position.set(0, 0.5, 0.6);
      horse.add(hHead);

      const hSaddleGeo = new THREE.BoxGeometry(0.52, 0.25, 0.6);
      const hSaddle = new THREE.Mesh(hSaddleGeo, saddleMat);
      hSaddle.position.y = 0.32;
      horse.add(hSaddle);

      rotGroup.add(horse);
    }

    carouselGroup.add(rotGroup);
    this.carouselPlatform = rotGroup;

    this.group.add(carouselGroup);
  }

  // =========================================================================
  // 3. FESTIVAL BAZAAR STALLS & TENTS (PANDAL) AS SEEN IN REFERENCE 2 & 3
  // =========================================================================
  private buildFestivalStalls() {
    const stallConfigs = [
      {
        x: -16, z: -16, rot: 0.4, title: 'SWEETS & SNACKS',
        roofColors: ['#dc2626', '#ffffff'],
        hasLaddus: true
      },
      {
        x: 16, z: -16, rot: -0.4, title: 'FESTIVAL TOYS',
        roofColors: ['#f59e0b', '#2563eb'],
        hasToys: true
      },
      {
        x: -21, z: 8, rot: 1.4, title: 'FLOWER GARLANDS',
        roofColors: ['#16a34a', '#facc15'],
        hasFlowers: true
      },
      {
        x: 22, z: 8, rot: -1.3, title: 'SUGARCANE & JUICE',
        roofColors: ['#ec4899', '#ffffff'],
        hasDrinks: true
      },
    ];

    const woodMat = new THREE.MeshStandardMaterial({ color: 0x5c3317, roughness: 0.85 });
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.3 });

    stallConfigs.forEach((cfg) => {
      const stall = new THREE.Group();
      stall.position.set(cfg.x, 0, cfg.z);
      stall.rotation.y = cfg.rot;

      // Wooden Table Counter
      const tableGeo = new THREE.BoxGeometry(4.2, 0.9, 1.6);
      const table = new THREE.Mesh(tableGeo, woodMat);
      table.position.set(0, 0.45, 0);
      table.castShadow = true;
      table.receiveShadow = true;
      stall.add(table);

      // Four bamboo posts
      for (const corner of [[-1.9, -0.7], [-1.9, 0.7], [1.9, -0.7], [1.9, 0.7]]) {
        const postGeo = new THREE.CylinderGeometry(0.06, 0.08, 3.2, 8);
        const post = new THREE.Mesh(postGeo, woodMat);
        post.position.set(corner[0], 1.6, corner[1]);
        post.castShadow = true;
        stall.add(post);
      }

      // Procedural Striped Canopy Awning Canvas
      const canopyCanvas = document.createElement('canvas');
      canopyCanvas.width = 256;
      canopyCanvas.height = 256;
      const cctx = canopyCanvas.getContext('2d')!;
      const stripeW = 32;
      for (let s = 0; s < 256; s += stripeW * 2) {
        cctx.fillStyle = cfg.roofColors[0];
        cctx.fillRect(s, 0, stripeW, 256);
        cctx.fillStyle = cfg.roofColors[1];
        cctx.fillRect(s + stripeW, 0, stripeW, 256);
      }

      const canopyTex = new THREE.CanvasTexture(canopyCanvas);
      const canopyMat = new THREE.MeshStandardMaterial({
        map: canopyTex,
        roughness: 0.6,
        side: THREE.DoubleSide,
      });

      // Pitched fabric roof
      const roofGeo = new THREE.ConeGeometry(3.0, 1.4, 4);
      const roof = new THREE.Mesh(roofGeo, canopyMat);
      roof.position.set(0, 3.4, 0);
      roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;
      stall.add(roof);

      // Scalloped fabric fringe
      const fringeGeo = new THREE.BoxGeometry(4.4, 0.35, 1.8);
      const fringe = new THREE.Mesh(fringeGeo, canopyMat);
      fringe.position.set(0, 2.7, 0);
      stall.add(fringe);

      // Brass thalis / trays on the counter
      if (cfg.hasLaddus) {
        // Laddus & Jalebis on trays
        for (let t = -1.2; t <= 1.2; t += 1.2) {
          const thaliGeo = new THREE.CylinderGeometry(0.38, 0.34, 0.05, 16);
          const thali = new THREE.Mesh(thaliGeo, brassMat);
          thali.position.set(t, 0.93, 0);
          stall.add(thali);

          // Golden laddus stacked in pyramid
          const sweetColor = t < 0 ? 0xf59e0b : 0xf97316;
          const sweetMat = new THREE.MeshStandardMaterial({ color: sweetColor, roughness: 0.8 });
          for (let s = 0; s < 7; s++) {
            const ladduGeo = new THREE.SphereGeometry(0.08, 8, 8);
            const laddu = new THREE.Mesh(ladduGeo, sweetMat);
            const angle = (s / 6) * Math.PI * 2;
            laddu.position.set(t + Math.cos(angle) * 0.18, 1.02, Math.sin(angle) * 0.18);
            stall.add(laddu);
          }
        }
      }

      if (cfg.hasFlowers) {
        // Hanging flower garlands from roof
        const marigoldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.8 });
        const jasmineMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });
        for (let g = -1.6; g <= 1.6; g += 0.8) {
          const isJasmine = Math.abs(g) > 1.0;
          for (let f = 0; f < 10; f++) {
            const flGeo = new THREE.SphereGeometry(0.07, 6, 6);
            const fl = new THREE.Mesh(flGeo, isJasmine ? jasmineMat : marigoldMat);
            fl.position.set(g, 2.6 - f * 0.14, 0.85);
            stall.add(fl);
          }
        }
      }

      if (cfg.hasToys) {
        // Colorful festival balloons
        const balloonColors = [0xef4444, 0x3b82f6, 0x10b981, 0xfacc15];
        for (let b = 0; b < 4; b++) {
          const bMat = new THREE.MeshStandardMaterial({ color: balloonColors[b], roughness: 0.3 });
          const bGeo = new THREE.SphereGeometry(0.22, 12, 12);
          const balloon = new THREE.Mesh(bGeo, bMat);
          balloon.position.set(-1.0 + b * 0.7, 2.2, 0.4);
          stall.add(balloon);
        }
      }

      this.group.add(stall);
    });
  }

  // =========================================================================
  // 4. PONGAL CELEBRATION SETUP (KARUMBU TRIPOD & POT) AS IN REFERENCE 4
  // =========================================================================
  private buildPongalAndSugarcane() {
    const pongalGroup = new THREE.Group();
    pongalGroup.position.set(-11, 0, -6);

    const caneMat = new THREE.MeshStandardMaterial({ color: 0x4a0404, roughness: 0.7 }); // Deep purple/maroon sugarcane
    const leafGreenMat = new THREE.MeshStandardMaterial({ color: 0x15803d, side: THREE.DoubleSide });

    // 3 Sugarcane Stalks (Karumbu) tied in a tall tripod
    for (let c = 0; c < 3; c++) {
      const angle = (c / 3) * Math.PI * 2;
      const baseX = Math.cos(angle) * 1.3;
      const baseZ = Math.sin(angle) * 1.3;

      const curve = new THREE.LineCurve3(
        new THREE.Vector3(baseX, 0, baseZ),
        new THREE.Vector3(0, 4.5, 0)
      );
      const caneGeo = new THREE.TubeGeometry(curve, 16, 0.08, 8, false);
      const cane = new THREE.Mesh(caneGeo, caneMat);
      cane.castShadow = true;
      pongalGroup.add(cane);

      // Sugarcane leafy top fan
      for (let l = 0; l < 4; l++) {
        const leafGeo = new THREE.PlaneGeometry(0.3, 1.6);
        const leaf = new THREE.Mesh(leafGeo, leafGreenMat);
        leaf.position.set(0, 4.5, 0);
        leaf.rotation.x = Math.PI / 4;
        leaf.rotation.y = (c * 4 + l) * 0.5;
        pongalGroup.add(leaf);
      }
    }

    // Mud hearth / Firewood stove (Aduppu)
    const stoveMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.95 });
    for (let s = 0; s < 3; s++) {
      const sa = (s / 3) * Math.PI * 2;
      const brickGeo = new THREE.BoxGeometry(0.25, 0.35, 0.45);
      const brick = new THREE.Mesh(brickGeo, stoveMat);
      brick.position.set(Math.cos(sa) * 0.4, 0.18, Math.sin(sa) * 0.4);
      pongalGroup.add(brick);
    }

    // Traditional Painted Pongal Pot
    const potMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.8 });
    const potBodyGeo = new THREE.SphereGeometry(0.48, 16, 16);
    const potBody = new THREE.Mesh(potBodyGeo, potMat);
    potBody.position.y = 0.65;
    potBody.castShadow = true;
    pongalGroup.add(potBody);

    // Decorative white & red tilak markings around neck
    const rimGeo = new THREE.TorusGeometry(0.3, 0.06, 8, 16);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xdc2626 });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 1.05;
    pongalGroup.add(rim);

    // Overflowing sweet Pongal milk foam ("Pongalo Pongal!")
    const foamMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.5 });
    const foamGeo = new THREE.SphereGeometry(0.32, 12, 12);
    const foam = new THREE.Mesh(foamGeo, foamMat);
    foam.scale.set(1.1, 0.6, 1.1);
    foam.position.y = 1.15;
    pongalGroup.add(foam);

    // Banana Leaf (Vazhai Ilai) Feast Offering
    const leafGeo = new THREE.PlaneGeometry(1.6, 0.9);
    const leafMesh = new THREE.Mesh(leafGeo, leafGreenMat);
    leafMesh.rotation.x = -Math.PI / 2;
    leafMesh.position.set(0.8, 0.03, 0.8);
    pongalGroup.add(leafMesh);

    this.group.add(pongalGroup);
  }

  // =========================================================================
  // 5. FESTIVAL ANIMALS — MATTU PONGAL COW & TEMPLE ELEPHANT (REFS 3 & 4)
  // =========================================================================
  private buildFestivalAnimals() {
    // --- 5A. DECORATED SACRED COW (PONGAL MAADU) AS IN REFERENCE 4 ---
    const cowGroup = new THREE.Group();
    cowGroup.position.set(-15, 0, -4);
    cowGroup.rotation.y = 0.8;

    const whiteHideMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.85 });
    const hornMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 }); // Painted bright turquoise horns
    const yellowHornMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 });
    const clothMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.6 }); // Embroidered red shawl

    // Body
    const cowBodyGeo = new THREE.BoxGeometry(1.5, 1.1, 2.4);
    const cowBody = new THREE.Mesh(cowBodyGeo, whiteHideMat);
    cowBody.position.y = 1.2;
    cowBody.castShadow = true;
    cowGroup.add(cowBody);

    // Distinctive Zebu hump (Thimil)
    const humpGeo = new THREE.SphereGeometry(0.42, 10, 10);
    const hump = new THREE.Mesh(humpGeo, whiteHideMat);
    hump.scale.set(0.8, 1.2, 0.9);
    hump.position.set(0, 1.85, -0.4);
    cowGroup.add(hump);

    // Decorative festival blanket (Jhool) over back
    const blanketGeo = new THREE.BoxGeometry(1.56, 0.7, 1.6);
    const blanket = new THREE.Mesh(blanketGeo, clothMat);
    blanket.position.set(0, 1.35, 0.1);
    cowGroup.add(blanket);

    // 4 Legs
    for (const lx of [-0.55, 0.55]) {
      for (const lz of [-0.85, 0.85]) {
        const legGeo = new THREE.CylinderGeometry(0.12, 0.1, 1.2, 8);
        const leg = new THREE.Mesh(legGeo, whiteHideMat);
        leg.position.set(lx, 0.6, lz);
        leg.castShadow = true;
        cowGroup.add(leg);
      }
    }

    // Neck & Head
    const headGeo = new THREE.BoxGeometry(0.7, 0.75, 1.0);
    const head = new THREE.Mesh(headGeo, whiteHideMat);
    head.position.set(0, 1.8, 1.4);
    cowGroup.add(head);

    // Painted Pointed Horns (Curving upward)
    for (const hx of [-0.35, 0.35]) {
      const hornGeo = new THREE.ConeGeometry(0.08, 0.75, 8);
      const horn = new THREE.Mesh(hornGeo, hx < 0 ? hornMat : yellowHornMat);
      horn.position.set(hx, 2.35, 1.2);
      horn.rotation.z = hx < 0 ? 0.35 : -0.35;
      horn.rotation.x = -0.2;
      cowGroup.add(horn);
    }

    // Marigold garland around cow neck
    const cowGarlandMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b });
    const garlandGeo = new THREE.TorusGeometry(0.55, 0.1, 8, 16);
    const cowGarland = new THREE.Mesh(garlandGeo, cowGarlandMat);
    cowGarland.position.set(0, 1.5, 0.9);
    cowGarland.rotation.x = Math.PI / 3;
    cowGroup.add(cowGarland);

    this.group.add(cowGroup);

    // --- 5B. DECORATED TEMPLE ELEPHANT (KOVIL YAANAI) AS IN REFERENCE 3 ---
    const elephantGroup = new THREE.Group();
    elephantGroup.position.set(22, 0, -22);
    elephantGroup.rotation.y = -Math.PI / 4;

    const hideMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9 });
    const goldNettiMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.85, roughness: 0.25 });
    const tuskMat = new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: 0.4 });
    const saddleMat = new THREE.MeshStandardMaterial({ color: 0x9333ea, roughness: 0.6 }); // Royal festive purple saddle

    // Massive Body
    const eBodyGeo = new THREE.BoxGeometry(2.4, 2.2, 3.6);
    const eBody = new THREE.Mesh(eBodyGeo, hideMat);
    eBody.position.y = 2.4;
    eBody.castShadow = true;
    elephantGroup.add(eBody);

    // 4 Sturdy Column Legs
    for (const lx of [-0.9, 0.9]) {
      for (const lz of [-1.3, 1.3]) {
        const legGeo = new THREE.CylinderGeometry(0.32, 0.36, 2.0, 10);
        const leg = new THREE.Mesh(legGeo, hideMat);
        leg.position.set(lx, 1.0, lz);
        leg.castShadow = true;
        elephantGroup.add(leg);
      }
    }

    // Head
    const eHeadGeo = new THREE.SphereGeometry(1.2, 12, 12);
    const eHead = new THREE.Mesh(eHeadGeo, hideMat);
    eHead.position.set(0, 3.4, 2.0);
    elephantGroup.add(eHead);

    // Golden Temple Headpiece (Nettipattam)
    const nettiGeo = new THREE.PlaneGeometry(1.4, 1.6);
    const netti = new THREE.Mesh(nettiGeo, goldNettiMat);
    netti.position.set(0, 3.7, 3.15);
    netti.rotation.x = -0.3;
    elephantGroup.add(netti);

    // Trunk
    const trunkCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 3.1, 2.9),
      new THREE.Vector3(0, 1.8, 3.3),
      new THREE.Vector3(0, 0.9, 3.6),
      new THREE.Vector3(0, 0.7, 3.9),
    ]);
    const trunkGeo = new THREE.TubeGeometry(trunkCurve, 12, 0.22, 8, false);
    const trunk = new THREE.Mesh(trunkGeo, hideMat);
    elephantGroup.add(trunk);
    this.animatedElephantTrunk = trunk;

    // White Tusks
    for (const tx of [-0.45, 0.45]) {
      const tuskGeo = new THREE.ConeGeometry(0.09, 1.1, 8);
      const tusk = new THREE.Mesh(tuskGeo, tuskMat);
      tusk.position.set(tx, 2.4, 3.1);
      tusk.rotation.x = -Math.PI / 3;
      elephantGroup.add(tusk);
    }

    // Large flapping ears
    for (const ex of [-1.3, 1.3]) {
      const earGeo = new THREE.CircleGeometry(0.85, 8);
      const ear = new THREE.Mesh(earGeo, hideMat);
      ear.position.set(ex, 3.5, 1.8);
      ear.rotation.y = ex < 0 ? -0.4 : 0.4;
      elephantGroup.add(ear);
    }

    // Ornate saddle blanket
    const eSaddleGeo = new THREE.BoxGeometry(2.5, 1.2, 2.4);
    const eSaddle = new THREE.Mesh(eSaddleGeo, saddleMat);
    eSaddle.position.set(0, 2.8, 0);
    elephantGroup.add(eSaddle);

    this.group.add(elephantGroup);
  }

  // =========================================================================
  // 6. DRAVIDIAN TEMPLE GOPURAM
  // =========================================================================
  private buildTempleGopuram() {
    const templeGroup = new THREE.Group();
    templeGroup.position.set(0, 0, -32);

    const stoneMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.85 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.2 });
    const redMat = new THREE.MeshStandardMaterial({ color: 0xcc3333, roughness: 0.7 });
    const blueMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.7 });

    // Base gateway
    const baseGeo = new THREE.BoxGeometry(16, 7, 9);
    const base = new THREE.Mesh(baseGeo, stoneMat);
    base.position.y = 3.5;
    base.castShadow = true;
    base.receiveShadow = true;
    templeGroup.add(base);

    // Archway entrance
    const archGeo = new THREE.CylinderGeometry(2.8, 2.8, 9, 16);
    const archMat = new THREE.MeshBasicMaterial({ color: 0x1c1917 });
    const arch = new THREE.Mesh(archGeo, archMat);
    arch.rotation.x = Math.PI / 2;
    arch.position.set(0, 2.8, 0);
    templeGroup.add(arch);

    // Gopuram tiers
    const tiers = 7;
    let currentY = 7;
    let currentW = 15;
    let currentD = 8;
    const tierColors = [stoneMat, redMat, blueMat, goldMat, redMat, stoneMat, goldMat];

    for (let t = 0; t < tiers; t++) {
      const tierH = 2.6 - t * 0.18;
      const tierGeo = new THREE.BoxGeometry(currentW, tierH, currentD);
      const tier = new THREE.Mesh(tierGeo, tierColors[t % tierColors.length]);
      tier.position.y = currentY + tierH / 2;
      tier.castShadow = true;
      tier.receiveShadow = true;
      templeGroup.add(tier);

      currentY += tierH;
      currentW *= 0.82;
      currentD *= 0.82;
    }

    // Summit Kalasams (Golden finials)
    for (let k = 0; k < 5; k++) {
      const kx = ((k / 4) - 0.5) * (currentW * 0.9);
      const kGeo = new THREE.ConeGeometry(0.4, 1.8, 12);
      const kMesh = new THREE.Mesh(kGeo, goldMat);
      kMesh.position.set(kx, currentY + 0.9, 0);
      kMesh.castShadow = true;
      templeGroup.add(kMesh);
    }

    // Temple Flagpost (Dhwajasthambam)
    const flagpostGeo = new THREE.CylinderGeometry(0.2, 0.28, 16, 16);
    const flagpost = new THREE.Mesh(flagpostGeo, goldMat);
    flagpost.position.set(0, 8, 9);
    flagpost.castShadow = true;
    templeGroup.add(flagpost);

    // Temple Brass Bell
    const bellGeo = new THREE.ConeGeometry(0.7, 0.9, 16);
    const bell = new THREE.Mesh(bellGeo, goldMat);
    bell.position.set(0, 5, 5);
    bell.rotation.x = Math.PI;
    templeGroup.add(bell);

    this.group.add(templeGroup);
  }

  // =========================================================================
  // 7. TRADITIONAL TAMIL VILLAGE HOUSES WITH THINNAI VERANDAS
  // =========================================================================
  private buildVillageHouses() {
    const houseConfigs = [
      { x: -25, z: -10, rot: Math.PI / 4, wallColor: 0xfff8e7, roofColor: 0xb45309, scale: 1.0 },
      { x: -28, z: 14, rot: Math.PI / 2.5, wallColor: 0xfce4b8, roofColor: 0xc25e1a, scale: 0.9 },
      { x: 25, z: -10, rot: -Math.PI / 4, wallColor: 0xfff5e1, roofColor: 0xa84520, scale: 1.1 },
      { x: 28, z: 16, rot: -Math.PI / 2.2, wallColor: 0xf5e6cc, roofColor: 0xb45309, scale: 0.85 },
      { x: -18, z: 26, rot: Math.PI / 3, wallColor: 0xfff0d4, roofColor: 0xd97706, scale: 0.95 },
      { x: 20, z: 26, rot: -Math.PI / 3.5, wallColor: 0xfff8e7, roofColor: 0xc25e1a, scale: 1.0 },
    ];

    const woodMat = new THREE.MeshStandardMaterial({ color: 0x5c3317, roughness: 0.8 });
    const garlandGreen = new THREE.MeshStandardMaterial({ color: 0x2d8b3d, roughness: 0.6, side: THREE.DoubleSide });

    houseConfigs.forEach((cfg) => {
      const house = new THREE.Group();
      house.position.set(cfg.x, 0, cfg.z);
      house.rotation.y = cfg.rot;
      house.scale.setScalar(cfg.scale);

      const wallMat = new THREE.MeshStandardMaterial({ color: cfg.wallColor, roughness: 0.92 });
      const roofMat = new THREE.MeshStandardMaterial({ color: cfg.roofColor, roughness: 0.7 });

      // Whitewashed house walls
      const wallsGeo = new THREE.BoxGeometry(11, 4.5, 7);
      const walls = new THREE.Mesh(wallsGeo, wallMat);
      walls.position.y = 2.25;
      walls.castShadow = true;
      walls.receiveShadow = true;
      house.add(walls);

      // Terracotta pitched roof
      const roofGeo = new THREE.ConeGeometry(8, 3.5, 4);
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.y = 5.8;
      roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;
      house.add(roof);

      // Veranda Thinnai Pillars
      for (let p = -4.5; p <= 4.5; p += 3) {
        const pillarGeo = new THREE.CylinderGeometry(0.15, 0.2, 4, 8);
        const pillar = new THREE.Mesh(pillarGeo, woodMat);
        pillar.position.set(p, 2, 3.8);
        pillar.castShadow = true;
        house.add(pillar);
      }

      // Mango leaf thoranam
      for (let g = 0; g < 14; g++) {
        const gx = -4 + (g / 13) * 8;
        const leafGeo = new THREE.PlaneGeometry(0.3, 0.6);
        const leaf = new THREE.Mesh(leafGeo, garlandGreen);
        leaf.position.set(gx, 3.6 - Math.sin((g / 13) * Math.PI) * 0.4, 3.6);
        house.add(leaf);
      }

      this.group.add(house);
    });
  }

  // =========================================================================
  // 8. VEGETATION — BANYAN TREES, COCONUT PALMS, PALMYRA & BANANA PLANTS
  // =========================================================================
  private buildVegetation() {
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6e4726, roughness: 0.9 });
    const frondMat = new THREE.MeshStandardMaterial({ color: 0x228B22, roughness: 0.5, side: THREE.DoubleSide });
    const darkFrondMat = new THREE.MeshStandardMaterial({ color: 0x1a6b1a, roughness: 0.5, side: THREE.DoubleSide });

    // Coconut Palms
    const palmPositions = [
      { x: -16, z: -22, h: 12 },
      { x: 17, z: -21, h: 13 },
      { x: -20, z: 24, h: 11 },
      { x: 20, z: 22, h: 12 },
      { x: -30, z: 0, h: 14 },
      { x: 30, z: 3, h: 13 },
      { x: -12, z: -28, h: 11 },
      { x: 12, z: -28, h: 12 },
    ];

    palmPositions.forEach((pos) => {
      const palm = new THREE.Group();
      palm.position.set(pos.x, 0, pos.z);

      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(Math.sin(pos.x) * 0.6, pos.h * 0.4, Math.cos(pos.z) * 0.6),
        new THREE.Vector3(Math.sin(pos.x) * 1.2, pos.h, Math.cos(pos.z) * 1.2),
      ]);
      const trunkGeo = new THREE.TubeGeometry(curve, 20, 0.35, 8, false);
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.castShadow = true;
      palm.add(trunk);

      // Coconuts cluster
      const coconutMat = new THREE.MeshStandardMaterial({ color: 0x5c3317, roughness: 0.8 });
      const topPos = curve.getPoint(1);
      for (let c = 0; c < 4; c++) {
        const coconutGeo = new THREE.SphereGeometry(0.18, 8, 8);
        const coconut = new THREE.Mesh(coconutGeo, coconutMat);
        const ca = (c / 4) * Math.PI * 2;
        coconut.position.set(topPos.x + Math.cos(ca) * 0.4, topPos.y - 0.5, topPos.z + Math.sin(ca) * 0.4);
        palm.add(coconut);
      }

      // Palm fronds
      const leafCount = 10;
      for (let i = 0; i < leafCount; i++) {
        const leafGeo = new THREE.PlaneGeometry(1.6, 6.5, 4, 10);
        const leaf = new THREE.Mesh(leafGeo, i % 2 === 0 ? frondMat : darkFrondMat);
        leaf.position.copy(topPos);
        leaf.rotation.x = Math.PI / 3.2;
        leaf.rotation.y = (i / leafCount) * Math.PI * 2;
        leaf.castShadow = true;
        palm.add(leaf);
        this.animatedFronds.push(leaf);
      }

      this.group.add(palm);
    });

    // Palmyra Palms
    const palmyraPositions = [
      { x: -35, z: -15, h: 15 },
      { x: 35, z: -12, h: 14 },
      { x: -32, z: 18, h: 16 },
      { x: 34, z: 20, h: 15 },
    ];

    palmyraPositions.forEach((pos) => {
      const palmyra = new THREE.Group();
      palmyra.position.set(pos.x, 0, pos.z);

      const pTrunkGeo = new THREE.CylinderGeometry(0.25, 0.35, pos.h, 10);
      const pTrunk = new THREE.Mesh(pTrunkGeo, trunkMat);
      pTrunk.position.y = pos.h / 2;
      pTrunk.castShadow = true;
      palmyra.add(pTrunk);

      for (let f = 0; f < 7; f++) {
        const fanGeo = new THREE.CircleGeometry(3.5, 8, 0, Math.PI);
        const fan = new THREE.Mesh(fanGeo, frondMat);
        fan.position.y = pos.h;
        fan.rotation.x = Math.PI / 3;
        fan.rotation.y = (f / 7) * Math.PI * 2;
        palmyra.add(fan);
        this.animatedFronds.push(fan);
      }

      this.group.add(palmyra);
    });

    // Big Shady Banyan & Mango Trees with Hanging Prop Roots
    const bigTreePositions = [
      { x: -22, z: -22, s: 1.2 },
      { x: 25, z: -24, s: 1.0 },
      { x: -26, z: 22, s: 1.1 },
      { x: 28, z: 24, s: 0.9 },
    ];

    const canopyColors = [0x2d8b3d, 0x1f7a2e, 0x38a845, 0x4caf50];
    const darkTrunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3520, roughness: 0.9 });

    bigTreePositions.forEach((pos) => {
      const tree = new THREE.Group();
      tree.position.set(pos.x, 0, pos.z);
      tree.scale.setScalar(pos.s);

      const bTrunkGeo = new THREE.CylinderGeometry(0.7, 1.1, 5.5, 12);
      const bTrunk = new THREE.Mesh(bTrunkGeo, darkTrunkMat);
      bTrunk.position.y = 2.75;
      bTrunk.castShadow = true;
      tree.add(bTrunk);

      // Hanging Banyan Aerial Prop Roots
      for (let r = 0; r < 4; r++) {
        const rootAngle = (r / 4) * Math.PI * 2;
        const rx = Math.cos(rootAngle) * 2.2;
        const rz = Math.sin(rootAngle) * 2.2;
        const rootGeo = new THREE.CylinderGeometry(0.08, 0.1, 5, 6);
        const root = new THREE.Mesh(rootGeo, darkTrunkMat);
        root.position.set(rx, 2.5, rz);
        tree.add(root);
      }

      // Large multi-sphere leaf canopy
      for (let c = 0; c < 6; c++) {
        const canopyGeo = new THREE.SphereGeometry(3.6 + Math.random(), 12, 12);
        const canopyColor = canopyColors[Math.floor(Math.random() * canopyColors.length)];
        const canopyMat = new THREE.MeshStandardMaterial({ color: canopyColor, roughness: 0.75 });
        const canopy = new THREE.Mesh(canopyGeo, canopyMat);
        canopy.position.set(
          (Math.random() - 0.5) * 3.5,
          6.0 + Math.random() * 2,
          (Math.random() - 0.5) * 3.5
        );
        canopy.castShadow = true;
        tree.add(canopy);
      }

      this.group.add(tree);
    });

    // Festive Banana Plants near arena entrance
    const bananaMat = new THREE.MeshStandardMaterial({ color: 0x4caf50, roughness: 0.5, side: THREE.DoubleSide });
    const bananaPositions = [
      { x: -6, z: -11 },
      { x: 6, z: -11 },
      { x: -8, z: 9 },
      { x: 8, z: 9 },
    ];

    bananaPositions.forEach((bp) => {
      const plant = new THREE.Group();
      plant.position.set(bp.x, 0, bp.z);

      const stemGeo = new THREE.CylinderGeometry(0.18, 0.28, 3.8, 8);
      const stem = new THREE.Mesh(stemGeo, trunkMat);
      stem.position.y = 1.9;
      plant.add(stem);

      for (let b = 0; b < 6; b++) {
        const bLeafGeo = new THREE.PlaneGeometry(1.2, 3.5);
        const bLeaf = new THREE.Mesh(bLeafGeo, bananaMat);
        bLeaf.position.set(0, 3.2, 0);
        bLeaf.rotation.x = 0.5;
        bLeaf.rotation.y = (b / 6) * Math.PI * 2;
        plant.add(bLeaf);
      }
      this.group.add(plant);
    });
  }

  // =========================================================================
  // 9. FESTIVAL DECORATIONS & BUNTING STRINGS (THORANAM)
  // =========================================================================
  private buildFestivalDecorations() {
    const flagColors = [
      new THREE.MeshStandardMaterial({ color: 0xdc2626, side: THREE.DoubleSide, roughness: 0.5 }), // Red
      new THREE.MeshStandardMaterial({ color: 0x2563eb, side: THREE.DoubleSide, roughness: 0.5 }), // Blue
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, side: THREE.DoubleSide, roughness: 0.5 }), // Yellow
      new THREE.MeshStandardMaterial({ color: 0x16a34a, side: THREE.DoubleSide, roughness: 0.5 }), // Green
      new THREE.MeshStandardMaterial({ color: 0xec4899, side: THREE.DoubleSide, roughness: 0.5 }), // Pink
      new THREE.MeshStandardMaterial({ color: 0xf97316, side: THREE.DoubleSide, roughness: 0.5 }), // Orange
      new THREE.MeshStandardMaterial({ color: 0x8b5cf6, side: THREE.DoubleSide, roughness: 0.5 }), // Purple
    ];

    const buntingStrings = [
      { startX: -14, endX: 14, z: -8, height: 7.5 },
      { startX: -14, endX: 14, z: 8, height: 7.0 },
      { startX: -14, endX: 14, z: 0, height: 8.0 },
      { startX: -10, endX: 10, z: -14, height: 6.5 },
      { startX: -12, endX: 12, z: 14, height: 7.0 },
    ];

    const ropeMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });

    buntingStrings.forEach((bs) => {
      const flagCount = 22;

      const ropeGeo = new THREE.CylinderGeometry(0.025, 0.025, Math.abs(bs.endX - bs.startX) + 2, 4);
      const rope = new THREE.Mesh(ropeGeo, ropeMat);
      rope.rotation.z = Math.PI / 2;
      rope.position.set((bs.startX + bs.endX) / 2, bs.height, bs.z);
      this.group.add(rope);

      for (let f = 0; f < flagCount; f++) {
        const t = f / (flagCount - 1);
        const x = bs.startX + t * (bs.endX - bs.startX);
        const catenary = bs.height - Math.sin(t * Math.PI) * 1.5;

        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(0.3, 0);
        shape.lineTo(0.15, -0.65);
        shape.closePath();

        const flagGeo = new THREE.ShapeGeometry(shape);
        const colorIdx = (f + Math.floor(bs.z)) % flagColors.length;
        const flagMesh = new THREE.Mesh(flagGeo, flagColors[Math.abs(colorIdx)]);
        flagMesh.position.set(x, catenary, bs.z);
        flagMesh.rotation.y = Math.random() * 0.4 - 0.2;
        this.group.add(flagMesh);
        this.buntingFlags.push(flagMesh);
      }
    });

    // Supporting bamboo poles
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x8B7355, roughness: 0.85 });
    const polePositions = [
      { x: -14, z: -8 }, { x: 14, z: -8 },
      { x: -14, z: 8 }, { x: 14, z: 8 },
      { x: -14, z: 0 }, { x: 14, z: 0 },
      { x: -10, z: -14 }, { x: 10, z: -14 },
    ];

    polePositions.forEach((pp) => {
      const poleGeo = new THREE.CylinderGeometry(0.1, 0.15, 9, 8);
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(pp.x, 4.5, pp.z);
      pole.castShadow = true;
      this.group.add(pole);
    });

    // Traditional Agal Vilakku (Clay Oil Lamps) surrounding the arena
    const lampGeo = new THREE.CylinderGeometry(0.35, 0.22, 0.25, 12);
    const lampMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.8 });

    for (let a = 0; a < 10; a++) {
      const angle = (a / 10) * Math.PI * 2;
      const lx = Math.cos(angle) * 8.2;
      const lz = Math.sin(angle) * 8.2;

      const lamp = new THREE.Mesh(lampGeo, lampMat);
      lamp.position.set(lx, 0.12, lz);
      this.group.add(lamp);

      const flameMat = new THREE.MeshStandardMaterial({ color: 0xff6600, emissive: 0xff4400, emissiveIntensity: 2.0 });
      const flameGeo = new THREE.SphereGeometry(0.06, 6, 6);
      const flame = new THREE.Mesh(flameGeo, flameMat);
      flame.position.set(lx, 0.3, lz);
      this.group.add(flame);

      const flameLight = new THREE.PointLight(0xff9900, 0.9, 7);
      flameLight.position.set(lx, 0.4, lz);
      this.group.add(flameLight);
      this.oilLampLights.push(flameLight);
    }
  }

  // =========================================================================
  // 10. BULLOCK CART & FESTIVAL PROPS
  // =========================================================================
  private buildBullockCartAndProps() {
    const cartGroup = new THREE.Group();
    cartGroup.position.set(-13, 0, 12);
    cartGroup.rotation.y = 0.5;

    const woodMat = new THREE.MeshStandardMaterial({ color: 0x5c3317, roughness: 0.85 });
    const hayMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.95 });

    const bodyGeo = new THREE.BoxGeometry(2.6, 0.35, 4.5);
    const body = new THREE.Mesh(bodyGeo, woodMat);
    body.position.y = 1.2;
    cartGroup.add(body);

    for (const wx of [-1.5, 1.5]) {
      const wheelGeo = new THREE.TorusGeometry(1.1, 0.14, 8, 24);
      const wheel = new THREE.Mesh(wheelGeo, woodMat);
      wheel.position.set(wx, 1.1, 0);
      wheel.rotation.y = Math.PI / 2;
      cartGroup.add(wheel);

      for (let s = 0; s < 6; s++) {
        const spokeGeo = new THREE.CylinderGeometry(0.03, 0.03, 2.0, 4);
        const spoke = new THREE.Mesh(spokeGeo, woodMat);
        spoke.position.set(wx, 1.1, 0);
        spoke.rotation.x = (s / 6) * Math.PI;
        spoke.rotation.y = Math.PI / 2;
        cartGroup.add(spoke);
      }
    }

    const hayGeo = new THREE.SphereGeometry(1.4, 8, 8);
    const hay = new THREE.Mesh(hayGeo, hayMat);
    hay.scale.set(0.9, 0.6, 1.6);
    hay.position.set(0, 1.9, 0);
    cartGroup.add(hay);

    this.group.add(cartGroup);
  }

  // =========================================================================
  // 11. ATMOSPHERIC PARTICLES & DUST MOTES
  // =========================================================================
  private buildAtmosphericParticles() {
    const particleCount = 300;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const r = Math.random() * 32;
      const theta = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(theta) * r;
      positions[i * 3 + 1] = 0.5 + Math.random() * 9;
      positions[i * 3 + 2] = Math.sin(theta) * r;

      if (Math.random() > 0.3) {
        colors[i * 3] = 0.96 + Math.random() * 0.04;
        colors[i * 3 + 1] = 0.75 + Math.random() * 0.2;
        colors[i * 3 + 2] = 0.2 + Math.random() * 0.15;
      } else {
        colors[i * 3] = 0.3 + Math.random() * 0.2;
        colors[i * 3 + 1] = 0.8 + Math.random() * 0.15;
        colors[i * 3 + 2] = 0.2 + Math.random() * 0.15;
      }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });

    this.dustPoints = new THREE.Points(geometry, material);
    this.group.add(this.dustPoints);
  }

  // =========================================================================
  // LIGHTING / TIME OF DAY PRESETS
  // =========================================================================
  public setTimeOfDay(tod: TimeOfDay) {
    if (tod === 'DAY') {
      this.sunLight.color.setHex(0xfffae6);
      this.sunLight.intensity = 1.5;
      this.sunLight.position.set(32, 52, 28);
      this.hemiLight.color.setHex(0x7ec8f8);
      this.hemiLight.groundColor.setHex(0x4a7c3f);
      this.ambientLight.color.setHex(0xfff1db);
      this.ambientLight.intensity = 0.6;
      this.oilLampLights.forEach((l) => (l.intensity = 0.5));
    } else if (tod === 'SUNSET') {
      this.sunLight.color.setHex(0xff7722);
      this.sunLight.intensity = 1.6;
      this.sunLight.position.set(45, 12, 10);
      this.hemiLight.color.setHex(0xff9944);
      this.hemiLight.groundColor.setHex(0x553818);
      this.ambientLight.color.setHex(0xffbb77);
      this.ambientLight.intensity = 0.4;
      this.oilLampLights.forEach((l) => (l.intensity = 1.4));
    } else {
      // NIGHT
      this.sunLight.color.setHex(0x3b82f6);
      this.sunLight.intensity = 0.2;
      this.sunLight.position.set(-15, 30, -20);
      this.hemiLight.color.setHex(0x1e3a8a);
      this.hemiLight.groundColor.setHex(0x0f172a);
      this.ambientLight.color.setHex(0x1e293b);
      this.ambientLight.intensity = 0.18;
      this.oilLampLights.forEach((l) => (l.intensity = 2.5));
    }
  }

  // =========================================================================
  // FRAME ANIMATION LOOP
  // =========================================================================
  public update(delta: number, elapsed: number) {
    // 1. Rotate the Giant Ferris Wheel (Raatinam) & counter-rotate gondolas
    if (this.ferrisWheelRim) {
      this.ferrisWheelRim.rotation.z += delta * 0.12;

      // Keep each gondola hanging straight down due to gravity
      const currentWheelZ = this.ferrisWheelRim.rotation.z;
      for (let g = 0; g < this.ferrisGondolas.length; g++) {
        this.ferrisGondolas[g].rotation.z = -currentWheelZ;
      }
    }

    // 1B. Rotate the Carousel (Merry-go-round)
    if (this.carouselPlatform) {
      this.carouselPlatform.rotation.y += delta * 0.22;
    }

    // 2. Bob & float flying festival kites in sky
    for (let k = 0; k < this.animatedKites.length; k++) {
      const kite = this.animatedKites[k];
      const t = elapsed * kite.speed + kite.phase;
      kite.group.position.y = kite.baseY + Math.sin(t) * 0.8;
      kite.group.rotation.z = Math.sin(t * 0.7) * 0.15;
      kite.group.rotation.x = Math.cos(t * 0.5) * 0.08;
    }

    // 3. Subtle elephant trunk sway
    if (this.animatedElephantTrunk) {
      this.animatedElephantTrunk.rotation.z = Math.sin(elapsed * 1.4) * 0.08;
    }

    // 4. Sway palm fronds in the breeze
    for (let i = 0; i < this.animatedFronds.length; i++) {
      const frond = this.animatedFronds[i];
      frond.rotation.z = Math.sin(elapsed * 1.2 + i * 0.7) * 0.1;
    }

    // 5. Flicker oil lamp flames
    for (let i = 0; i < this.oilLampLights.length; i++) {
      const lamp = this.oilLampLights[i];
      lamp.intensity += (Math.random() - 0.5) * 0.12;
      lamp.intensity = Math.max(0.3, Math.min(2.8, lamp.intensity));
    }

    // 6. Flutter bunting flags in the wind
    for (let i = 0; i < this.buntingFlags.length; i++) {
      const flag = this.buntingFlags[i];
      flag.rotation.y = Math.sin(elapsed * 2.5 + i * 0.5) * 0.25;
      flag.rotation.z = Math.cos(elapsed * 1.8 + i * 0.3) * 0.08;
    }

    // 7. Swirl atmospheric dust motes & golden fireflies
    if (this.dustPoints) {
      const posAttr = this.dustPoints.geometry.attributes.position as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;
      for (let p = 0; p < arr.length; p += 3) {
        arr[p] += Math.sin(elapsed * 0.7 + p) * 0.007;
        arr[p + 1] += Math.cos(elapsed * 0.5 + p) * 0.005;
        arr[p + 2] += Math.cos(elapsed * 0.7 + p) * 0.007;

        if (arr[p + 1] > 9.5) arr[p + 1] = 0.5;
        if (arr[p + 1] < 0.5) arr[p + 1] = 9.5;
      }
      posAttr.needsUpdate = true;
    }
  }
}
