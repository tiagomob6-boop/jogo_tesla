import { LANES, GROUND_Y, FLIGHT_Y, GRAVITY, SLAM_FORCE, CAR_CATALOG, PILOT_CATALOG, COIN_PACKAGES, DAILY_MISSION_DEFS, API_URL } from '../core/Config.js';

export const CarModelBuilder = (Base) => class extends Base {
    makeProfile(points, width, material, bevel = 0.05) {
        const shape = new THREE.Shape();
        shape.moveTo(points[0][0], points[0][1]);
        for (let i = 1; i < points.length; i++) shape.lineTo(points[i][0], points[i][1]);
        shape.closePath();
        const depth = Math.max(0.01, width - bevel * 2);
        const geo = new THREE.ExtrudeGeometry(shape, {
            depth,
            bevelEnabled: bevel > 0,
            bevelThickness: bevel,
            bevelSize: bevel,
            bevelSegments: 2,
            curveSegments: 4
        });
        geo.translate(0, 0, -depth / 2);
        geo.rotateY(Math.PI / 2);
        geo.computeVertexNormals();
        const mesh = new THREE.Mesh(geo, material);
        mesh.castShadow = true;
        return mesh;
    }



    makeBox(w, h, d, mat, x, y, z) {
        const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
        m.position.set(x, y, z);
        return m;
    }

    // Roda com pneu, aro e raios (os raios deixam a rotação visível)


    addWheels(positions, radius, width, tireMat, rimMat, spokes = 5) {
        positions.forEach(pos => {
            const wheel = new THREE.Group();
            const tire = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, width, 20).rotateZ(Math.PI / 2), tireMat);
            tire.castShadow = true;
            wheel.add(tire);
            const rim = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.64, radius * 0.64, width + 0.02, 18).rotateZ(Math.PI / 2), rimMat);
            wheel.add(rim);
            const spokeGeo = new THREE.BoxGeometry(width + 0.05, radius * 1.2, 0.06);
            for (let s = 0; s < spokes; s++) {
                const sp = new THREE.Mesh(spokeGeo, tireMat);
                sp.rotation.x = (s / spokes) * Math.PI;
                wheel.add(sp);
            }
            wheel.position.set(pos[0], pos[1], pos[2]);
            this.truckGroup.add(wheel);
            this.wheels.push(wheel);
        });
    }



    buildPlayerVehicle(carId = 'roadster') {
        if (this.truckGroup) {
            this.scene.remove(this.truckGroup);
        }

        this.selectedCar = carId;
        this.truckGroup = new THREE.Group();
        this.wheels = [];
        this.exhaustFlames = null;
        this.underglow = null;

        const G = this.truckGroup;
        const tireMat = new THREE.MeshStandardMaterial({ color: 0x15161b, roughness: 0.85, metalness: 0.1 });
        const glassMat = new THREE.MeshStandardMaterial({ color: 0x1a1d27, roughness: 0.12, metalness: 0.3 });

        if (carId === 'cybertruck') {
            // -------------------------------------------------------------
            // CYBERTRUCK APEX: perfil triangular em aço inox escovado
            // -------------------------------------------------------------
            const steel = new THREE.MeshStandardMaterial({
                color: 0xc3cad5, roughness: 0.38, metalness: 0.45, flatShading: true
            });
            const cladding = new THREE.MeshStandardMaterial({ color: 0x2a2c33, roughness: 0.9, metalness: 0.1 });
            const white = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const red = new THREE.MeshBasicMaterial({ color: 0xff1a3c });

            // Casco em cunha (nariz baixo, ápice no teto, caçamba reta)
            G.add(this.makeProfile([[-2.4, 0.4], [2.35, 0.4], [2.45, 0.62], [2.4, 0.86], [-0.15, 1.52], [-2.4, 1.02]], 2.1, steel, 0.03));
            // Faixa de vidro escuro lateral/para-brisa
            G.add(this.makeProfile([[1.7, 1.0], [-0.12, 1.5], [-1.3, 1.24], [-1.3, 1.0]], 2.14, glassMat, 0));
            // Proteção inferior (saia) em plástico escuro
            G.add(this.makeProfile([[-2.43, 0.3], [2.38, 0.3], [2.43, 0.56], [-2.43, 0.56]], 2.16, cladding, 0));
            // Linha de vinco da caçamba
            G.add(this.makeBox(2.12, 0.03, 2.2, cladding, 0, 1.03, 1.3));

            // Barra de LED dianteira e traseira de ponta a ponta
            G.add(this.makeBox(2.05, 0.05, 0.05, white, 0, 0.86, -2.43));
            G.add(this.makeBox(2.08, 0.07, 0.06, red, 0, 0.97, 2.43));
            [-0.8, 0, 0.8].forEach(x => {
                const g = this.makeGlow(0xff2244, 0.8, 0.55);
                g.position.set(x, 0.97, 2.5);
                G.add(g);
            });

            this.addWheels(
                [[-1.1, 0.47, -1.55], [1.1, 0.47, -1.55], [-1.1, 0.47, 1.55], [1.1, 0.47, 1.55]],
                0.47, 0.38, tireMat,
                new THREE.MeshStandardMaterial({ color: 0x6b707c, metalness: 0.4, roughness: 0.4, flatShading: true }),
                3
            );

        } else if (carId === 'phantom') {
            // -------------------------------------------------------------
            // NEON PHANTOM: carro largo e rebaixado, roxo com neon ciano
            // -------------------------------------------------------------
            const paint = new THREE.MeshStandardMaterial({
                color: 0x5a23a6, roughness: 0.3, metalness: 0.35
            });
            const dark = new THREE.MeshStandardMaterial({ color: 0x14101f, roughness: 0.5, metalness: 0.4 });
            const neon = new THREE.MeshBasicMaterial({ color: 0x22f3ff });

            G.add(this.makeProfile([[-2.25, 0.24], [2.25, 0.24], [2.38, 0.34], [2.2, 0.44], [1.0, 0.58], [-1.3, 0.64], [-2.25, 0.6]], 2.2, paint, 0.06));
            // Cockpit em bolha
            G.add(this.makeProfile([[0.95, 0.55], [0.2, 0.95], [-0.7, 0.96], [-1.25, 0.62]], 1.35, glassMat, 0.05));

            // Saias laterais e faixas de neon no capô
            [-1.13, 1.13].forEach(x => G.add(this.makeBox(0.05, 0.05, 3.9, neon, x, 0.3, 0)));
            [-0.45, 0.45].forEach(x => G.add(this.makeBox(0.07, 0.03, 1.4, neon, x, 0.6, -1.4)));

            // Barbatanas verticais + aerofólio flutuante com borda neon
            [-0.75, 0.75].forEach(x => G.add(this.makeBox(0.06, 0.48, 0.7, paint, x, 0.86, 1.85)));
            G.add(this.makeBox(1.95, 0.05, 0.45, dark, 0, 1.1, 1.95));
            G.add(this.makeBox(1.95, 0.03, 0.04, neon, 0, 1.12, 2.18));

            // Lanternas ciano divididas
            [-0.6, 0.6].forEach(x => {
                G.add(this.makeBox(0.75, 0.06, 0.05, neon, x, 0.5, 2.27));
                const g = this.makeGlow(0x22f3ff, 0.9, 0.6);
                g.position.set(x, 0.5, 2.35);
                G.add(g);
            });

            // Underglow: luz neon refletida no asfalto
            const ugMat = new THREE.MeshBasicMaterial({
                map: this.getSoftTexture(), color: 0x22e5ff, transparent: true, opacity: 0.55,
                blending: THREE.AdditiveBlending, depthWrite: false
            });
            const underglow = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 6.0), ugMat);
            underglow.rotation.x = -Math.PI / 2;
            underglow.position.y = 0.03;
            G.add(underglow);
            this.underglow = underglow;

            this.addWheels(
                [[-1.05, 0.4, -1.35], [1.05, 0.4, -1.35], [-1.05, 0.4, 1.35], [1.05, 0.4, 1.35]],
                0.4, 0.32, tireMat, neon, 4
            );

        } else if (carId === 'solaris') {
            // -------------------------------------------------------------
            // SOLARIS HYPERCAR: dourado, cauda longa, barbatana e 4 escapes
            // -------------------------------------------------------------
            const gold = new THREE.MeshStandardMaterial({
                color: 0xf0b030, roughness: 0.28, metalness: 0.5
            });
            const carbon = new THREE.MeshStandardMaterial({ color: 0x17181d, roughness: 0.55, metalness: 0.35 });
            const orange = new THREE.MeshBasicMaterial({ color: 0xff7a1a });

            G.add(this.makeProfile([[-2.55, 0.26], [2.3, 0.26], [2.45, 0.36], [2.25, 0.46], [0.9, 0.64], [-0.4, 0.8], [-2.2, 0.66], [-2.55, 0.52]], 2.15, gold, 0.06));
            // Cockpit em gota
            G.add(this.makeProfile([[1.0, 0.6], [0.35, 0.98], [-0.5, 1.0], [-1.6, 0.7]], 1.3, glassMat, 0.05));
            // Barbatana dorsal de carbono
            G.add(this.makeProfile([[-0.6, 0.95], [-2.45, 0.62], [-2.45, 1.12]], 0.07, carbon, 0));
            // Splitter dianteiro, difusor traseiro e entradas de ar laterais
            G.add(this.makeBox(2.2, 0.05, 0.5, carbon, 0, 0.26, -2.25));
            G.add(this.makeBox(1.9, 0.16, 0.3, carbon, 0, 0.33, 2.45));
            [-1.12, 1.12].forEach(x => G.add(this.makeBox(0.05, 0.22, 0.9, carbon, x, 0.48, 0.6)));

            // Lanterna laranja fina de ponta a ponta
            G.add(this.makeBox(2.0, 0.04, 0.05, orange, 0, 0.6, 2.53));

            // Quatro escapes com chamas tremulando
            this.exhaustFlames = [];
            [-0.45, -0.17, 0.17, 0.45].forEach(x => {
                const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.2, 10).rotateX(Math.PI / 2), carbon);
                pipe.position.set(x, 0.4, 2.58);
                G.add(pipe);
                const flame = this.makeGlow(0xff8a2a, 0.55, 0.95);
                flame.position.set(x, 0.4, 2.72);
                G.add(flame);
                this.exhaustFlames.push(flame);
            });

            this.addWheels(
                [[-1.05, 0.42, -1.4], [1.05, 0.42, -1.4], [-1.05, 0.42, 1.45], [1.05, 0.42, 1.45]],
                0.42, 0.34, carbon, gold, 5
            );

        } else if (carId === 'rusty') {
            // -------------------------------------------------------------
            // RUSTY ROD 1984: clássico enferrujado, para-choque de ferro fundido e escape lateral
            // -------------------------------------------------------------
            const rustPaint = new THREE.MeshStandardMaterial({
                color: 0x824424, // Marrom avermelhado de ferrugem oxidada
                roughness: 0.95,
                metalness: 0.15,
                flatShading: true
            });
            const ironBumper = new THREE.MeshStandardMaterial({ color: 0x221f1d, roughness: 0.85, metalness: 0.4 });
            const patchMat = new THREE.MeshStandardMaterial({ color: 0x543220, roughness: 0.9 });
            const dirtyGlass = new THREE.MeshStandardMaterial({ color: 0x1f1f1a, roughness: 0.4, opacity: 0.88, transparent: true });
            const dimYellow = new THREE.MeshBasicMaterial({ color: 0xffd152 });
            const brokenHeadlight = new THREE.MeshStandardMaterial({ color: 0x332211, roughness: 0.9 });
            const oldRed = new THREE.MeshBasicMaterial({ color: 0xcc2222 });

            // Casco angular estilo clássico muscle/sedan anos 80
            G.add(this.makeProfile([[-2.2, 0.32], [2.15, 0.32], [2.25, 0.48], [2.1, 0.68], [0.8, 0.72], [-1.3, 0.72], [-2.15, 0.65], [-2.2, 0.48]], 2.05, rustPaint, 0.04));
            // Cabine quadrada clássica
            G.add(this.makeProfile([[0.75, 0.72], [0.35, 1.18], [-0.95, 1.18], [-1.4, 0.72]], 1.55, dirtyGlass, 0.03));
            // Teto em metal enferrujado
            G.add(this.makeBox(1.6, 0.05, 1.45, rustPaint, 0, 1.2, -0.3));

            // Para-choques pesados de ferro fundido
            G.add(this.makeBox(2.15, 0.18, 0.18, ironBumper, 0, 0.42, -2.25));
            G.add(this.makeBox(2.15, 0.18, 0.18, ironBumper, 0, 0.42, 2.2));

            // Remendos de chapa de ferro na lataria
            G.add(this.makeBox(0.8, 0.25, 0.03, patchMat, 0.5, 0.56, -1.0));
            G.add(this.makeBox(0.6, 0.3, 0.03, patchMat, -0.6, 0.52, 0.8));

            // Grade dianteira exposta com aletas de ferro
            G.add(this.makeBox(1.3, 0.22, 0.06, ironBumper, 0, 0.55, -2.22));

            // Faróis assimétricos (um amarelo vintage e outro quebrado)
            G.add(this.makeBox(0.24, 0.18, 0.06, dimYellow, -0.7, 0.55, -2.22));
            G.add(this.makeBox(0.24, 0.18, 0.06, brokenHeadlight, 0.7, 0.55, -2.22));

            // Escapamento lateral saindo pela lateral direita do carro
            const sidePipe = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.2, 8).rotateX(Math.PI / 2), ironBumper);
            sidePipe.position.set(1.08, 0.32, 1.2);
            G.add(sidePipe);

            // Lanternas traseiras retangulares vintage
            [-0.7, 0.7].forEach(x => {
                G.add(this.makeBox(0.4, 0.12, 0.05, oldRed, x, 0.56, 2.22));
                const g = this.makeGlow(0xff3322, 0.6, 0.5);
                g.position.set(x, 0.56, 2.28);
                G.add(g);
            });

            // Rodas de ferro antigas com aros oxidados e calotas escuras
            const oldRim = new THREE.MeshStandardMaterial({ color: 0x4a2a1a, roughness: 0.85, metalness: 0.3 });
            this.addWheels(
                [[-1.02, 0.4, -1.3], [1.02, 0.4, -1.3], [-1.02, 0.4, 1.35], [1.02, 0.4, 1.35]],
                0.41, 0.34, tireMat, oldRim, 4
            );

        } else {
            // -------------------------------------------------------------
            // TESLA ROADSTER 2077: branco pérola, cunha baixa e LED vermelho
            // -------------------------------------------------------------
            const pearl = new THREE.MeshStandardMaterial({
                color: 0xf4f5f8, roughness: 0.3, metalness: 0.15
            });
            const dark = new THREE.MeshStandardMaterial({ color: 0x1b1d24, roughness: 0.6, metalness: 0.3 });
            const red = new THREE.MeshBasicMaterial({ color: 0xff1a3c });
            const white = new THREE.MeshBasicMaterial({ color: 0xffffff });

            G.add(this.makeProfile([[-2.15, 0.28], [2.05, 0.28], [2.22, 0.4], [2.1, 0.52], [0.9, 0.66], [-1.5, 0.76], [-2.12, 0.72], [-2.2, 0.5]], 2.0, pearl, 0.07));
            // Capota de vidro escuro
            G.add(this.makeProfile([[1.05, 0.62], [0.25, 1.08], [-0.75, 1.1], [-1.55, 0.74]], 1.5, glassMat, 0.05));
            // Lábio do spoiler integrado
            G.add(this.makeBox(1.85, 0.05, 0.3, pearl, 0, 0.8, 1.98));
            // Difusor traseiro
            G.add(this.makeBox(1.7, 0.14, 0.2, dark, 0, 0.35, 2.17));
            // Retrovisores
            [-0.95, 0.95].forEach(x => G.add(this.makeBox(0.18, 0.08, 0.12, pearl, x, 0.8, -0.55)));
            // Faróis dianteiros
            [-0.65, 0.65].forEach(x => G.add(this.makeBox(0.5, 0.05, 0.05, white, x, 0.5, -2.16)));

            // LED traseiro vermelho de ponta a ponta + brilho
            G.add(this.makeBox(1.9, 0.06, 0.06, red, 0, 0.64, 2.2));
            [-0.7, 0, 0.7].forEach(x => {
                const g = this.makeGlow(0xff2244, 0.75, 0.55);
                g.position.set(x, 0.64, 2.28);
                G.add(g);
            });

            this.addWheels(
                [[-1.0, 0.4, -1.3], [1.0, 0.4, -1.3], [-1.0, 0.4, 1.32], [1.0, 0.4, 1.32]],
                0.4, 0.32, tireMat,
                new THREE.MeshStandardMaterial({ color: 0xd9dce3, metalness: 0.3, roughness: 0.35 }),
                5
            );
        }

        // Bolha de Força do Escudo Protetor (Mais escuro, fumê e compacto sobre a lataria do carro)
        const shieldBubbleGeo = new THREE.SphereGeometry(1.5, 32, 20);
        shieldBubbleGeo.scale(0.98, 0.55, 1.22);
        const honeycombTex = this.getHoneycombShieldTexture();
        const shieldBubbleMat = new THREE.MeshStandardMaterial({
            map: honeycombTex,
            emissiveMap: honeycombTex,
            color: 0x071b30,
            emissive: 0x1d4e7d,
            emissiveIntensity: 0.52,
            transparent: true,
            opacity: 0.0,
            roughness: 0.25,
            metalness: 0.7,
            side: THREE.DoubleSide,
            depthWrite: false,
            blending: THREE.NormalBlending
        });
        this.shieldBubble = new THREE.Mesh(shieldBubbleGeo, shieldBubbleMat);
        this.shieldBubble.position.set(0, 0.52, 0);
        this.shieldBubble.visible = this.shieldTimer > 0;
        this.truckGroup.add(this.shieldBubble);

        this.scene.add(this.truckGroup);
        this.truckGroup.position.set(this.playerX, this.playerY, 0);

        // Sombra de contato escura projetada sob o chassi do carro
        if (!this.playerShadow) {
            const shadowGeo = new THREE.PlaneGeometry(2.3, 4.6);
            const shadowMat = new THREE.MeshBasicMaterial({
                map: this.getSoftTexture(),
                color: 0x080612,
                transparent: true,
                opacity: 0.58,
                depthWrite: false
            });
            this.playerShadow = new THREE.Mesh(shadowGeo, shadowMat);
            this.playerShadow.rotation.x = -Math.PI / 2;
            this.playerShadow.position.set(this.playerX, GROUND_Y + 0.02, 0);
            this.scene.add(this.playerShadow);
        }
    }

    // Rastro de fumaça branca suave e transparente (sprites com textura radial)


    buildRivalVehicle(carId = 'phantom', nickname = 'Rival', isLocalP2 = false) {
        if (this.mpRivalVehicle) {
            this.scene.remove(this.mpRivalVehicle);
            this.mpRivalVehicle = null;
        }

        const G = new THREE.Group();
        const accentColor = isLocalP2 ? 0xec4899 : 0x06b6d4;
        const accentHex = isLocalP2 ? "#ec4899" : "#38bdf8";
        const darkMat = new THREE.MeshStandardMaterial({ color: 0x12141c, roughness: 0.6, metalness: 0.4 });
        const paintMat = new THREE.MeshStandardMaterial({
            color: isLocalP2 ? 0xd946ef : 0x0284c7,
            roughness: 0.28,
            metalness: 0.5
        });
        const neonMat = new THREE.MeshBasicMaterial({ color: accentColor });
        const glassMat = new THREE.MeshStandardMaterial({ color: 0x11131a, roughness: 0.15, metalness: 0.3 });
        const tireMat = new THREE.MeshStandardMaterial({ color: 0x15161b, roughness: 0.85, metalness: 0.1 });

        // Carroceria aerodinâmica do Rival
        G.add(this.makeProfile([[-2.2, 0.26], [2.15, 0.26], [2.3, 0.38], [2.15, 0.5], [0.95, 0.65], [-1.35, 0.72], [-2.2, 0.6]], 2.1, paintMat, 0.05));
        G.add(this.makeProfile([[0.9, 0.6], [0.22, 1.02], [-0.7, 1.02], [-1.3, 0.68]], 1.4, glassMat, 0.04));

        // Detalhes em Neon Futurista
        [-1.08, 1.08].forEach(x => G.add(this.makeBox(0.06, 0.05, 3.8, neonMat, x, 0.32, 0)));
        [-0.7, 0.7].forEach(x => G.add(this.makeBox(0.06, 0.42, 0.6, paintMat, x, 0.82, 1.75)));
        G.add(this.makeBox(1.9, 0.04, 0.4, darkMat, 0, 1.05, 1.85));
        G.add(this.makeBox(1.9, 0.03, 0.04, neonMat, 0, 1.07, 2.05));

        // Faróis dianteiros e lanterna traseira neon
        [-0.65, 0.65].forEach(x => {
            G.add(this.makeBox(0.45, 0.05, 0.05, neonMat, x, 0.48, -2.15));
        });
        G.add(this.makeBox(1.85, 0.06, 0.06, neonMat, 0, 0.62, 2.15));

        // Rodas do Rival
        [[-1.05, 0.45, -1.4], [1.05, 0.45, -1.4], [-1.05, 0.45, 1.4], [1.05, 0.45, 1.4]].forEach(pos => {
            const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.44, 0.32, 16).rotateZ(Math.PI / 2), tireMat);
            wheel.position.set(pos[0], pos[1], pos[2]);
            G.add(wheel);
        });

        // Sombra de Contato
        const shadowGeo = new THREE.PlaneGeometry(2.6, 4.8);
        shadowGeo.rotateX(-Math.PI / 2);
        const shadowMat = new THREE.MeshBasicMaterial({
            map: this.getSoftTexture(),
            color: 0x000000,
            transparent: true,
            opacity: 0.55,
            depthWrite: false
        });
        const shadow = new THREE.Mesh(shadowGeo, shadowMat);
        shadow.position.y = 0.06;
        G.add(shadow);

        // Overhead Name Tag Sprite Flutuante com o Nickname
        this.mpRivalTag = this.createNameTagSprite(nickname, accentHex);
        G.add(this.mpRivalTag);

        G.position.set(LANES[2], GROUND_Y, -2.0);
        this.scene.add(G);
        this.mpRivalVehicle = G;
    }



    emitRearSmokeCloud() {
        let color = 0xffffff;
        if (this.isFlying) color = 0xdff7ff;
        else if (this.selectedCar === 'phantom') color = 0xeadfff;
        else if (this.selectedCar === 'solaris') color = 0xfff0e0;
        else if (this.selectedCar === 'rusty') color = 0x8c7865;

        const tex = this.getSoftTexture();
        const rearZ = this.truckGroup.position.z + 2.5;
        for (let i = 0; i < 2; i++) {
            const mat = new THREE.SpriteMaterial({ map: tex, color, transparent: true, opacity: 0, depthWrite: false });
            const p = new THREE.Sprite(mat);
            const side = i === 0 ? -0.55 : 0.55;
            p.position.set(
                this.truckGroup.position.x + side + (Math.random() - 0.5) * 0.2,
                this.truckGroup.position.y + 0.25 + Math.random() * 0.1,
                rearZ
            );
            const s = 0.45 + Math.random() * 0.2;
            p.scale.set(s, s, 1);
            p.velocity = new THREE.Vector3(
                side * 0.9 + (Math.random() - 0.5) * 0.5,
                0.2 + Math.random() * 0.4,
                this.currentSpeed * 0.55 + Math.random() * 4.0
            );
            p.life = 0.55;
            p.maxLife = 0.55;
            p.baseOpacity = this.isFlying ? 0.5 : 0.38;
            p.growth = 2.6;

            this.scene.add(p);
            this.smokeParticles.push(p);
        }
    }



    createLateralAirPuff(origin, direction) {
        for (let i = 0; i < 8; i++) {
            const pGeo = new THREE.SphereGeometry(0.12 + Math.random() * 0.08, 5, 5);
            const pMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
            const p = new THREE.Mesh(pGeo, pMat);
            p.position.copy(origin);
            p.velocity = new THREE.Vector3(
                direction.x * (8.0 + Math.random() * 6.0),
                (Math.random() - 0.5) * 1.5,
                (Math.random() - 0.5) * 2.0
            );
            p.life = 0.24;
            p.maxLife = 0.24;
            this.scene.add(p);
            this.airPuffParticles.push(p);
        }
    }

    // =================================================================
    // TRÂNSITO (CARROS SEDAN LARANJA, PRATA E CINZA)
    // =================================================================


};
