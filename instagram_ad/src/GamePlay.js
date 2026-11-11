/**
 * GamePlay.js
 * Mecânicas completas estilo Subway Surfers: 3 Faixas, Movimento Infinito,
 * Obstáculos Dinâmicos, Rampas de Salto Acrobático e Escudo Protetor.
 */

export const LANES = [-3.8, 0.0, 3.8];

export class GamePlay {
    constructor(scene, carBuilder, environment, callbacks = {}) {
        this.scene = scene;
        this.carBuilder = carBuilder;
        this.environment = environment;
        this.callbacks = callbacks; // onScoreUpdate, onCoinCollect, onShieldActive, onGameOver, onActionPopup

        // Estado do Jogador
        this.currentLane = 1; // 0: Esquerda (-3.8), 1: Centro (0.0), 2: Direita (+3.8)
        this.playerX = 0.0;
        this.playerY = 0.0;
        this.targetLaneX = 0.0;
        this.velocityY = 0.0;
        this.isJumping = false;
        this.isStuntRolling = false;
        this.stuntRollAngle = 0.0;

        // Físicas
        this.gravity = -34.0;
        this.baseSpeed = 48.0;
        this.currentSpeed = this.baseSpeed;
        this.maxSpeed = 82.0;

        // Pontuação e Moedas
        this.score = 0;
        this.coins = 0;
        this.distance = 0;
        this.isRunning = true;
        this.isGameOver = false;

        // Power-Up: Escudo Protetor (Invulnerabilidade + Atropela Tráfego)
        this.shieldDuration = 0.0;
        this.maxShieldDuration = 8.0;

        // Coleções de Objetos Ativos no Mundo
        this.obstacles = [];
        this.ramps = [];
        this.collectibles = [];

        // Timers de Geração (Spawn)
        this.obstacleTimer = 0.0;
        this.rampTimer = 2.5;
        this.collectibleTimer = 0.8;

        this.initControls();
    }

    initControls() {
        // 1. Controles de Teclado (PC / Dev / Web Preview)
        window.addEventListener('keydown', (e) => {
            if (!this.isRunning || this.isGameOver) return;
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.moveLane(-1);
            else if (e.code === 'ArrowRight' || e.code === 'KeyD') this.moveLane(1);
            else if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') this.jump();
            else if (e.code === 'ArrowDown' || e.code === 'KeyS') this.slamDown();
        });

        // 2. Controles de Toque e Swipe para Celular / Instagram Stories
        let touchStartX = 0;
        let touchStartY = 0;
        let touchStartTime = 0;

        window.addEventListener('touchstart', (e) => {
            if (!this.isRunning || this.isGameOver) return;
            touchStartX = e.changedTouches[0].clientX;
            touchStartY = e.changedTouches[0].clientY;
            touchStartTime = performance.now();
        }, { passive: true });

        window.addEventListener('touchend', (e) => {
            if (!this.isRunning || this.isGameOver) return;
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            const elapsed = performance.now() - touchStartTime;

            // Swipe horizontal ou vertical detectado
            if (Math.abs(deltaX) > 30 && Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX > 0) this.moveLane(1);  // Swipe direita
                else this.moveLane(-1);            // Swipe esquerda
            } else if (Math.abs(deltaY) > 35 && elapsed < 350) {
                if (deltaY < 0) this.jump();       // Swipe para cima = Pulo
                else this.slamDown();              // Swipe para baixo = Descida rápida
            } else {
                // Toque direto nos lados da tela
                const screenMid = window.innerWidth / 2;
                if (touchEndX < screenMid - 20) this.moveLane(-1);
                else if (touchEndX > screenMid + 20) this.moveLane(1);
            }
        }, { passive: true });
    }

    moveLane(direction) {
        const nextLane = this.currentLane + direction;
        if (nextLane >= 0 && nextLane <= 2) {
            this.currentLane = nextLane;
            this.targetLaneX = LANES[this.currentLane];
        }
    }

    jump(force = 15.5) {
        if (!this.isJumping) {
            this.isJumping = true;
            this.velocityY = force;
        }
    }

    slamDown() {
        if (this.isJumping && this.playerY > 0.5) {
            this.velocityY = -26.0;
        }
    }

    triggerRampJump() {
        this.isJumping = true;
        this.velocityY = 17.5; // Impulso alto para sobrevoar tráfego
        this.isStuntRolling = true;
        this.stuntRollAngle = 0.0;
        this.score += 350;
        if (this.callbacks.onActionPopup) {
            this.callbacks.onActionPopup('🛹 SALTO ACROBÁTICO! +350');
        }
    }

    activateShield() {
        this.shieldDuration = this.maxShieldDuration;
        this.score += 200;
        if (this.callbacks.onActionPopup) {
            this.callbacks.onActionPopup('🛡️ ESCUDO ATIVADO! INVENCÍVEL');
        }
    }

    // =========================================================================
    // GERADORES DE OBSTÁCULOS, RAMPAS E ITENS
    // =========================================================================

    spawnObstacle() {
        const freeLane = Math.floor(Math.random() * 3);
        const lanesToSpawn = [0, 1, 2].filter(l => l !== freeLane);
        const spawnZ = -140 - Math.random() * 30;

        // Impede spawn em cima de rampas
        const rampNear = this.ramps.some(r => Math.abs(r.position.z - spawnZ) < 25.0);
        if (rampNear) return;

        lanesToSpawn.forEach(laneIdx => {
            if (Math.random() < 0.65) {
                const laneX = LANES[laneIdx];
                const obsGroup = new THREE.Group();

                // Tipo 1: Carro Sedã do tráfego futurista
                const isTruck = Math.random() < 0.3;
                const carColor = [0xd63031, 0x0984e3, 0x6c5ce7, 0x00b894][Math.floor(Math.random() * 4)];
                
                const bodyMat = new THREE.MeshStandardMaterial({
                    color: carColor,
                    metalness: 0.5,
                    roughness: 0.35
                });
                const darkMat = new THREE.MeshStandardMaterial({ color: 0x111216, roughness: 0.6 });
                const redGlowMat = new THREE.MeshBasicMaterial({ color: 0xff1e40 });

                if (isTruck) {
                    // Van/Caminhão cyber
                    const body = new THREE.Mesh(new THREE.BoxGeometry(2.3, 2.4, 4.8), bodyMat);
                    body.position.y = 1.2;
                    body.castShadow = true;
                    obsGroup.add(body);
                    const lights = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.2, 0.1), redGlowMat);
                    lights.position.set(0, 1.0, 2.41);
                    obsGroup.add(lights);
                    obsGroup.boxHeight = 2.4;
                } else {
                    // Carro esportivo do tráfego
                    const body = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.95, 4.2), bodyMat);
                    body.position.y = 0.5;
                    body.castShadow = true;
                    obsGroup.add(body);
                    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.6, 2.0), darkMat);
                    cabin.position.set(0, 1.1, -0.2);
                    obsGroup.add(cabin);
                    const lights = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.12, 0.1), redGlowMat);
                    lights.position.set(0, 0.55, 2.11);
                    obsGroup.add(lights);
                    obsGroup.boxHeight = 1.25;
                }

                obsGroup.position.set(laneX, 0, spawnZ);
                obsGroup.trafficSpeed = 12.0 + Math.random() * 8.0; // Se move na mesma direção
                obsGroup.isSmashed = false;

                this.scene.add(obsGroup);
                this.obstacles.push(obsGroup);
            }
        });
    }

    spawnRamp() {
        const laneIdx = Math.floor(Math.random() * 3);
        const laneX = LANES[laneIdx];
        const spawnZ = -160;

        const rampGroup = new THREE.Group();

        // Rampa angular estilo cunha (Subway Surfers jump ramp)
        const rampShape = new THREE.Shape();
        rampShape.moveTo(0, 0);
        rampShape.lineTo(0, 0.1);
        rampShape.lineTo(7.0, 1.8);
        rampShape.lineTo(7.0, 0);
        rampShape.closePath();

        const rampGeo = new THREE.ExtrudeGeometry(rampShape, {
            depth: 2.6,
            bevelEnabled: true,
            bevelThickness: 0.1,
            bevelSize: 0.1,
            bevelSegments: 2
        });
        rampGeo.translate(-3.5, 0, -1.3);
        rampGeo.rotateY(-Math.PI / 2);

        const rampMat = new THREE.MeshStandardMaterial({
            color: 0x24283b,
            metalness: 0.4,
            roughness: 0.3
        });
        const rampMesh = new THREE.Mesh(rampGeo, rampMat);
        rampMesh.receiveShadow = true;
        rampGroup.add(rampMesh);

        // Faixas de neon amarelo brilhante nas laterais da rampa
        const yellowNeon = new THREE.MeshBasicMaterial({ color: 0xffea00 });
        [-1.35, 1.35].forEach(rx => {
            const strip = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 7.2), yellowNeon);
            strip.position.set(rx, 0.95, 0);
            strip.rotation.x = Math.atan2(1.8, 7.0);
            rampGroup.add(strip);
        });

        // Ícone indicador flutuante de rampa
        const iconGeo = new THREE.ConeGeometry(0.4, 0.8, 4);
        const iconMat = new THREE.MeshBasicMaterial({ color: 0x00f7ff });
        const icon = new THREE.Mesh(iconGeo, iconMat);
        icon.position.set(0, 2.6, 0);
        icon.rotation.x = Math.PI;
        rampGroup.add(icon);

        rampGroup.position.set(laneX, 0, spawnZ);
        this.scene.add(rampGroup);
        this.ramps.push(rampGroup);
    }

    spawnCollectible() {
        const laneIdx = Math.floor(Math.random() * 3);
        const laneX = LANES[laneIdx];
        const spawnZ = -140;

        // 80% chance de moedas, 20% chance de Escudo Protetor
        const isShield = Math.random() < 0.22 && this.shieldDuration <= 0;

        if (isShield) {
            // Emblema 3D de Escudo Protetor Holográfico
            const shieldGroup = new THREE.Group();
            const badgeGeo = new THREE.OctahedronGeometry(0.8, 1);
            const badgeMat = new THREE.MeshStandardMaterial({
                color: 0x00f7ff,
                emissive: 0x00d4ff,
                emissiveIntensity: 0.9,
                roughness: 0.1,
                metalness: 0.8,
                wireframe: true
            });
            const badge = new THREE.Mesh(badgeGeo, badgeMat);
            shieldGroup.add(badge);

            shieldGroup.position.set(laneX, 1.1, spawnZ);
            shieldGroup.itemType = 'shield';
            this.scene.add(shieldGroup);
            this.collectibles.push(shieldGroup);
        } else {
            // Trilha de 3 a 4 moedas douradas em sequência
            const coinGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.1, 16);
            coinGeo.rotateZ(Math.PI / 2);
            const coinMat = new THREE.MeshStandardMaterial({
                color: 0xffd700,
                emissive: 0xff9900,
                emissiveIntensity: 0.5,
                metalness: 0.85,
                roughness: 0.2
            });

            for (let c = 0; c < 3; c++) {
                const coin = new THREE.Mesh(coinGeo, coinMat);
                coin.position.set(laneX, 0.9, spawnZ - (c * 4.5));
                coin.itemType = 'coin';
                this.scene.add(coin);
                this.collectibles.push(coin);
            }
        }
    }

    // =========================================================================
    // LOOP PRINCIPAL DE FÍSICA E ATUALIZAÇÃO
    // =========================================================================

    update(delta) {
        if (!this.isRunning || this.isGameOver) return;

        // Progressão suave de velocidade
        this.currentSpeed = Math.min(this.maxSpeed, this.baseSpeed + (this.distance * 0.015));
        this.distance += this.currentSpeed * delta;
        this.score += Math.floor(this.currentSpeed * 1.5 * delta);

        if (this.callbacks.onScoreUpdate) {
            this.callbacks.onScoreUpdate(this.score, Math.floor(this.distance), this.coins);
        }

        // 1. Interpolação suave lateral do carro nas 3 faixas Subway Surfers
        const dx = this.targetLaneX - this.playerX;
        this.playerX += dx * Math.min(1.0, 14.0 * delta);

        // 2. Física Vertical (Gravidade e Pulo)
        if (this.isJumping) {
            this.velocityY += this.gravity * delta;
            this.playerY += this.velocityY * delta;

            // Rotação acrobática do Barrel Roll ao saltar da rampa
            if (this.isStuntRolling) {
                this.stuntRollAngle += delta * Math.PI * 2.8;
                if (this.stuntRollAngle >= Math.PI * 2) {
                    this.stuntRollAngle = Math.PI * 2;
                    this.isStuntRolling = false;
                }
            }

            if (this.playerY <= 0.0) {
                this.playerY = 0.0;
                this.isJumping = false;
                this.velocityY = 0.0;
                this.isStuntRolling = false;
                this.stuntRollAngle = 0.0;
            }
        }

        // Aplica posição e inclinação dinâmica (banking) no modelo do carro
        const G = this.carBuilder.carGroup;
        G.position.x = this.playerX;
        G.position.y = this.playerY;

        // Inclinação lateral viva nas curvas + giro do salto
        const bankingTilt = -dx * 0.08;
        const totalRoll = this.isStuntRolling ? this.stuntRollAngle : bankingTilt;
        G.rotation.z = totalRoll;
        G.rotation.x = this.isJumping ? Math.sin(this.velocityY * 0.05) * 0.2 : 0;

        // 3. Gerenciamento do Escudo
        const isShieldActive = this.shieldDuration > 0;
        if (isShieldActive) {
            this.shieldDuration -= delta;
            if (this.callbacks.onShieldActive) {
                this.callbacks.onShieldActive(this.shieldDuration / this.maxShieldDuration);
            }
            if (this.shieldDuration <= 0) {
                this.shieldDuration = 0;
            }
        }

        // Atualiza animações internas do carro (rodas, escapes, pulso do escudo)
        this.carBuilder.update(delta, this.currentSpeed, isShieldActive);

        // 4. Timers de Spawn
        this.obstacleTimer -= delta;
        if (this.obstacleTimer <= 0) {
            this.spawnObstacle();
            this.obstacleTimer = Math.max(0.7, 1.8 - (this.distance * 0.0004));
        }

        this.rampTimer -= delta;
        if (this.rampTimer <= 0) {
            this.spawnRamp();
            this.rampTimer = 6.0 + Math.random() * 4.0;
        }

        this.collectibleTimer -= delta;
        if (this.collectibleTimer <= 0) {
            this.spawnCollectible();
            this.collectibleTimer = 1.2;
        }

        // 5. Atualizar Rampas e Colisão de Salto
        for (let i = this.ramps.length - 1; i >= 0; i--) {
            const ramp = this.ramps[i];
            ramp.position.z += this.currentSpeed * delta;

            // Detecta entrada na rampa
            const distLat = Math.abs(this.playerX - ramp.position.x);
            const distLong = Math.abs(G.position.z - ramp.position.z);

            if (distLat < 1.4 && distLong < 3.2 && !this.isJumping) {
                this.triggerRampJump();
            }

            if (ramp.position.z > 30) {
                this.scene.remove(ramp);
                this.ramps.splice(i, 1);
            }
        }

        // 6. Atualizar Obstáculos e Colisão (com Destruição por Escudo)
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obs = this.obstacles[i];

            if (obs.isSmashed) {
                // Obstáculo arremessado pelos ares pelo Escudo
                obs.position.addScaledVector(obs.smashVelocity, delta);
                obs.rotation.x += obs.smashRot.x * delta;
                obs.rotation.y += obs.smashRot.y * delta;
                if (obs.position.y > 40 || obs.position.z > 35) {
                    this.scene.remove(obs);
                    this.obstacles.splice(i, 1);
                }
                continue;
            }

            obs.position.z += (this.currentSpeed + obs.trafficSpeed) * delta;

            const distLat = Math.abs(this.playerX - obs.position.x);
            const distLong = Math.abs(G.position.z - obs.position.z);

            // Detecção de Colisão
            if (distLat < 1.75 && distLong < 3.8) {
                if (this.playerY > (obs.boxHeight || 1.2)) {
                    // Carro passou por cima com pulo de rampa com sucesso!
                } else if (isShieldActive) {
                    // ESCUDO PROTETOR: Esmaga o obstáculo e arremessa para longe!
                    obs.isSmashed = true;
                    obs.smashVelocity = new THREE.Vector3(
                        (obs.position.x - this.playerX >= 0 ? 1 : -1) * (18.0 + Math.random() * 8.0),
                        16.0 + Math.random() * 8.0,
                        -15.0 - Math.random() * 15.0
                    );
                    obs.smashRot = new THREE.Vector3(Math.random() * 10, Math.random() * 12, Math.random() * 8);
                    this.score += 300;
                    if (this.callbacks.onActionPopup) {
                        this.callbacks.onActionPopup('💥 SHIELD SMASH! +300');
                    }
                } else {
                    // Colisão sem escudo = Fim de corrida do Anúncio Interativo
                    this.triggerGameOver();
                    return;
                }
            }

            if (obs.position.z > 30) {
                this.scene.remove(obs);
                this.obstacles.splice(i, 1);
            }
        }

        // 7. Atualizar Coletáveis (Moedas e Escudo)
        for (let i = this.collectibles.length - 1; i >= 0; i--) {
            const item = this.collectibles[i];
            item.position.z += this.currentSpeed * delta;
            item.rotation.y += delta * 3.5;

            const distLat = Math.abs(this.playerX - item.position.x);
            const distLong = Math.abs(G.position.z - item.position.z);
            const distVert = Math.abs(this.playerY - item.position.y);

            if (distLat < 1.6 && distLong < 2.5 && distVert < 2.2) {
                if (item.itemType === 'shield') {
                    this.activateShield();
                } else {
                    this.coins++;
                    this.score += 100;
                    if (this.callbacks.onCoinCollect) this.callbacks.onCoinCollect(this.coins);
                }
                this.scene.remove(item);
                this.collectibles.splice(i, 1);
                continue;
            }

            if (item.position.z > 25) {
                this.scene.remove(item);
                this.collectibles.splice(i, 1);
            }
        }
    }

    triggerGameOver() {
        this.isGameOver = true;
        this.isRunning = false;
        if (this.callbacks.onGameOver) {
            this.callbacks.onGameOver(this.score, Math.floor(this.distance), this.coins);
        }
    }

    restart() {
        // Limpa a pista para nova partida
        this.obstacles.forEach(o => this.scene.remove(o));
        this.ramps.forEach(r => this.scene.remove(r));
        this.collectibles.forEach(c => this.scene.remove(c));
        this.obstacles = [];
        this.ramps = [];
        this.collectibles = [];

        this.currentLane = 1;
        this.playerX = 0;
        this.targetLaneX = 0;
        this.playerY = 0;
        this.velocityY = 0;
        this.isJumping = false;
        this.isStuntRolling = false;
        this.shieldDuration = 0;

        this.score = 0;
        this.coins = 0;
        this.distance = 0;
        this.currentSpeed = this.baseSpeed;
        this.isGameOver = false;
        this.isRunning = true;
    }
}
