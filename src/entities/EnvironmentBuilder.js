import { LANES, GROUND_Y, FLIGHT_Y } from '../core/Config.js';

export const EnvironmentBuilder = {
    initThree() {
        this.scene = new THREE.Scene();
        
        // Cor da névoa = cor do horizonte do céu (transição suave)
        const HORIZON_COLOR = 0xf2a07e;
        this.scene.background = new THREE.Color(HORIZON_COLOR);
        this.scene.fog = new THREE.FogExp2(HORIZON_COLOR, 0.0052);
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 650);
        this.updateCameraLayout();
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        // ---------------------------------------------------------
        // CÉU EM DEGRADÊ: roxo no topo -> rosa -> laranja no horizonte
        // ---------------------------------------------------------
        this.skyMaterial = new THREE.ShaderMaterial({
            side: THREE.BackSide,
            depthWrite: false,
            fog: false,
            uniforms: {
                topColor: { value: new THREE.Color(0x3a2a6e) },
                midColor: { value: new THREE.Color(0xc76a9c) },
                horizonColor: { value: new THREE.Color(HORIZON_COLOR) },
                sunDir: { value: new THREE.Vector3(-55, 18, -310).normalize() }
            },
            vertexShader: `
                varying vec3 vDir;
                void main() {
                    vDir = normalize(position);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 topColor;
                uniform vec3 midColor;
                uniform vec3 horizonColor;
                uniform vec3 sunDir;
                varying vec3 vDir;
                void main() {
                    float h = clamp(vDir.y, -0.2, 1.0);
                    vec3 col = mix(horizonColor, midColor, smoothstep(0.02, 0.22, h));
                    col = mix(col, topColor, smoothstep(0.22, 0.65, h));
                    // brilho quente em volta do sol
                    float s = max(dot(normalize(vDir), sunDir), 0.0);
                    col += vec3(1.0, 0.55, 0.3) * pow(s, 18.0) * 0.35;
                    gl_FragColor = vec4(col, 1.0);
                }
            `
        });
        const sky = new THREE.Mesh(new THREE.SphereGeometry(600, 32, 16), this.skyMaterial);
        sky.renderOrder = -10;
        sky.frustumCulled = false;
        this.scene.add(sky);
        // Obs.: não usamos environment map (PMREM) porque em várias GPUs de
        // celular ele deixa todos os materiais pretos. A iluminação do carro
        // vem da luz de preenchimento + contorno abaixo.
        // Luz solar poente (vinda da frente, cria contorno nas bordas)
        const sunLight = new THREE.DirectionalLight(0xffb98a, 1.5);
        sunLight.position.set(-35, 24, -120);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 1024;
        sunLight.shadow.mapSize.height = 1024;
        this.scene.add(sunLight);
        this.sunLight = sunLight;
        // LUZ DE PREENCHIMENTO atrás da câmera: ilumina a traseira do carro
        const fillLight = new THREE.DirectionalLight(0xffe4ee, 1.3);
        fillLight.position.set(3, 4.5, 22);
        fillLight.target.position.set(0, 0.5, 0);
        this.scene.add(fillLight);
        this.scene.add(fillLight.target);
        this.fillLight = fillLight;
        // Luz de contorno lateral (rim light rosa/lilás)
        const rimLight = new THREE.DirectionalLight(0xd59cff, 0.6);
        rimLight.position.set(18, 6, 4);
        this.scene.add(rimLight);
        this.rimLight = rimLight;
        const ambientLight = new THREE.AmbientLight(0xc98a9a, 0.55);
        this.scene.add(ambientLight);
        this.ambientLight = ambientLight;
        const hemiLight = new THREE.HemisphereLight(0xf6a3b8, 0x2a2848, 0.7);
        this.scene.add(hemiLight);
        this.hemiLight = hemiLight;
        window.addEventListener("resize", () => {
            this.updateCameraLayout();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
        window.addEventListener("orientationchange", () => {
            setTimeout(() => {
                this.updateCameraLayout();
                this.renderer.setSize(window.innerWidth, window.innerHeight);
            }, 150);
        });
    },

    updateCameraLayout() {
        const isPortrait = window.innerHeight > window.innerWidth;
        this.camera.aspect = window.innerWidth / window.innerHeight;
        if (isPortrait) {
            // MODO CELULAR VERTICAL (RETRATO): FOV maior para caber a pista toda sem cortar
            this.camera.fov = 75;
            this.camera.position.set(0, 4.8, 8.8);
            this.camera.lookAt(0, 1.2, -15);
        } else {
            // MODO PAISAGEM (DESKTOP): Visão esportiva padrão
            this.camera.fov = 60;
            this.camera.position.set(0, 4.2, 7.6);
            this.camera.lookAt(0, 1.4, -14);
        }
        this.camera.updateProjectionMatrix();
    }
    // =================================================================
    // CENÁRIO: PONTE COM CHÃO SÓLIDO / CALÇADA PARA OS COQUEIROS
    // =================================================================,

    buildAtmosphericWorld() {
        // 1. Sol Poente Difuso e Suave (camadas de halo com blend aditivo e núcleo quente)
        const sunGroup = new THREE.Group();
        const sunLayers = [
            { r: 20, color: 0xfffbe8, opacity: 1.0, blend: THREE.NormalBlending, z: -308 },
            { r: 32, color: 0xffba70, opacity: 0.6, blend: THREE.AdditiveBlending, z: -309 },
            { r: 52, color: 0xff7050, opacity: 0.35, blend: THREE.AdditiveBlending, z: -310 },
            { r: 85, color: 0xe04575, opacity: 0.18, blend: THREE.AdditiveBlending, z: -311 }
        ];
        sunLayers.forEach(l => {
            const m = new THREE.Mesh(
                new THREE.CircleGeometry(l.r, 48),
                new THREE.MeshBasicMaterial({
                    color: l.color,
                    transparent: l.opacity < 1.0,
                    opacity: l.opacity,
                    blending: l.blend,
                    fog: false,
                    depthWrite: false
                })
            );
            m.position.set(-55, 18, l.z);
            sunGroup.add(m);
        });
        this.scene.add(sunGroup);
        this.sunGroup = sunGroup;
        // 1b. Lua Synthwave Neon com anéis de halo e frisos de horizonte noturno
        this.moonGroup = new THREE.Group();
        const moonLayers = [
            { r: 24, color: 0xf472b6, opacity: 1.0, blend: THREE.NormalBlending, z: -308 },
            { r: 38, color: 0xa855f7, opacity: 0.65, blend: THREE.AdditiveBlending, z: -309 },
            { r: 62, color: 0x38bdf8, opacity: 0.35, blend: THREE.AdditiveBlending, z: -310 },
            { r: 95, color: 0x4f46e5, opacity: 0.18, blend: THREE.AdditiveBlending, z: -311 }
        ];
        moonLayers.forEach(l => {
            const m = new THREE.Mesh(
                new THREE.CircleGeometry(l.r, 48),
                new THREE.MeshBasicMaterial({
                    color: l.color,
                    transparent: l.opacity < 1.0,
                    opacity: l.opacity,
                    blending: l.blend,
                    fog: false,
                    depthWrite: false
                })
            );
            m.position.set(50, -50, l.z);
            this.moonGroup.add(m);
        });
        for (let si = -16; si <= 16; si += 6) {
            const slat = new THREE.Mesh(
                new THREE.PlaneGeometry(48, 2.2),
                new THREE.MeshBasicMaterial({ color: 0x070318, fog: false, depthWrite: false })
            );
            slat.position.set(50, -50 + si, -307);
            this.moonGroup.add(slat);
        }
        this.scene.add(this.moonGroup);
        // 1c. Campo Estelar Cintilante (500 estrelas synthwave)
        const starCount = 500;
        const starPositions = new Float32Array(starCount * 3);
        for (let i = 0; i < starCount; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * (Math.PI * 0.45);
            const rad = 540;
            starPositions[i * 3] = rad * Math.sin(phi) * Math.cos(theta);
            starPositions[i * 3 + 1] = Math.max(15, rad * Math.cos(phi));
            starPositions[i * 3 + 2] = rad * Math.sin(phi) * Math.sin(theta);
        }
        const starGeo = new THREE.BufferGeometry();
        starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
        const starMat = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 2.2,
            transparent: true,
            opacity: 0.0,
            fog: false
        });
        this.starField = new THREE.Points(starGeo, starMat);
        this.scene.add(this.starField);
        // 2. Oceano com reflexo suave
        const oceanGeo = new THREE.PlaneGeometry(1200, 1200);
        const oceanMat = new THREE.MeshStandardMaterial({ color: 0x2d2440, roughness: 0.25, metalness: 0.75 });
        this.ocean = new THREE.Mesh(oceanGeo, oceanMat);
        this.ocean.rotation.x = -Math.PI / 2;
        this.ocean.position.y = -3.8;
        this.scene.add(this.ocean);
        // 3. Pista de Rodovia da Ponte (3 Faixas)
        const segmentLength = 70;
        const totalSegments = 6;
        const roadWidth = 14.5;
        const roadGeo = new THREE.PlaneGeometry(roadWidth, segmentLength);
        // Asfalto fosco: rugoso e pouco metálico para evitar o brilho branco estourado
        const roadMat = new THREE.MeshStandardMaterial({ color: 0x3c3945, roughness: 0.82, metalness: 0.05 });
        for (let i = 0; i < totalSegments; i++) {
            const roadMesh = new THREE.Mesh(roadGeo, roadMat);
            roadMesh.rotation.x = -Math.PI / 2;
            roadMesh.position.set(0, 0, -i * segmentLength + 25);
            roadMesh.receiveShadow = true;
            this.scene.add(roadMesh);
            // Adiciona a ponte com CALÇADA SÓLIDA para os coqueiros
            this.addBridgeArchitecture(roadMesh, roadWidth, segmentLength);
            this.roadSegments.push(roadMesh);
        }
        // 4. Coqueiros firmemente plantados sobre o chão da calçada (X = -9.25, Y = 0.5)
        for (let i = 0; i < 28; i++) {
            const palm = this.createPalmTree();
            palm.position.set(-9.25, 0.45, -i * 22);
            this.scene.add(palm);
            this.palmTrees.push(palm);
        }
        // 5. Metrópole / Skyline Costeiro de Prédios Futuristas na Direita (cenário rico e imersivo)
        this.buildings = [];
        for (let b = 0; b < 24; b++) {
            const building = this.createSkylineBuilding();
            const bx = 48 + (b % 4) * 16 + (Math.random() - 0.5) * 6;
            const bz = -460 + b * 22 + (Math.random() - 0.5) * 6;
            building.position.set(bx, -3.8, bz);
            this.scene.add(building);
            this.buildings.push(building);
        }
    },

    addBridgeArchitecture(parentMesh, width, length) {
        // Guarda-corpo entre a pista e a calçada
        const leftBarrier = new THREE.Mesh(
            new THREE.BoxGeometry(0.35, length, 0.9),
            new THREE.MeshStandardMaterial({ color: 0xccd1dc, metalness: 0.6, roughness: 0.3 })
        );
        leftBarrier.position.set(-width / 2, 0, 0.45);
        parentMesh.add(leftBarrier);
        // =============================================================
        // CHÃO SÓLIDO / CALÇADA COSTEIRA DAS PALMEIRAS (NADA FLUTUA NO AR!)
        // =============================================================
        const sidewalkWidth = 4.2;
        const sidewalkCenterX = -width / 2 - sidewalkWidth / 2; // -7.25 - 2.1 = -9.35
        // Piso da calçada elevada
        const sidewalkGeo = new THREE.PlaneGeometry(sidewalkWidth, length);
        const sidewalkMat = new THREE.MeshStandardMaterial({
            color: 0x5a545e, // Concreto texturizado de calçadão costeiro
            roughness: 0.8,
            metalness: 0.15
        });
        const sidewalk = new THREE.Mesh(sidewalkGeo, sidewalkMat);
        sidewalk.position.set(sidewalkCenterX, 0, 0.15); // Meio-fio no nível da pista
        sidewalk.receiveShadow = true;
        parentMesh.add(sidewalk);
        // Mureta de fundação sólida descendo até a água (preenche todo o espaço até o mar)
        const foundationGeo = new THREE.BoxGeometry(sidewalkWidth, length, 4.4);
        const foundationMat = new THREE.MeshStandardMaterial({
            color: 0x3d3845,
            roughness: 0.9,
            metalness: 0.1
        });
        const foundation = new THREE.Mesh(foundationGeo, foundationMat);
        foundation.position.set(sidewalkCenterX, 0, -2.1);
        parentMesh.add(foundation);
        // Guarda-corpo externo na beirada da calçada (de frente para o mar)
        const outerBarrier = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, length, 0.9),
            new THREE.MeshStandardMaterial({ color: 0xb5bac7, metalness: 0.6, roughness: 0.3 })
        );
        outerBarrier.position.set(sidewalkCenterX - sidewalkWidth / 2 + 0.15, 0, 0.6);
        parentMesh.add(outerBarrier);
        // Sombra de contato suave e escura no chão na base de cada coqueiro (sem discos marrons flutuantes)
        const shadowGeo = new THREE.PlaneGeometry(2.4, 1.4);
        const shadowMat = new THREE.MeshBasicMaterial({
            map: this.getSoftTexture(),
            color: 0x0a0510,
            transparent: true,
            opacity: 0.38,
            depthWrite: false
        });
        for (let pz = -length / 2 + 10; pz < length / 2; pz += 22) {
            const shadow = new THREE.Mesh(shadowGeo, shadowMat);
            shadow.position.set(sidewalkCenterX, pz, 0.16);
            parentMesh.add(shadow);
        }
        // =============================================================
        // GUARDA-CORPO E GRADE ESTRUTURAL DA PONTE NA LATERAL DIREITA
        // =============================================================
        const rightEdgeX = width / 2; // +7.25
        // Mureta base contínua de concreto limpo
        const rightCurb = new THREE.Mesh(
            new THREE.BoxGeometry(0.45, length, 0.75),
            new THREE.MeshStandardMaterial({ color: 0x4a4754, roughness: 0.7, metalness: 0.2 })
        );
        rightCurb.position.set(rightEdgeX + 0.22, 0, 0.375);
        parentMesh.add(rightCurb);
        // Friso linear de LED guia de pista (laranja pôr-do-sol)
        const ledStrip = new THREE.Mesh(
            new THREE.BoxGeometry(0.08, length, 0.08),
            new THREE.MeshBasicMaterial({ color: 0xff7a36 })
        );
        ledStrip.position.set(rightEdgeX + 0.02, 0, 0.2);
        parentMesh.add(ledStrip);
        // Corrimãos horizontais metálicos duplos (Top Rail & Mid Rail)
        const railMat = new THREE.MeshStandardMaterial({ color: 0xd8dce6, metalness: 0.85, roughness: 0.25 });
        const topRail = new THREE.Mesh(
            new THREE.BoxGeometry(0.16, length, 0.12),
            railMat
        );
        topRail.position.set(rightEdgeX + 0.22, 0, 1.25);
        parentMesh.add(topRail);
        const midRail = new THREE.Mesh(
            new THREE.BoxGeometry(0.12, length, 0.08),
            railMat
        );
        midRail.position.set(rightEdgeX + 0.22, 0, 0.82);
        parentMesh.add(midRail);
        // Postes verticais de suporte a cada 3.5m
        const postGeo = new THREE.BoxGeometry(0.14, 0.14, 0.95);
        const postMat = new THREE.MeshStandardMaterial({ color: 0x8a90a0, metalness: 0.8, roughness: 0.3 });
        for (let pz = -length / 2 + 1.75; pz < length / 2; pz += 3.5) {
            const post = new THREE.Mesh(postGeo, postMat);
            post.position.set(rightEdgeX + 0.22, pz, 0.75);
            parentMesh.add(post);
        }
        // Postes de iluminação pública com luminárias estéticas ao longo da ponte
        for (let lp = -length / 2 + 15; lp < length / 2; lp += 35) {
            const lampGroup = new THREE.Group();
            const pole = new THREE.Mesh(
                new THREE.CylinderGeometry(0.09, 0.13, 4.4, 8).rotateX(Math.PI / 2),
                new THREE.MeshStandardMaterial({ color: 0xb0b6c6, metalness: 0.85, roughness: 0.25 })
            );
            pole.position.set(0, 0, 2.2);
            lampGroup.add(pole);
            const arm = new THREE.Mesh(
                new THREE.BoxGeometry(1.5, 0.09, 0.09),
                new THREE.MeshStandardMaterial({ color: 0xb0b6c6, metalness: 0.85 })
            );
            arm.position.set(-0.65, 0, 4.35);
            lampGroup.add(arm);
            const lamp = new THREE.Mesh(
                new THREE.BoxGeometry(0.45, 0.2, 0.08),
                new THREE.MeshBasicMaterial({ color: 0xfff0cc })
            );
            lamp.position.set(-1.25, 0, 4.32);
            lampGroup.add(lamp);
            lampGroup.position.set(rightEdgeX + 0.26, lp, 0);
            parentMesh.add(lampGroup);
        }
        // Faixas brancas limpas da rodovia
        const laneDividerX = [-2.4, 2.4];
        const dashGeo = new THREE.PlaneGeometry(0.18, 5.2);
        const dashMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        laneDividerX.forEach(posX => {
            for (let z = -length / 2 + 3; z < length / 2; z += 9) {
                const dash = new THREE.Mesh(dashGeo, dashMat);
                dash.position.set(posX, z, 0.02);
                parentMesh.add(dash);
            }
        });
        // Pilares sobre o mar (abaixo do piso para não vazar círculos cinzas no asfalto)
        const pillarGeo = new THREE.CylinderGeometry(0.8, 0.8, 3.8, 10);
        const pillarMat = new THREE.MeshStandardMaterial({ color: 0x828796, roughness: 0.6 });
        [-width / 2 + 1, width / 2 - 1].forEach(px => {
            const pillar = new THREE.Mesh(pillarGeo, pillarMat);
            pillar.rotation.x = Math.PI / 2;
            pillar.position.set(px, 0, -2.4);
            parentMesh.add(pillar);
        });
    },

    createPalmTree() {
        const group = new THREE.Group();
        const trunkGeo = new THREE.CylinderGeometry(0.18, 0.3, 7.5, 6);
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3d271d, roughness: 0.9 });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 3.75;
        trunk.rotation.z = -0.06;
        group.add(trunk);
        const leafMat = new THREE.MeshStandardMaterial({ color: 0x1f3b23, roughness: 0.6, side: THREE.DoubleSide });
        for (let j = 0; j < 6; j++) {
            const leafGeo = new THREE.ConeGeometry(0.85, 3.8, 4);
            leafGeo.rotateX(Math.PI / 2.8);
            const leaf = new THREE.Mesh(leafGeo, leafMat);
            leaf.position.set(0, 7.4, 0);
            leaf.rotation.y = (j / 6) * Math.PI * 2;
            group.add(leaf);
        }
        return group;
    }
    // =================================================================
    // VEÍCULOS 3D CUSTOMIZADOS: CADA CARRO COM SILHUETA PRÓPRIA
    // =================================================================
    // Textura Hexagonal Colmeia 3D com Bordas Douradas e Linhas Isométricas (Idêntica à foto enviada),

    getHoneycombShieldTexture() {
        if (this._honeycombTex) return this._honeycombTex;
        const canvas = document.createElement("canvas");
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, 512, 512);
        // Fundo escuro azul-noite cibernético para conferir tom escuro e proteger a visibilidade do carro
        const bgGrad = ctx.createRadialGradient(256, 256, 40, 256, 256, 360);
        bgGrad.addColorStop(0, "rgba(6, 18, 38, 0.45)");
        bgGrad.addColorStop(0.6, "rgba(4, 12, 28, 0.40)");
        bgGrad.addColorStop(1, "rgba(2, 7, 18, 0.35)");
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 512, 512);
        const s = 44; // Raio do hexágono
        const h = s * Math.sqrt(3);
        const w = s * 1.5;
        const drawHex = (cx, cy) => {
            const pts = [];
            for (let i = 0; i < 6; i++) {
                const a = (i * Math.PI) / 3;
                pts.push({ x: cx + s * Math.cos(a), y: cy + s * Math.sin(a) });
            }
            // Preenchimento interno translúcido fumê escuro azulado
            const hexGrad = ctx.createRadialGradient(cx, cy, 3, cx, cy, s);
            hexGrad.addColorStop(0, "rgba(12, 38, 70, 0.35)");
            hexGrad.addColorStop(0.65, "rgba(6, 22, 45, 0.38)");
            hexGrad.addColorStop(1, "rgba(2, 9, 22, 0.45)");
            ctx.fillStyle = hexGrad;
            ctx.beginPath();
            ctx.moveTo(pts[0].x, pts[0].y);
            for (let i = 1; i < 6; i++) ctx.lineTo(pts[i].x, pts[i].y);
            ctx.closePath();
            ctx.fill();
            // Linhas isométricas internas do cubo 3D (conforme foto enviada pelo usuário)
            ctx.strokeStyle = "rgba(56, 189, 248, 0.65)";
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(cx, cy); ctx.lineTo(pts[0].x, pts[0].y);
            ctx.moveTo(cx, cy); ctx.lineTo(pts[2].x, pts[2].y);
            ctx.moveTo(cx, cy); ctx.lineTo(pts[4].x, pts[4].y);
            ctx.stroke();
            // Sub-linhas concêntricas hexagonais internas em ciano brilhante
            ctx.strokeStyle = "rgba(34, 211, 238, 0.4)";
            ctx.lineWidth = 1.0;
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const a = (i * Math.PI) / 3;
                const subX = cx + (s * 0.52) * Math.cos(a);
                const subY = cy + (s * 0.52) * Math.sin(a);
                if (i === 0) ctx.moveTo(subX, subY);
                else ctx.lineTo(subX, subY);
            }
            ctx.closePath();
            ctx.stroke();
            // Borda externa hexagonal dourada reluzente / ouro âmbar (exactamente como na imagem!)
            ctx.save();
            ctx.shadowColor = "#f59e0b";
            ctx.shadowBlur = 8;
            ctx.strokeStyle = "rgba(251, 191, 36, 0.95)";
            ctx.lineWidth = 3.2;
            ctx.beginPath();
            ctx.moveTo(pts[0].x, pts[0].y);
            for (let i = 1; i < 6; i++) ctx.lineTo(pts[i].x, pts[i].y);
            ctx.closePath();
            ctx.stroke();
            // Destaque branco-dourado no núcleo da linha
            ctx.strokeStyle = "rgba(254, 243, 199, 0.85)";
            ctx.lineWidth = 1.0;
            ctx.stroke();
            ctx.restore();
        };
        for (let x = -s; x < 512 + s * 2; x += w) {
            const col = Math.round(x / w);
            const yOffset = (col % 2 === 0) ? 0 : h / 2;
            for (let y = -h; y < 512 + h * 2; y += h) {
                drawHex(x, y + yOffset);
            }
        }
        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(3, 2);
        this._honeycombTex = tex;
        return tex;
    }
    // Textura radial suave (usada em brilhos de faróis, chamas e fumaça),

    getSoftTexture() {
        if (this.softTexture) return this.softTexture;
        const c = document.createElement("canvas");
        c.width = c.height = 64;
        const g = c.getContext("2d");
        const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
        grad.addColorStop(0, "rgba(255,255,255,1)");
        grad.addColorStop(0.35, "rgba(255,255,255,0.6)");
        grad.addColorStop(1, "rgba(255,255,255,0)");
        g.fillStyle = grad;
        g.fillRect(0, 0, 64, 64);
        this.softTexture = new THREE.CanvasTexture(c);
        return this.softTexture;
    }
    // Brilho aditivo (bloom falso) para luzes do carro,

    makeGlow(color, size, opacity = 0.9) {
        const mat = new THREE.SpriteMaterial({
            map: this.getSoftTexture(),
            color,
            transparent: true,
            opacity,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const s = new THREE.Sprite(mat);
        s.scale.set(size, size, 1);
        s.userData.base = size;
        return s;
    }
    // Metrópole Costeira: Torres e Arranha-Céus Futuristas ao Fundo na Direita,

    createSkylineBuilding() {
        const group = new THREE.Group();
        const w = 7 + Math.random() * 8;
        const d = 8 + Math.random() * 10;
        const h = 32 + Math.random() * 55;
        const facadeColors = [0x1e1a2b, 0x252036, 0x181724, 0x2b233d, 0x1d2030];
        const facadeColor = facadeColors[Math.floor(Math.random() * facadeColors.length)];
        const bMat = new THREE.MeshStandardMaterial({
            color: facadeColor,
            roughness: 0.55,
            metalness: 0.35
        });
        const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), bMat);
        body.position.y = h / 2;
        group.add(body);
        // Faixas de janelas com iluminação em tom âmbar e neon
        const windowMat = new THREE.MeshBasicMaterial({
            color: Math.random() < 0.65 ? 0xffdf88 : (Math.random() < 0.5 ? 0x38bdf8 : 0xf472b6),
            transparent: true,
            opacity: 0.72
        });
        const floors = Math.floor(h / 6);
        for (let f = 1; f < floors; f++) {
            if (Math.random() < 0.28) continue;
            const band = new THREE.Mesh(new THREE.BoxGeometry(w + 0.08, 0.75, d + 0.08), windowMat);
            band.position.y = f * 6;
            group.add(band);
        }
        // Topo da torre: Antena com sinalizador de aviação ou cobertura estilizada
        if (Math.random() < 0.65) {
            const spireH = 8 + Math.random() * 10;
            const spire = new THREE.Mesh(
                new THREE.CylinderGeometry(0.08, 0.25, spireH, 6),
                new THREE.MeshStandardMaterial({ color: 0x828898, metalness: 0.9 })
            );
            spire.position.y = h + spireH / 2;
            group.add(spire);
            const beacon = this.makeGlow(0xff2233, 1.3, 0.85);
            beacon.position.y = h + spireH;
            group.add(beacon);
        } else {
            const topCap = new THREE.Mesh(
                new THREE.BoxGeometry(w * 0.7, 4.5, d * 0.7),
                bMat
            );
            topCap.position.y = h + 2.25;
            group.add(topCap);
        }
        return group;
    }
    // Carroceria a partir de um perfil lateral: [x = comprimento, y = altura]
    // A frente do perfil (x positivo) aponta para -Z (sentido da pista),

    updateDayNightCycle(delta) {
        if (!this.skyMaterial) return;
        // Transiciona gradualmente com base na distância (Ciclo completo a cada 3.200m)
        const cycleDist = 3200;
        const progress = (this.scoreDistance % cycleDist) / cycleDist;
        
        // 0.0 - 0.38: Pôr do sol clássico synthwave
        // 0.38 - 0.54: Crepúsculo transicionando para meia-noite
        // 0.54 - 0.84: Noite estrelada profunda com lua neon brilhante
        // 0.84 - 1.0: Alvorecer retornando ao pôr do sol
        let targetNight = 0;
        if (progress >= 0.38 && progress < 0.54) {
            targetNight = (progress - 0.38) / 0.16;
        } else if (progress >= 0.54 && progress < 0.84) {
            targetNight = 1.0;
        } else if (progress >= 0.84) {
            targetNight = 1.0 - (progress - 0.84) / 0.16;
        }
        this.currentNightFactor = THREE.MathUtils.lerp(this.currentNightFactor, targetNight, 0.04);
        const nf = this.currentNightFactor;
        // Cores do Céu
        const sunTop = new THREE.Color(0x3a2a6e);
        const sunMid = new THREE.Color(0xc76a9c);
        const sunHor = new THREE.Color(0xf2a07e);
        const nightTop = new THREE.Color(0x060214);
        const nightMid = new THREE.Color(0x190733);
        const nightHor = new THREE.Color(0x380f54);
        this.skyMaterial.uniforms.topColor.value.lerpColors(sunTop, nightTop, nf);
        this.skyMaterial.uniforms.midColor.value.lerpColors(sunMid, nightMid, nf);
        this.skyMaterial.uniforms.horizonColor.value.lerpColors(sunHor, nightHor, nf);
        // Fog e Background
        const sunFog = new THREE.Color(0xf2a07e);
        const nightFog = new THREE.Color(0x220938);
        const curFog = new THREE.Color().lerpColors(sunFog, nightFog, nf);
        this.scene.fog.color.copy(curFog);
        this.scene.background.copy(curFog);
        // Posição do Sol (desce no mar) e da Lua (sobe no horizonte)
        if (this.sunGroup) {
            this.sunGroup.position.y = THREE.MathUtils.lerp(0, -65, nf);
        }
        if (this.moonGroup) {
            this.moonGroup.position.y = THREE.MathUtils.lerp(-60, 68, nf);
            this.moonGroup.rotation.z += 0.05 * delta;
        }
        // Estrelas piscando suavemente no céu noturno
        if (this.starField) {
            const twinkle = 0.82 + Math.sin(performance.now() * 0.003) * 0.18;
            this.starField.material.opacity = nf * twinkle * 0.95;
        }
        // Iluminação ambiente e direcional ajustada
        if (this.sunLight) {
            this.sunLight.intensity = THREE.MathUtils.lerp(1.5, 0.45, nf);
            this.sunLight.color.lerpColors(new THREE.Color(0xffb98a), new THREE.Color(0x818cf8), nf);
        }
        if (this.ambientLight) {
            this.ambientLight.intensity = THREE.MathUtils.lerp(0.55, 0.38, nf);
            this.ambientLight.color.lerpColors(new THREE.Color(0xc98a9a), new THREE.Color(0x581c87), nf);
        }
    }

};
