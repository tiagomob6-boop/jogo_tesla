/**
 * CarBuilder.js
 * Construtor 3D estrito do Solaris Hypercar (Carro Dourado Cyberpunk com 4 Escapes)
 * Baseado fielmente na identidade visual do Roadster Dash 3D.
 */

export class CarBuilder {
    constructor(scene) {
        this.scene = scene;
        this.carGroup = new THREE.Group();
        this.wheels = [];
        this.exhaustFlames = [];
        this.shieldMesh = null;
        this.softTexture = this.createSoftTexture();
        this.shieldTexture = this.createShieldTexture();
        this.buildCar();
    }

    createSoftTexture() {
        const c = document.createElement('canvas');
        c.width = c.height = 64;
        const g = c.getContext('2d');
        const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        grad.addColorStop(0.35, 'rgba(255, 200, 100, 0.8)');
        grad.addColorStop(0.7, 'rgba(255, 100, 30, 0.3)');
        grad.addColorStop(1, 'rgba(255, 50, 0, 0)');
        g.fillStyle = grad;
        g.fillRect(0, 0, 64, 64);
        return new THREE.CanvasTexture(c);
    }

    createShieldTexture() {
        const c = document.createElement('canvas');
        c.width = c.height = 256;
        const ctx = c.getContext('2d');
        ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
        ctx.fillRect(0, 0, 256, 256);
        ctx.strokeStyle = '#00f7ff';
        ctx.lineWidth = 4;
        
        // Grade hexagonal cibernética
        const hexSize = 32;
        const w = hexSize * Math.sqrt(3);
        const h = hexSize * 1.5;
        for (let y = 0; y < 256 + h; y += h) {
            for (let x = 0; x < 256 + w; x += w) {
                const cx = x + ((Math.floor(y / h) % 2) * (w / 2));
                const cy = y;
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle = (Math.PI / 3) * i;
                    const hx = cx + hexSize * Math.cos(angle);
                    const hy = cy + hexSize * Math.sin(angle);
                    if (i === 0) ctx.moveTo(hx, hy);
                    else ctx.lineTo(hx, hy);
                }
                ctx.closePath();
                ctx.stroke();
            }
        }
        return new THREE.CanvasTexture(c);
    }

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
            bevelSegments: 3,
            curveSegments: 6
        });
        geo.translate(0, 0, -depth / 2);
        geo.rotateY(Math.PI / 2);
        geo.computeVertexNormals();

        const mesh = new THREE.Mesh(geo, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        return mesh;
    }

    makeBox(w, h, d, mat, x, y, z) {
        const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
        m.position.set(x, y, z);
        m.castShadow = true;
        m.receiveShadow = true;
        return m;
    }

    makeGlow(color, size, opacity = 0.9) {
        const mat = new THREE.SpriteMaterial({
            map: this.softTexture,
            color,
            transparent: true,
            opacity,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const s = new THREE.Sprite(mat);
        s.scale.set(size, size, 1);
        return s;
    }

    buildCar() {
        const G = this.carGroup;

        // Materiais fiéis ao Solaris Hypercar
        const goldPaint = new THREE.MeshStandardMaterial({
            color: 0xf0b030,
            roughness: 0.24,
            metalness: 0.65,
            flatShading: false
        });

        const carbonFiber = new THREE.MeshStandardMaterial({
            color: 0x16171b,
            roughness: 0.45,
            metalness: 0.4
        });

        const darkGlass = new THREE.MeshStandardMaterial({
            color: 0x0c0e14,
            roughness: 0.08,
            metalness: 0.85
        });

        const neonOrange = new THREE.MeshBasicMaterial({ color: 0xff6a00 });
        const tireMat = new THREE.MeshStandardMaterial({ color: 0x121318, roughness: 0.85, metalness: 0.1 });
        const rimGold = new THREE.MeshStandardMaterial({ color: 0xf0b030, roughness: 0.3, metalness: 0.8 });

        // 1. Carroceria Long-Tail com perfis aerodinâmicos
        G.add(this.makeProfile([
            [-2.55, 0.26], [2.3, 0.26], [2.45, 0.36], [2.25, 0.46],
            [0.9, 0.64], [-0.4, 0.8], [-2.2, 0.66], [-2.55, 0.52]
        ], 2.15, goldPaint, 0.06));

        // 2. Cockpit em gota aerodinâmica (Vidro fumê escuro reflexivo)
        G.add(this.makeProfile([
            [1.0, 0.6], [0.35, 0.98], [-0.5, 1.0], [-1.6, 0.7]
        ], 1.3, darkGlass, 0.05));

        // 3. Barbatana dorsal de fibra de carbono (Shark Fin central)
        G.add(this.makeProfile([
            [-0.6, 0.95], [-2.45, 0.62], [-2.45, 1.15]
        ], 0.08, carbonFiber, 0));

        // 4. Splitter dianteiro e difusor aerodinâmico traseiro
        G.add(this.makeBox(2.2, 0.06, 0.55, carbonFiber, 0, 0.26, -2.25));
        G.add(this.makeBox(1.95, 0.18, 0.35, carbonFiber, 0, 0.33, 2.45));

        // Entradas de ar laterais com acabamento de carbono
        [-1.12, 1.12].forEach(x => {
            G.add(this.makeBox(0.06, 0.22, 0.95, carbonFiber, x, 0.48, 0.6));
        });

        // 5. Lanterna traseira horizontal contínua de ponta a ponta
        G.add(this.makeBox(2.02, 0.05, 0.06, neonOrange, 0, 0.6, 2.53));

        // 6. Quatro bocas de escape de foguete (Rocket Thrusters com fogo dinâmico)
        this.exhaustFlames = [];
        [-0.45, -0.17, 0.17, 0.45].forEach(x => {
            // Cilindro do bocal em titânio/carbono
            const nozzle = new THREE.Mesh(
                new THREE.CylinderGeometry(0.1, 0.1, 0.22, 16).rotateX(Math.PI / 2),
                carbonFiber
            );
            nozzle.position.set(x, 0.4, 2.58);
            G.add(nozzle);

            // Chama de propulsão com brilho pulsante
            const flame = this.makeGlow(0xff9922, 0.65, 0.95);
            flame.position.set(x, 0.4, 2.74);
            G.add(flame);
            this.exhaustFlames.push(flame);
        });

        // 7. Rodas esportivas com aros dourados e rotação viva
        const wheelPositions = [
            [-1.05, 0.42, -1.4],
            [1.05, 0.42, -1.4],
            [-1.05, 0.42, 1.45],
            [1.05, 0.42, 1.45]
        ];

        wheelPositions.forEach(([x, y, z]) => {
            const wheelGroup = new THREE.Group();
            const tire = new THREE.Mesh(
                new THREE.CylinderGeometry(0.42, 0.42, 0.34, 22).rotateZ(Math.PI / 2),
                tireMat
            );
            tire.castShadow = true;
            wheelGroup.add(tire);

            const rim = new THREE.Mesh(
                new THREE.CylinderGeometry(0.28, 0.28, 0.35, 18).rotateZ(Math.PI / 2),
                rimGold
            );
            wheelGroup.add(rim);

            // Raios da roda para evidenciar a rotação em alta velocidade
            const spokeGeo = new THREE.BoxGeometry(0.36, 0.52, 0.06);
            for (let s = 0; s < 5; s++) {
                const spoke = new THREE.Mesh(spokeGeo, carbonFiber);
                spoke.rotation.x = (s / 5) * Math.PI;
                wheelGroup.add(spoke);
            }

            wheelGroup.position.set(x, y, z);
            G.add(wheelGroup);
            this.wheels.push(wheelGroup);
        });

        // 8. Campo de Força de Escudo Holográfico (Ativável ao coletar Escudo)
        const shieldGeo = new THREE.SphereGeometry(2.35, 32, 24);
        shieldGeo.scale(1.0, 0.72, 1.35); // Formato elipsoide aerodinâmico que envolve o carro
        const shieldMat = new THREE.MeshStandardMaterial({
            map: this.shieldTexture,
            color: 0x00f7ff,
            emissive: 0x00d4ff,
            emissiveIntensity: 0.85,
            transparent: true,
            opacity: 0.0, // Inicialmente invisível
            roughness: 0.1,
            metalness: 0.2,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.DoubleSide
        });
        this.shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
        this.shieldMesh.position.set(0, 0.65, 0.1);
        G.add(this.shieldMesh);

        this.scene.add(G);
    }

    update(delta, speed, isShieldActive = false) {
        // Rotação contínua das rodas conforme a velocidade do asfalto
        const wheelRotSpeed = (speed / 0.42) * delta;
        this.wheels.forEach(w => {
            w.rotation.x -= wheelRotSpeed;
        });

        // Tremulação e pulso das 4 chamas do foguete traseiro
        const time = performance.now() * 0.02;
        this.exhaustFlames.forEach((flame, idx) => {
            const flicker = Math.sin(time + idx * 1.5) * 0.12 + (Math.random() - 0.5) * 0.08;
            const baseScale = 0.65 + flicker;
            flame.scale.set(baseScale, baseScale, 1);
            flame.material.opacity = 0.85 + Math.random() * 0.15;
        });

        // Efeito do Escudo Protetor (Cyber Shield)
        if (this.shieldMesh) {
            if (isShieldActive) {
                this.shieldMesh.visible = true;
                const targetOpacity = 0.55 + Math.sin(time * 0.5) * 0.18;
                this.shieldMesh.material.opacity += (targetOpacity - this.shieldMesh.material.opacity) * 0.15;
                this.shieldMesh.rotation.y += delta * 1.2;
                this.shieldMesh.rotation.z = Math.sin(time * 0.3) * 0.08;
            } else {
                if (this.shieldMesh.material.opacity > 0.02) {
                    this.shieldMesh.material.opacity *= 0.85;
                } else {
                    this.shieldMesh.visible = false;
                }
            }
        }
    }
}
