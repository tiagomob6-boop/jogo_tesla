import { LANES, GROUND_Y, FLIGHT_Y, PILOT_CATALOG } from '../core/Config.js';

export const TrafficManager = {
    spawnTrafficCar() {
        const freeLane = Math.floor(Math.random() * 3);
        const lanesToSpawn = [0, 1, 2].filter(l => l !== freeLane);
        const count = Math.random() < 0.55 ? 2 : 1;
        for (let i = 0; i < count; i++) {
            const laneIndex = lanesToSpawn[i];
            const laneX = LANES[laneIndex];
            const spawnZ = -160 - (Math.random() * 40);
            // Impede spawn de carros sobre ou dentro de rampas existentes
            const rampInLane = this.ramps.some(r => Math.abs(r.position.x - laneX) < 1.6 && Math.abs(r.position.z - spawnZ) < 32.0);
            if (rampInLane) continue;
            const carGroup = new THREE.Group();
            const colors = [0xd97736, 0xdfe3ea, 0x1e2029, 0xb83838];
            const chosenColor = colors[Math.floor(Math.random() * colors.length)];
            const bodyMat = new THREE.MeshStandardMaterial({ color: chosenColor, metalness: 0.8, roughness: 0.25 });
            const glassMat = new THREE.MeshStandardMaterial({ color: 0x111118, roughness: 0.1 });
            const b1 = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.55, 4.0), bodyMat);
            b1.position.y = 0.48;
            b1.castShadow = true;
            carGroup.add(b1);
            const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.5, 2.0), glassMat);
            cabin.position.set(0, 0.9, -0.2);
            carGroup.add(cabin);
            const hl1 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, 0.1), new THREE.MeshBasicMaterial({ color: 0xffffff }));
            hl1.position.set(-0.65, 0.52, 2.05);
            const hl2 = hl1.clone();
            hl2.position.x = 0.65;
            carGroup.add(hl1);
            carGroup.add(hl2);
            carGroup.position.set(laneX, 0, spawnZ);
            carGroup.trafficSpeed = Math.random() * 16 + 20;
            carGroup.boxHeight = 1.4;
            carGroup.obstacleType = "ground_car";
            this.scene.add(carGroup);
            this.trafficCars.push(carGroup);
        }
    }
    // =================================================================
    // RAMPAS FUTURISTAS DE SALTO ACROBÁTICO (BARREL ROLL & AIR STUNTS)
    // =================================================================,

    createRamp(laneX, zPos) {
        const rampGroup = new THREE.Group();
        const width = 3.2;
        const length = 11.0;
        const height = 2.2;
        const halfW = width / 2;
        const halfL = length / 2;
        rampGroup.halfW = halfW;
        rampGroup.halfL = halfL;
        rampGroup.rampHeight = height;
        rampGroup.hasContact = false;
        // Prisma triangular preciso via BufferGeometry
        const vertices = new Float32Array([
            // Superfície de subida (Incline Slope)
            -halfW, 0.04,  halfL,
             halfW, 0.04,  halfL,
             halfW, height, -halfL,
            -halfW, 0.04,  halfL,
             halfW, height, -halfL,
            -halfW, height, -halfL,
            // Parede vertical traseira (Back Wall)
             halfW, 0, -halfL,
            -halfW, 0, -halfL,
            -halfW, height, -halfL,
             halfW, 0, -halfL,
            -halfW, height, -halfL,
             halfW, height, -halfL,
            // Lateral esquerda
            -halfW, 0, -halfL,
            -halfW, 0,  halfL,
            -halfW, height, -halfL,
            // Lateral direita
             halfW, 0,  halfL,
             halfW, 0, -halfL,
             halfW, height, -halfL
        ]);
        const rampGeo = new THREE.BufferGeometry();
        rampGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        rampGeo.computeVertexNormals();
        const rampMat = new THREE.MeshStandardMaterial({
            color: 0x1f2330,
            roughness: 0.35,
            metalness: 0.85
        });
        const rampBody = new THREE.Mesh(rampGeo, rampMat);
        rampBody.castShadow = true;
        rampBody.receiveShadow = true;
        rampGroup.add(rampBody);
        // Trilhos luminosos de Neon Laranja nas bordas
        const slopeHyp = Math.sqrt(length * length + height * height);
        const slopeAngle = -Math.atan2(height, length);
        const railMat = new THREE.MeshBasicMaterial({ color: 0xff8800 });
        const railGeo = new THREE.BoxGeometry(0.14, 0.14, slopeHyp);
        const leftRail = new THREE.Mesh(railGeo, railMat);
        leftRail.position.set(-halfW + 0.07, height / 2 + 0.05, 0);
        leftRail.rotation.x = slopeAngle;
        rampGroup.add(leftRail);
        const rightRail = new THREE.Mesh(railGeo, railMat);
        rightRail.position.set(halfW - 0.07, height / 2 + 0.05, 0);
        rightRail.rotation.x = slopeAngle;
        rampGroup.add(rightRail);
        // Lip de salto em Neon Ciano no topo
        const lipMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
        const lipMesh = new THREE.Mesh(new THREE.BoxGeometry(width, 0.14, 0.16), lipMat);
        lipMesh.position.set(0, height + 0.04, -halfL);
        rampGroup.add(lipMesh);
        // Setas indicativas de impulsão (Chevrons >>>)
        rampGroup.chevrons = [];
        const chevronGeo = new THREE.BoxGeometry(1.6, 0.04, 0.45);
        [-0.32, 0.0, 0.32].forEach((offsetFactor) => {
            const chMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.85 });
            const ch = new THREE.Mesh(chevronGeo, chMat);
            const progress = 0.5 + offsetFactor;
            const zPosLocal = halfL - progress * length;
            const yPosLocal = progress * height + 0.06;
            ch.position.set(0, yPosLocal, zPosLocal);
            ch.rotation.x = slopeAngle;
            rampGroup.add(ch);
            rampGroup.chevrons.push(ch);
        });
        // Luz guia no topo da rampa
        const beaconLight = new THREE.PointLight(0xffaa00, 1.2, 7);
        beaconLight.position.set(0, height + 0.3, -halfL);
        rampGroup.add(beaconLight);
        rampGroup.position.set(laneX, 0, zPos);
        this.scene.add(rampGroup);
        this.ramps.push(rampGroup);
        return rampGroup;
    },

    spawnRamp() {
        // Escolhe faixa desobstruída para a rampa
        let laneIndex = Math.floor(Math.random() * 3);
        let laneX = LANES[laneIndex];
        const spawnZ = -175 - (Math.random() * 25);
        const blocked = this.trafficCars.some(c => Math.abs(c.position.x - laneX) < 1.6 && Math.abs(c.position.z - spawnZ) < 30.0);
        if (blocked) {
            const clearLanes = [0, 1, 2].filter(idx => !this.trafficCars.some(c => Math.abs(c.position.x - LANES[idx]) < 1.6 && Math.abs(c.position.z - spawnZ) < 30.0));
            if (clearLanes.length > 0) {
                laneIndex = clearLanes[Math.floor(Math.random() * clearLanes.length)];
                laneX = LANES[laneIndex];
            }
        }
        this.createRamp(laneX, spawnZ);
        // Carros nunca devem ser gerados na mesma faixa da rampa para não atravessá-la
        if (Math.random() < 0.65) {
            const adjLanes = LANES.filter(lx => lx !== laneX);
            const carLaneX = adjLanes[Math.floor(Math.random() * adjLanes.length)];
            const carGroup = new THREE.Group();
            const colors = [0xd97736, 0xdfe3ea, 0xb83838];
            const chosenColor = colors[Math.floor(Math.random() * colors.length)];
            const bodyMat = new THREE.MeshStandardMaterial({ color: chosenColor, metalness: 0.8, roughness: 0.25 });
            const glassMat = new THREE.MeshStandardMaterial({ color: 0x111118, roughness: 0.1 });
            const b1 = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.55, 4.0), bodyMat);
            b1.position.y = 0.48;
            carGroup.add(b1);
            const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.5, 2.0), glassMat);
            cabin.position.set(0, 0.9, -0.2);
            carGroup.add(cabin);
            carGroup.position.set(carLaneX, 0, spawnZ - 8);
            carGroup.trafficSpeed = Math.random() * 12 + 18;
            carGroup.boxHeight = 1.4;
            carGroup.obstacleType = "ground_car";
            this.scene.add(carGroup);
            this.trafficCars.push(carGroup);
        }
    }
    // =================================================================
    // OBSTÁCULOS NO CÉU (PÁSSAROS, AVIÕES, CABOS)
    // =================================================================,

    spawnSkyObstacle() {
        const laneIndex = Math.floor(Math.random() * 3);
        const laneX = LANES[laneIndex];
        const spawnZ = -170 - (Math.random() * 30);
        const randType = Math.random();
        if (randType < 0.4) {
            const flockGroup = new THREE.Group();
            flockGroup.obstacleType = "birds";
            flockGroup.wings = [];
            const birdCount = 3 + Math.floor(Math.random() * 3);
            const featherMat = new THREE.MeshStandardMaterial({ 
                color: 0xffffff, 
                emissive: 0xfff0dc, 
                emissiveIntensity: 0.35, 
                roughness: 0.35 
            });
            const wingTipMat = new THREE.MeshStandardMaterial({ color: 0x111116, roughness: 0.6 });
            const beakMat = new THREE.MeshBasicMaterial({ color: 0xff6600 });
            for (let b = 0; b < birdCount; b++) {
                const bird = new THREE.Group();
                // Corpo ampliado de gaivota costeira (alta visibilidade e contraste no céu)
                const body = new THREE.Mesh(new THREE.ConeGeometry(0.32, 1.4, 6).rotateX(Math.PI / 2), featherMat);
                bird.add(body);
                // Bico laranja vibrante
                const beak = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.45, 4).rotateX(-Math.PI / 2), beakMat);
                beak.position.set(0, 0.02, -0.85);
                bird.add(beak);
                // Asas amplas com pontas pretas e articulação para bater asas
                const wingGeo = new THREE.BoxGeometry(1.65, 0.06, 0.45);
                const leftWing = new THREE.Mesh(wingGeo, featherMat);
                leftWing.position.x = -0.85;
                const leftTip = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.07, 0.43), wingTipMat);
                leftTip.position.x = -0.65;
                leftWing.add(leftTip);
                const rightWing = new THREE.Mesh(wingGeo, featherMat);
                rightWing.position.x = 0.85;
                const rightTip = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.07, 0.43), wingTipMat);
                rightTip.position.x = 0.65;
                rightWing.add(rightTip);
                bird.add(leftWing);
                bird.add(rightWing);
                bird.leftWing = leftWing;
                bird.rightWing = rightWing;
                flockGroup.wings.push(leftWing, rightWing);
                // Formação escalonada em bando
                bird.position.set((b - 1.5) * 1.8, (b % 2) * 0.5, b * 1.4);
                flockGroup.add(bird);
            }
            flockGroup.position.set(laneX, FLIGHT_Y + (Math.random() * 0.8 - 0.4), spawnZ);
            flockGroup.flySpeed = Math.random() * 8 + 6;
            this.scene.add(flockGroup);
            this.skyObstacles.push(flockGroup);
        } else if (randType < 0.72) {
            const planeGroup = new THREE.Group();
            planeGroup.obstacleType = "plane";
            // Avião a jato em grande escala com pintura aeronáutica e luzes de navegação
            const airlinerMat = new THREE.MeshStandardMaterial({ 
                color: 0xf5f8fc, 
                metalness: 0.75, 
                roughness: 0.25,
                emissive: 0xd8e4f0,
                emissiveIntensity: 0.2
            });
            const wingMat = new THREE.MeshStandardMaterial({ 
                color: 0x1e293b, 
                metalness: 0.8, 
                roughness: 0.3 
            });
            const stripeMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
            const glassMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
            const beaconRed = new THREE.MeshBasicMaterial({ color: 0xff0033 });
            const beaconGreen = new THREE.MeshBasicMaterial({ color: 0x00ff66 });
            const strobeWhite = new THREE.MeshBasicMaterial({ color: 0xffffff });
            // Fuselagem ampla e comprida
            const fuselage = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.65, 11.5, 12).rotateX(Math.PI / 2), airlinerMat);
            planeGroup.add(fuselage);
            // Faixa decorativa vermelha ao longo da fuselagem
            const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.22, 9.8), stripeMat);
            planeGroup.add(stripe);
            // Janelas do Cockpit na dianteira
            const cockpit = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.35, 1.2), glassMat);
            cockpit.position.set(0, 0.55, -4.5);
            planeGroup.add(cockpit);
            // Asas amplas com grande envergadura
            const wings = new THREE.Mesh(new THREE.BoxGeometry(12.5, 0.18, 2.2), wingMat);
            wings.position.set(0, 0.1, 0.2);
            planeGroup.add(wings);
            // Luzes de Navegação nas Pontas das Asas
            const navLeft = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), beaconRed);
            navLeft.position.set(-6.2, 0.12, 0.2);
            planeGroup.add(navLeft);
            const flareLeft = this.makeGlow(0xff0033, 1.2, 0.8);
            flareLeft.position.copy(navLeft.position);
            planeGroup.add(flareLeft);
            const navRight = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), beaconGreen);
            navRight.position.set(6.2, 0.12, 0.2);
            planeGroup.add(navRight);
            const flareRight = this.makeGlow(0x00ff66, 1.2, 0.8);
            flareRight.position.copy(navRight.position);
            planeGroup.add(flareRight);
            // Cauda (Estabilizador Vertical e Horizontal)
            const vFin = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.6, 2.0), stripeMat);
            vFin.position.set(0, 1.6, 4.6);
            planeGroup.add(vFin);
            const hFin = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.12, 1.2), wingMat);
            hFin.position.set(0, 0.7, 4.6);
            planeGroup.add(hFin);
            // Strobe branco na cauda
            const tailLight = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), strobeWhite);
            tailLight.position.set(0, 2.9, 4.2);
            planeGroup.add(tailLight);
            // Turbinas a Jato duplas sob as asas com labaredas azuis
            [-2.6, 2.6].forEach(tx => {
                const turbine = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 1.8, 10).rotateX(Math.PI / 2), airlinerMat);
                turbine.position.set(tx, -0.42, 0.4);
                planeGroup.add(turbine);
                const thrusterFlame = this.makeGlow(0x38bdf8, 1.4, 0.9);
                thrusterFlame.position.set(tx, -0.42, 1.6);
                planeGroup.add(thrusterFlame);
            });
            planeGroup.position.set(laneX, FLIGHT_Y + 0.4, spawnZ);
            planeGroup.flySpeed = Math.random() * 20 + 25;
            this.scene.add(planeGroup);
            this.skyObstacles.push(planeGroup);
        } else {
            const cableGroup = new THREE.Group();
            cableGroup.obstacleType = "powerlines";
            const poleMat = new THREE.MeshStandardMaterial({ color: 0x6e7587, metalness: 0.8 });
            const cableMat = new THREE.MeshBasicMaterial({ color: 0x222222 });
            [-7.2, 7.2].forEach(px => {
                const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 8.5, 8), poleMat);
                pole.position.set(px, 4.2, 0);
                cableGroup.add(pole);
            });
            [-0.5, 0, 0.5].forEach(dy => {
                const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 14.8, 6).rotateZ(Math.PI / 2), cableMat);
                wire.position.set(0, FLIGHT_Y + dy, 0);
                cableGroup.add(wire);
            });
            cableGroup.position.set(0, 0, spawnZ);
            cableGroup.flySpeed = 0;
            this.scene.add(cableGroup);
            this.skyObstacles.push(cableGroup);
        }
    }
    // =================================================================
    // COLETÁVEIS (MOEDAS, ESCUDOS, ÍMÃ MAGNÉTICO E MEGA BOOST)
    // =================================================================,

    spawnCollectible() {
        const laneIndex = Math.floor(Math.random() * 3);
        const laneX = LANES[laneIndex];
        const spawnZ = -150 - (Math.random() * 20);
        // Determina a altura: cerca de 50% dos poderes spawnam "em cima" (altura de voo FLIGHT_Y)
        // para incentivar saltos de rampa e voos com o tanque de ar!
        const spawnInAir = (Math.random() < 0.52) || this.isFlying;
        const powerY = spawnInAir ? FLIGHT_Y : 1.35;
        const rand = Math.random();
        if (rand < 0.06 && this.lives < this.maxLives) {
            const heartGroup = new THREE.Group();
            const heartShape = new THREE.Shape();
            const x = 0, y = 0;
            heartShape.moveTo(x + 0.25, y + 0.25);
            heartShape.bezierCurveTo(x + 0.25, y + 0.25, x + 0.2, y, x, y);
            heartShape.bezierCurveTo(x - 0.3, y, x - 0.3, y + 0.35, x - 0.3, y + 0.35);
            heartShape.bezierCurveTo(x - 0.3, y + 0.55, x - 0.1, y + 0.77, x + 0.25, y + 0.95);
            heartShape.bezierCurveTo(x + 0.6, y + 0.77, x + 0.8, y + 0.55, x + 0.8, y + 0.35);
            heartShape.bezierCurveTo(x + 0.8, y + 0.35, x + 0.8, y, x + 0.5, y);
            heartShape.bezierCurveTo(x + 0.35, y, x + 0.25, y + 0.25, x + 0.25, y + 0.25);
            const heartGeo = new THREE.ExtrudeGeometry(heartShape, { steps: 1, depth: 0.22, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05 });
            heartGeo.center();
            const heartMat = new THREE.MeshStandardMaterial({ color: 0xff2a5a, emissive: 0xff1744, emissiveIntensity: 0.6 });
            const heartMesh = new THREE.Mesh(heartGeo, heartMat);
            heartMesh.rotation.z = Math.PI;
            heartMesh.scale.set(1.4, 1.4, 1.4);
            heartGroup.add(heartMesh);
            heartGroup.position.set(laneX, powerY, spawnZ);
            heartGroup.itemType = "heart";
            this.scene.add(heartGroup);
            this.collectibles.push(heartGroup);
        } else if (rand >= 0.06 && rand < 0.25 && this.shieldTimer <= 0) {
            // Escudo Protetor Hexagonal Colmeia 3D (Spawna com alta frequência no chão e em cima!)
            const shieldGroup = new THREE.Group();
            const shieldTex = this.getHoneycombShieldTexture();
            
            const shieldOrbGeo = new THREE.DodecahedronGeometry(0.72, 1);
            const shieldOrbMat = new THREE.MeshStandardMaterial({
                map: shieldTex,
                emissiveMap: shieldTex,
                emissive: 0xffffff,
                emissiveIntensity: 0.9,
                color: 0xffffff,
                roughness: 0.2,
                metalness: 0.8,
                transparent: true,
                opacity: 0.92
            });
            const orb = new THREE.Mesh(shieldOrbGeo, shieldOrbMat);
            shieldGroup.add(orb);
            // Anel orbital de proteção hexagonal dourado
            const ringGeo = new THREE.TorusGeometry(0.95, 0.05, 8, 32);
            const ringMat = new THREE.MeshStandardMaterial({
                color: 0xfbbf24,
                emissive: 0xf59e0b,
                emissiveIntensity: 0.85,
                metalness: 0.9,
                roughness: 0.2
            });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = Math.PI / 3;
            shieldGroup.add(ring);
            shieldGroup.ring = ring;
            // Halo de brilho âmbar/ciano
            const glow = this.makeGlow(0xf59e0b, 1.4, 0.35);
            shieldGroup.add(glow);
            shieldGroup.position.set(laneX, powerY, spawnZ);
            shieldGroup.itemType = "shield";
            this.scene.add(shieldGroup);
            this.collectibles.push(shieldGroup);
        } else if (rand >= 0.25 && rand < 0.44 && this.magnetTimer <= 0) {
            // Poder Magnético: Ímã de Moedas 3D (Atrai moedas em raio gigante de 18m!)
            const magnetGroup = new THREE.Group();
            const magnetShape = new THREE.Shape();
            magnetShape.absarc(0, 0, 0.52, 0, Math.PI, false);
            magnetShape.lineTo(-0.52, -0.55);
            magnetShape.lineTo(-0.24, -0.55);
            magnetShape.lineTo(-0.24, 0);
            magnetShape.absarc(0, 0, 0.24, Math.PI, 0, true);
            magnetShape.lineTo(0.24, -0.55);
            magnetShape.lineTo(0.52, -0.55);
            magnetShape.closePath();
            const magnetGeo = new THREE.ExtrudeGeometry(magnetShape, { depth: 0.2, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.03 });
            magnetGeo.center();
            const redMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xb91c1c, emissiveIntensity: 0.5, metalness: 0.8, roughness: 0.2 });
            const magnetMesh = new THREE.Mesh(magnetGeo, redMat);
            magnetGroup.add(magnetMesh);
            // Polos prateados das pontas
            const tipGeo = new THREE.BoxGeometry(0.3, 0.22, 0.24);
            const tipMat = new THREE.MeshStandardMaterial({ color: 0xdce2ec, metalness: 0.95, roughness: 0.1 });
            const tipL = new THREE.Mesh(tipGeo, tipMat);
            tipL.position.set(-0.38, -0.42, 0);
            magnetGroup.add(tipL);
            const tipR = new THREE.Mesh(tipGeo, tipMat);
            tipR.position.set(0.38, -0.42, 0);
            magnetGroup.add(tipR);
            // Anéis de fluxo magnético rotativo
            const fluxGeo = new THREE.TorusGeometry(0.82, 0.035, 8, 24);
            const fluxMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
            const fluxRing = new THREE.Mesh(fluxGeo, fluxMat);
            fluxRing.rotation.x = Math.PI / 2;
            magnetGroup.add(fluxRing);
            magnetGroup.fluxRing = fluxRing;
            const magGlow = this.makeGlow(0xfbbf24, 1.5, 0.45);
            magnetGroup.add(magGlow);
            magnetGroup.position.set(laneX, powerY, spawnZ);
            magnetGroup.itemType = "magnet";
            this.scene.add(magnetGroup);
            this.collectibles.push(magnetGroup);
        } else if (rand >= 0.44 && rand < 0.56 && this.megaBoostTimer <= 0) {
            // Item Raro: Mega Boost / Ar Infinito (Cápsula de Plasma de Fusão)
            const boostGroup = new THREE.Group();
            const capsuleGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.85, 16);
            const capsuleMat = new THREE.MeshStandardMaterial({
                color: 0x10b981,
                emissive: 0x34d399,
                emissiveIntensity: 0.95,
                metalness: 0.85,
                roughness: 0.15
            });
            const capsule = new THREE.Mesh(capsuleGeo, capsuleMat);
            capsule.rotation.z = Math.PI / 4;
            boostGroup.add(capsule);
            // Núcleo de fusão ciano hiper-luminoso
            const coreGeo = new THREE.SphereGeometry(0.32, 14, 14);
            const coreMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
            const core = new THREE.Mesh(coreGeo, coreMat);
            boostGroup.add(core);
            // Anéis de plasma em rotação cruzada
            const rGeo = new THREE.TorusGeometry(0.65, 0.045, 6, 24);
            const rMat = new THREE.MeshBasicMaterial({ color: 0x6ee7b7 });
            const ring1 = new THREE.Mesh(rGeo, rMat);
            ring1.rotation.x = Math.PI / 2;
            boostGroup.add(ring1);
            boostGroup.ring1 = ring1;
            const ring2 = new THREE.Mesh(rGeo, rMat);
            ring2.rotation.y = Math.PI / 2;
            boostGroup.add(ring2);
            boostGroup.ring2 = ring2;
            const glow = this.makeGlow(0x10b981, 1.5, 0.42);
            boostGroup.add(glow);
            boostGroup.position.set(laneX, powerY, spawnZ);
            boostGroup.itemType = "megaboost";
            this.scene.add(boostGroup);
            this.collectibles.push(boostGroup);
        } else {
            const count = 4;
            const coinY = spawnInAir ? FLIGHT_Y : 1.25;
            // Aro externo dourado metálico nítido (sem ofuscar)
            const rimGeo = new THREE.CylinderGeometry(0.44, 0.44, 0.09, 24).rotateX(Math.PI / 2);
            const rimMat = new THREE.MeshStandardMaterial({
                color: 0xed9a0c,
                emissive: 0x78350f,
                emissiveIntensity: 0.12,
                metalness: 0.88,
                roughness: 0.28
            });
            // Centro dourado polido com relevo elegante
            const coreGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.11, 18).rotateX(Math.PI / 2);
            const coreMat = new THREE.MeshStandardMaterial({
                color: 0xf5b731,
                emissive: 0x451a03,
                emissiveIntensity: 0.08,
                metalness: 0.85,
                roughness: 0.32
            });
            // Emblema central contrastante (losango dourado escurecido, não branco estourado)
            const emblemGeo = new THREE.BoxGeometry(0.16, 0.16, 0.13);
            const emblemMat = new THREE.MeshStandardMaterial({
                color: 0xa16207,
                metalness: 0.6,
                roughness: 0.4
            });
            for (let c = 0; c < count; c++) {
                const coinGroup = new THREE.Group();
                const rim = new THREE.Mesh(rimGeo, rimMat);
                coinGroup.add(rim);
                const core = new THREE.Mesh(coreGeo, coreMat);
                coinGroup.add(core);
                const emblem = new THREE.Mesh(emblemGeo, emblemMat);
                emblem.rotation.z = Math.PI / 4;
                coinGroup.add(emblem);
                // Halo de brilho suave e discreto (sem ofuscar a visão)
                const glow = this.makeGlow(0xfbbf24, 0.85, 0.18);
                coinGroup.add(glow);
                coinGroup.glowSprite = glow;
                // Posição e orientação voltada para a câmera
                coinGroup.position.set(laneX, coinY, spawnZ - (c * 4.5));
                coinGroup.rotation.x = -0.15; // leve inclinação para a visão do piloto
                coinGroup.baseY = coinY;
                coinGroup.itemType = "coin";
                this.scene.add(coinGroup);
                this.collectibles.push(coinGroup);
            }
        }
    }
    // =================================================================
    // CONTROLES RESPONSIVOS (TECLADO, TOUCH BUTTONS E SWIPE)
    // =================================================================,

    smashTrafficCar(car) {
        car.isSmashed = true;
        const side = (car.position.x - this.truckGroup.position.x) >= 0 ? 1 : -1;
        car.smashVelocity = new THREE.Vector3(
            side * (16.0 + Math.random() * 8.0),
            14.0 + Math.random() * 8.0,
            -12.0 - Math.random() * 14.0
        );
        car.smashRot = new THREE.Vector3(
            Math.random() * 12 - 6,
            Math.random() * 14 - 7,
            Math.random() * 10 - 5
        );
        const pts = (this.activePilotPerks && this.activePilotPerks.smashBonus) || 300;
        this.addScoreEvent("SHIELD SMASH!", pts, true);
        this.sound.playShieldSmash();
        this.sound.playCrash();
        this.speakAnnouncer("Shield Smash!");
        this.triggerHaptic("hit");
        this.trackMissionProgress('shield_smash', 1);
    }

};
