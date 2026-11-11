/**
 * Environment.js
 * Criação da Rodovia Infinita Synthwave Sunset Bridge com Iluminação e Skyline Configuráveis em Tempo Real.
 */

export class Environment {
    constructor(scene) {
        this.scene = scene;
        this.roadSegments = [];
        this.skylineBuildings = [];
        this.sunMesh = null;
        this.sunLight = null;
        this.fillLight = null;
        this.ambientLight = null;
        this.fog = null;

        this.initLighting();
        this.buildSky();
        this.buildRoad();
        this.buildCitySkyline();
    }

    initLighting() {
        const HORIZON_COLOR = 0xf2a07e;
        this.scene.background = new THREE.Color(HORIZON_COLOR);
        this.fog = new THREE.FogExp2(HORIZON_COLOR, 0.0055);
        this.scene.fog = this.fog;

        // 1. Luz do Sol do Poente (Projeta sombras dinâmicas quentes)
        this.sunLight = new THREE.DirectionalLight(0xffbe85, 2.2);
        this.sunLight.position.set(-35, 26, -130);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 1024;
        this.sunLight.shadow.mapSize.height = 1024;
        this.sunLight.shadow.camera.near = 0.5;
        this.sunLight.shadow.camera.far = 300;
        this.sunLight.shadow.camera.left = -25;
        this.sunLight.shadow.camera.right = 25;
        this.sunLight.shadow.camera.top = 25;
        this.sunLight.shadow.camera.bottom = -25;
        this.scene.add(this.sunLight);

        // 2. Luz de Preenchimento Traseira (Evita sombras pretas no teto/traseira do carro)
        this.fillLight = new THREE.DirectionalLight(0xffe4ee, 1.35);
        this.fillLight.position.set(20, 18, 50);
        this.scene.add(this.fillLight);

        // 3. Luz Ambiente Quente com toque Synthwave
        this.ambientLight = new THREE.AmbientLight(0xd18ca7, 0.85);
        this.scene.add(this.ambientLight);
    }

    buildSky() {
        // Céu com gradiente dinâmico em domo esférico
        const skyGeo = new THREE.SphereGeometry(450, 32, 24);
        const skyMat = new THREE.ShaderMaterial({
            side: THREE.BackSide,
            depthWrite: false,
            fog: false,
            uniforms: {
                topColor: { value: new THREE.Color(0x3a2a6e) },    // Roxo espacial profundo
                midColor: { value: new THREE.Color(0xc76a9c) },    // Rosa crepúsculo
                horizonColor: { value: new THREE.Color(0xf2a07e) } // Laranja do poente
            },
            vertexShader: `
                varying vec3 vWorldPosition;
                void main() {
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 topColor;
                uniform vec3 midColor;
                uniform vec3 horizonColor;
                varying vec3 vWorldPosition;
                void main() {
                    float h = normalize(vWorldPosition).y;
                    vec3 col;
                    if (h > 0.2) {
                        col = mix(midColor, topColor, (h - 0.2) / 0.8);
                    } else {
                        col = mix(horizonColor, midColor, max(0.0, h + 0.05) / 0.25);
                    }
                    gl_FragColor = vec4(col, 1.0);
                }
            `
        });
        const skyMesh = new THREE.Mesh(skyGeo, skyMat);
        this.scene.add(skyMesh);

        // Sol Synthwave Neon Gigante no horizonte
        const sunGeo = new THREE.CircleGeometry(42, 48);
        const sunMat = new THREE.MeshBasicMaterial({
            color: 0xffde59,
            fog: false
        });
        this.sunMesh = new THREE.Mesh(sunGeo, sunMat);
        this.sunMesh.position.set(-35, 24, -280);
        this.scene.add(this.sunMesh);

        // Oceano / plano refletor de horizonte infinito
        const oceanGeo = new THREE.PlaneGeometry(1200, 1200);
        const oceanMat = new THREE.MeshStandardMaterial({
            color: 0x3d1d36,
            roughness: 0.15,
            metalness: 0.85
        });
        const ocean = new THREE.Mesh(oceanGeo, oceanMat);
        ocean.rotation.x = -Math.PI / 2;
        ocean.position.y = -1.2;
        this.scene.add(ocean);
    }

    buildRoad() {
        // Constrói 12 segmentos de rodovia que se repetem infinitamente
        const segmentCount = 12;
        const segmentLength = 40;
        const roadWidth = 14.5; // Espaço confortável para 3 faixas

        const asphaltMat = new THREE.MeshStandardMaterial({
            color: 0x22242a,
            roughness: 0.75,
            metalness: 0.25
        });

        const neonStripMat = new THREE.MeshBasicMaterial({ color: 0x00f7ff });
        const laneDashMat = new THREE.MeshBasicMaterial({ color: 0xffe600 });
        const guardrailMat = new THREE.MeshStandardMaterial({
            color: 0x3e4450,
            roughness: 0.35,
            metalness: 0.8
        });

        for (let i = 0; i < segmentCount; i++) {
            const seg = new THREE.Group();
            const zPos = -i * segmentLength + 20;

            // Pista de asfalto
            const roadPlane = new THREE.Mesh(
                new THREE.BoxGeometry(roadWidth, 0.4, segmentLength),
                asphaltMat
            );
            roadPlane.position.y = -0.2;
            roadPlane.receiveShadow = true;
            seg.add(roadPlane);

            // Faixas pontilhadas delimitando as 3 pistas Subway Surfers
            // Faixas divisórias em x = -1.9 e x = +1.9
            [-1.9, 1.9].forEach(laneX => {
                for (let d = -segmentLength / 2 + 3; d < segmentLength / 2; d += 8) {
                    const dash = new THREE.Mesh(
                        new THREE.BoxGeometry(0.22, 0.02, 3.8),
                        laneDashMat
                    );
                    dash.position.set(laneX, 0.02, d);
                    seg.add(dash);
                }
            });

            // Guias e muretas laterais com neon ciano contínuo
            [-roadWidth / 2, roadWidth / 2].forEach((guardX, gIdx) => {
                const rail = new THREE.Mesh(
                    new THREE.BoxGeometry(0.45, 0.8, segmentLength),
                    guardrailMat
                );
                rail.position.set(guardX, 0.35, 0);
                seg.add(rail);

                const neonGlowStrip = new THREE.Mesh(
                    new THREE.BoxGeometry(0.08, 0.1, segmentLength),
                    neonStripMat
                );
                neonGlowStrip.position.set(guardX + (gIdx === 0 ? 0.25 : -0.25), 0.72, 0);
                seg.add(neonGlowStrip);
            });

            seg.position.z = zPos;
            this.scene.add(seg);
            this.roadSegments.push(seg);
        }
    }

    buildCitySkyline() {
        // Silhueta de arranha-céus na lateral direita e ao fundo
        const bldgMat = new THREE.MeshStandardMaterial({
            color: 0x181724,
            roughness: 0.85,
            metalness: 0.2
        });
        const windowGlowMat = new THREE.MeshBasicMaterial({ color: 0xffa34d });

        for (let i = 0; i < 28; i++) {
            const h = 40 + Math.random() * 85;
            const w = 12 + Math.random() * 18;
            const d = 12 + Math.random() * 18;
            const bldg = new THREE.Group();

            const tower = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), bldgMat);
            tower.position.y = h / 2 - 1.2;
            bldg.add(tower);

            // Janelas iluminadas da cidade
            if (Math.random() > 0.3) {
                const winRow = new THREE.Mesh(
                    new THREE.BoxGeometry(w * 0.85, 0.6, d + 0.2),
                    windowGlowMat
                );
                winRow.position.y = h * 0.7;
                bldg.add(winRow);
            }

            // Posição ao lado direito da rodovia e ao longe
            const posX = 42 + (i % 6) * 22 + Math.random() * 15;
            const posZ = -i * 16 - 30;
            bldg.position.set(posX, 0, posZ);

            this.scene.add(bldg);
            this.skylineBuildings.push(bldg);
        }
    }

    update(delta, speed) {
        // Desloca os segmentos da pista em direção à câmera para simular movimento infinito
        const moveDist = speed * delta;
        const totalSpan = this.roadSegments.length * 40;

        this.roadSegments.forEach(seg => {
            seg.position.z += moveDist;
            if (seg.position.z > 40) {
                seg.position.z -= totalSpan;
            }
        });

        // Efeito sutil de parallax nos edifícios da metrópole
        this.skylineBuildings.forEach(bldg => {
            bldg.position.z += moveDist * 0.25;
            if (bldg.position.z > 60) {
                bldg.position.z -= 480;
            }
        });
    }

    // Métodos para controle em tempo real via Painel de Ajustes do IDX
    setSunIntensity(val) {
        if (this.sunLight) this.sunLight.intensity = val;
    }
    setSunColor(hex) {
        if (this.sunLight) this.sunLight.color.set(hex);
    }
    setSunPosition(x, y, z) {
        if (this.sunLight) this.sunLight.position.set(x, y, z);
        if (this.sunMesh) this.sunMesh.position.set(x * 1.5, y * 0.9, z * 2.2);
    }
    setAmbientIntensity(val) {
        if (this.ambientLight) this.ambientLight.intensity = val;
    }
    setAmbientColor(hex) {
        if (this.ambientLight) this.ambientLight.color.set(hex);
    }
    setFogDensity(val) {
        if (this.fog) this.fog.density = val;
    }
}
