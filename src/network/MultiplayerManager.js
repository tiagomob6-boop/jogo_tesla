import { LANES, GROUND_Y, FLIGHT_Y, GRAVITY, SLAM_FORCE, CAR_CATALOG, PILOT_CATALOG, COIN_PACKAGES, DAILY_MISSION_DEFS, API_URL } from '../core/Config.js';
import { SnapshotInterpolator } from './SnapshotInterpolator.js';

export const MultiplayerManager = (Base) => class extends Base {
    initMultiplayer() {
        this.mpInterpolator = new SnapshotInterpolator(100);
        this.mpLastRivalX = 0;
        // Abas do Modal Multiplayer
        const tabs = [
            { btn: document.getElementById("tab-btn-online"), content: document.getElementById("tab-online") },
            { btn: document.getElementById("tab-btn-local"), content: document.getElementById("tab-local") },
            { btn: document.getElementById("tab-btn-ai"), content: document.getElementById("tab-ai") }
        ];
        tabs.forEach(t => {
            if (!t.btn) return;
            t.btn.addEventListener("click", () => {
                this.sound.init();
                this.sound.playLaneChange();
                tabs.forEach(o => {
                    if (o.btn) o.btn.classList.remove("active");
                    if (o.content) o.content.classList.remove("active");
                });
                t.btn.classList.add("active");
                if (t.content) t.content.classList.add("active");
            });
        });

        // Abrir / Fechar Modal de Multiplayer
        if (this.openMultiplayerBtn) {
            this.openMultiplayerBtn.addEventListener("click", () => {
                this.sound.init();
                if (this.multiplayerModal) this.multiplayerModal.classList.add("active");
                this.connectMultiplayerWebSocket();
            });
        }
        if (this.closeMultiplayerBtn) {
            this.closeMultiplayerBtn.addEventListener("click", () => {
                if (this.multiplayerModal) this.multiplayerModal.classList.remove("active");
            });
        }

        // Partida Rápida (Matchmaking)
        if (this.mpQuickMatchBtn) {
            this.mpQuickMatchBtn.addEventListener("click", () => {
                this.sound.init();
                this.quickMatchMultiplayer();
            });
        }

        // Criar Sala Privada
        if (this.mpCreateRoomBtn) {
            this.mpCreateRoomBtn.addEventListener("click", () => {
                this.sound.init();
                this.createMultiplayerRoom();
            });
        }

        // Iniciar Corrida Manualmente (Host)
        if (this.mpStartRoomBtn) {
            this.mpStartRoomBtn.addEventListener("click", () => {
                this.sound.init();
                if (this.mpWs && this.mpWs.readyState === WebSocket.OPEN) {
                    this.mpWs.send(JSON.stringify({ type: 'start_race' }));
                }
            });
        }

        // Entrar com Código
        if (this.mpJoinRoomBtn) {
            this.mpJoinRoomBtn.addEventListener("click", () => {
                this.sound.init();
                const code = (this.mpJoinCodeInput ? this.mpJoinCodeInput.value : "").trim().toUpperCase();
                if (!code) return;
                this.joinMultiplayerRoom(code);
            });
        }

        // Iniciar Versus Local (2 Jogadores no Mesmo Teclado)
        if (this.mpStartLocalBtn) {
            this.mpStartLocalBtn.addEventListener("click", () => {
                this.sound.init();
                if (this.multiplayerModal) this.multiplayerModal.classList.remove("active");
                this.startMultiplayerRace('local2p', { name: 'Piloto 2 (Rosa)', car: 'rusty' });
            });
        }

        // Iniciar Duelo contra IA
        if (this.mpStartAiBtn) {
            this.mpStartAiBtn.addEventListener("click", () => {
                this.sound.init();
                if (this.multiplayerModal) this.multiplayerModal.classList.remove("active");
                this.startMultiplayerRace('ai', { name: 'Cyber Ghost IA', car: 'solaris' });
            });
        }

        // Modal de Fim de Duelo
        if (this.mpPlayAgainBtn) {
            this.mpPlayAgainBtn.addEventListener("click", () => {
                this.sound.init();
                if (this.mpFinishModal) this.mpFinishModal.classList.remove("active");
                if (this.mpMode === 'local2p') {
                    this.startMultiplayerRace('local2p', { name: 'Piloto 2 (Rosa)', car: 'rusty' });
                } else if (this.mpMode === 'ai') {
                    this.startMultiplayerRace('ai', { name: 'Cyber Ghost IA', car: 'solaris' });
                } else {
                    if (this.multiplayerModal) this.multiplayerModal.classList.add("active");
                }
            });
        }
        if (this.mpBackMenuBtn) {
            this.mpBackMenuBtn.addEventListener("click", () => {
                if (this.mpFinishModal) this.mpFinishModal.classList.remove("active");
                this.isMultiplayer = false;
                if (this.hudMpBanner) this.hudMpBanner.style.display = "none";
                if (this.mpRivalVehicle) {
                    this.scene.remove(this.mpRivalVehicle);
                    this.mpRivalVehicle = null;
                }
                this.startScreen.classList.add("active");
            });
        }
    }



    connectMultiplayerWebSocket(onOpenCallback) {
        if (this.mpWs && this.mpWs.readyState === WebSocket.OPEN) {
            if (onOpenCallback) onOpenCallback();
            return;
        }
        if (this.mpWs && this.mpWs.readyState === WebSocket.CONNECTING) return;

        const loc = window.location;
        const isLocal = loc.hostname === "localhost" || loc.hostname === "127.0.0.1";
        const wsProto = loc.protocol === "https:" ? "wss:" : "ws:";
        const wsHost = isLocal ? `${loc.hostname}:${loc.port || 3000}` : "jogo-tesla.onrender.com";
        const wsUrl = `${wsProto}//${wsHost}`;

        try {
            this.mpWs = new WebSocket(wsUrl);
        } catch(e) {
            if (this.mpOnlineStatus) this.mpOnlineStatus.textContent = "Servidor offline. Tente o modo 2P Local ou Duelo IA!";
            return;
        }

        this.mpWs.onopen = () => {
            if (this.mpOnlineStatus) {
                this.mpOnlineStatus.className = "status-msg success";
                this.mpOnlineStatus.textContent = "🟢 Conectado ao servidor multiplayer!";
            }
            if (onOpenCallback) onOpenCallback();
        };

        this.mpWs.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handleMultiplayerMessage(data);
            } catch(e) {}
        };

        this.mpWs.onerror = () => {
            if (this.mpOnlineStatus) {
                this.mpOnlineStatus.className = "status-msg error";
                this.mpOnlineStatus.textContent = "Servidor multiplayer iniciando ou inacessível. O modo 2P Local está disponível!";
            }
        };

        this.mpWs.onclose = () => {
            if (this.mpOnlineStatus) {
                this.mpOnlineStatus.className = "status-msg";
                this.mpOnlineStatus.textContent = "Desconectado do servidor multiplayer.";
            }
        };
    }



    handleMultiplayerMessage(data) {
        switch (data.type) {
            case "room_created":
                this.mpRoomCode = data.roomCode;
                this.mpPlayerId = data.playerId;
                this.mpIsHost = true;
                if (this.mpRoomInfoBox) this.mpRoomInfoBox.style.display = "block";
                if (this.mpRoomCodeLabel) this.mpRoomCodeLabel.textContent = data.roomCode;
                if (this.mpRoomStatusLabel) this.mpRoomStatusLabel.textContent = "Aguardando rival entrar com este código...";
                if (this.mpStartRoomBtn) this.mpStartRoomBtn.style.display = "none";
                break;

            case "room_joined":
                this.mpRoomCode = data.roomCode;
                this.mpPlayerId = data.playerId;
                this.mpIsHost = false;
                if (this.mpRoomInfoBox) this.mpRoomInfoBox.style.display = "block";
                if (this.mpRoomCodeLabel) this.mpRoomCodeLabel.textContent = data.roomCode;
                if (this.mpRoomStatusLabel) this.mpRoomStatusLabel.textContent = "Você entrou na sala! Aguardando anfitrião iniciar...";
                break;

            case "player_joined":
                if (this.mpIsHost) {
                    if (this.mpRoomStatusLabel) this.mpRoomStatusLabel.textContent = `⚡ Piloto ${data.username} entrou na sala!`;
                    if (this.mpStartRoomBtn) this.mpStartRoomBtn.style.display = "block";
                    this.sound.playMissionComplete();
                }
                break;

            case "waiting_match":
                if (this.mpOnlineStatus) {
                    this.mpOnlineStatus.className = "status-msg";
                    this.mpOnlineStatus.textContent = "🔍 Procurando adversário online na rodovia...";
                }
                break;

            case "match_found":
                if (this.mpOnlineStatus) {
                    this.mpOnlineStatus.className = "status-msg success";
                    this.mpOnlineStatus.textContent = "⚡ Rival encontrado! Preparando duelo...";
                }
                break;

            case "race_start":
                if (this.multiplayerModal) this.multiplayerModal.classList.remove("active");
                this.triggerActionPopup("3... 2... 1... LARGADA!");
                this.speakAnnouncer("Duel Start!", true);
                this.startMultiplayerRace('online', { name: 'Rival Online', car: 'solaris' });
                break;

            case "rival_update":
                this.mpRivalData = {
                    x: data.x,
                    y: data.y,
                    lane: data.lane,
                    dist: data.dist,
                    speed: data.speed,
                    isFlying: data.isFlying,
                    shield: data.shield,
                    name: data.username || 'Rival'
                };
                break;

            case "rival_crashed":
                this.rivalCrashed = true;
                this.rivalFinalDist = Math.max(1, Math.floor(data.dist || this.mpRivalData.dist || 0));
                if (this.mpNameP2) {
                    this.mpNameP2.textContent = `${this.mpRivalData.name || 'Rival'} 💥 (${this.rivalFinalDist}m)`;
                }
                if (this.p1Crashed) {
                    this.finishDuel();
                } else {
                    this.triggerActionPopup(`⚡ RIVAL BATEU AOS ${this.rivalFinalDist}m! CONTINUE ACELERANDO!`);
                    this.speakAnnouncer("Rival Down! Keep Going!", true);
                }
                break;

            case "player_left":
                if (this.isRunning && this.isMultiplayer && this.mpMode === 'online') {
                    this.finishDuel(true, "O Rival desconectou da corrida!");
                }
                break;

            case "error":
                if (this.mpOnlineStatus) {
                    this.mpOnlineStatus.className = "status-msg error";
                    this.mpOnlineStatus.textContent = data.message || "Erro no multiplayer";
                }
                break;
        }
    }



    createMultiplayerRoom() {
        this.connectMultiplayerWebSocket(() => {
            this.mpWs.send(JSON.stringify({
                type: 'create_room',
                username: this.currentUser,
                selectedCar: this.selectedCar
            }));
        });
    }



    joinMultiplayerRoom(code) {
        this.connectMultiplayerWebSocket(() => {
            this.mpWs.send(JSON.stringify({
                type: 'join_room',
                roomCode: code,
                username: this.currentUser,
                selectedCar: this.selectedCar
            }));
        });
    }



    quickMatchMultiplayer() {
        this.connectMultiplayerWebSocket(() => {
            this.mpWs.send(JSON.stringify({
                type: 'quick_match',
                username: this.currentUser,
                selectedCar: this.selectedCar
            }));
        });
    }



    createNameTagSprite(text, color = "#38bdf8") {
        const canvas = document.createElement("canvas");
        canvas.width = 256;
        canvas.height = 72;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, 256, 72);

        // Fundo escuro com borda neon
        ctx.fillStyle = "rgba(10, 18, 38, 0.9)";
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(8, 8, 240, 56, 28);
        ctx.fill();
        ctx.stroke();

        // Texto iluminado
        ctx.font = "bold 26px 'Segoe UI', Montserrat, sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
        ctx.fillText(text.substring(0, 14), 128, 36);

        const tex = new THREE.CanvasTexture(canvas);
        const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
        const sprite = new THREE.Sprite(mat);
        sprite.scale.set(3.4, 0.95, 1);
        sprite.position.set(0, 2.2, 0);
        return sprite;
    }



    startMultiplayerRace(mode, rivalInfo) {
        if (this.mpInterpolator) this.mpInterpolator.reset();
        this.mpLastRivalX = 0;
        this.isMultiplayer = true;
        this.mpMode = mode;

        // Prepara P1 na faixa esquerda (faixa 0)
        this.currentLane = 0;
        this.playerX = LANES[0];

        // Prepara P2 ou Rival na faixa direita (faixa 2)
        const rivalName = rivalInfo.name || (mode === 'local2p' ? 'Piloto 2' : (mode === 'ai' ? 'Cyber Ghost IA' : 'Rival'));
        const rivalCar = rivalInfo.car || 'phantom';
        this.buildRivalVehicle(rivalCar, rivalName, mode === 'local2p');

        // Reset de estado dos competidores (sobrevivência até o fim)
        this.p1Crashed = false;
        this.p1FinalDist = 0;
        this.rivalCrashed = false;
        this.rivalFinalDist = 0;
        this.p2.crashed = false;
        this.p2.finalDist = 0;
        this.aiPostCrashTimer = 0;

        // Configuração P2 (Local Versus)
        this.p2.lane = 2;
        this.p2.x = LANES[2];
        this.p2.targetX = LANES[2];
        this.p2.y = GROUND_Y;
        this.p2.velocityY = 0;
        this.p2.isFlying = false;
        this.p2.dist = 0;
        this.p2.speed = 78;
        this.p2.lives = 3;
        this.p2.crashed = false;
        this.p2.shieldTimer = 0;

        // Configuração Rival Online / IA
        this.mpRivalData.x = LANES[2];
        this.mpRivalData.y = GROUND_Y;
        this.mpRivalData.dist = 0;
        this.mpRivalData.speed = 78;
        this.mpRivalData.crashed = false;
        this.mpRivalData.name = rivalName;

        // Configuração HUD Banner
        if (this.hudMpBanner) this.hudMpBanner.style.display = "block";
        if (this.mpNameP1) this.mpNameP1.textContent = mode === 'local2p' ? "P1 (Você)" : (this.currentUser || "Você");
        if (this.mpNameP2) this.mpNameP2.textContent = mode === 'local2p' ? "P2 (Amigo)" : rivalName;
        if (this.mpDistP1) this.mpDistP1.textContent = "0m";
        if (this.mpDistP2) this.mpDistP2.textContent = "0m";
        if (this.mpGapLabel) {
            this.mpGapLabel.className = "mp-gap-indicator";
            this.mpGapLabel.textContent = "+0m";
        }

        this.startGame();
    }



    changeP2Lane(dir) {
        if (!this.isMultiplayer || this.mpMode !== 'local2p' || this.p2.crashed) return;
        const nextLane = this.p2.lane + dir;
        if (nextLane >= 0 && nextLane <= 2) {
            this.p2.lane = nextLane;
            this.p2.targetX = LANES[nextLane];
            this.sound.playLaneChange();
        }
    }



    toggleP2Flight() {
        if (!this.isMultiplayer || this.mpMode !== 'local2p' || this.p2.crashed) return;
        this.p2.isFlying = !this.p2.isFlying;
        if (this.p2.isFlying) {
            this.sound.playBoost();
        }
    }



    slamP2Down() {
        if (!this.isMultiplayer || this.mpMode !== 'local2p' || this.p2.crashed) return;
        if (this.p2.y > GROUND_Y) {
            this.p2.isFlying = false;
            this.p2.velocityY = SLAM_FORCE;
        }
    }



    updateMultiplayer(delta) {
        if (!this.isMultiplayer || !this.mpRivalVehicle) return;

        let rivalDist = 0;

        // 1. MODO 2 JOGADORES NO MESMO TECLADO (LOCAL VERSUS)
        if (this.mpMode === 'local2p') {
            if (!this.p2.crashed) {
                // Movimentação lateral suave
                this.p2.x += (this.p2.targetX - this.p2.x) * 14.0 * delta;
                this.p2.speed = this.currentSpeed;
                this.p2.dist += this.p2.speed * delta;

                // Física vertical (voo e gravidade)
                if (this.p2.isFlying) {
                    this.p2.y += (FLIGHT_Y - this.p2.y) * 6.0 * delta;
                } else if (this.p2.y > GROUND_Y) {
                    this.p2.velocityY += GRAVITY * delta;
                    this.p2.y += this.p2.velocityY * delta;
                    if (this.p2.y <= GROUND_Y) {
                        this.p2.y = GROUND_Y;
                        this.p2.velocityY = 0;
                    }
                }

                // Atualiza posição do veículo no Three.js
                const relativeZ = this.truckGroup.position.z + (this.p2.dist - this.scoreDistance);
                this.mpRivalVehicle.position.set(this.p2.x, this.p2.y, relativeZ);

                // Colisão do P2 com tráfego
                for (let i = 0; i < this.trafficCars.length; i++) {
                    const car = this.trafficCars[i];
                    if (car.isSmashed) continue;
                    const dX = Math.abs(this.p2.x - car.position.x);
                    const dZ = Math.abs(relativeZ - car.position.z);
                    if (dX < 1.6 && dZ < 3.2 && this.p2.y < car.boxHeight) {
                        this.p2.lives--;
                        this.sound.playCrash();
                        if (this.p2.lives <= 0) {
                            this.p2.crashed = true;
                            this.p2.finalDist = Math.max(1, Math.floor(this.p2.dist));
                            if (this.mpNameP2) {
                                this.mpNameP2.textContent = `P2 💥 (${this.p2.finalDist}m)`;
                            }
                            if (this.p1Crashed) {
                                this.finishDuel();
                                return;
                            } else {
                                this.triggerActionPopup(`⚡ PILOTO 2 BATEU AOS ${this.p2.finalDist}m! PILOTO 1 CONTINUA!`);
                                this.speakAnnouncer("Player 2 Down! Keep Going!", true);
                            }
                        }
                    }
                }
            }
            rivalDist = this.p2.crashed ? this.p2.finalDist : this.p2.dist;
        }

        // 2. MODO DUELO CONTRA CYBER IA
        else if (this.mpMode === 'ai') {
            if (!this.rivalCrashed) {
                // IA segue a corrida com velocidade dinâmica
                const distDiff = this.mpRivalData.dist - this.scoreDistance;
                let targetAiSpeed = this.currentSpeed;
                if (distDiff < -15) targetAiSpeed += 6;
                else if (distDiff > 25) targetAiSpeed -= 5;

                this.mpRivalData.speed += (targetAiSpeed - this.mpRivalData.speed) * 3.0 * delta;
                this.mpRivalData.dist += this.mpRivalData.speed * delta;

                // IA de desvio de tráfego
                const relativeZ = this.truckGroup.position.z + (this.mpRivalData.dist - this.scoreDistance);
                for (const car of this.trafficCars) {
                    const dZ = car.position.z - relativeZ;
                    if (dZ < 0 && dZ > -35.0 && Math.abs(this.mpRivalData.x - car.position.x) < 1.6) {
                        const altLanes = LANES.filter(lx => Math.abs(lx - car.position.x) > 1.8);
                        if (altLanes.length > 0) {
                            this.mpRivalData.x = altLanes[Math.floor(Math.random() * altLanes.length)];
                        }
                    }
                    // Colisão da IA
                    if (Math.abs(car.position.x - this.mpRivalData.x) < 1.4 && Math.abs(dZ) < 3.0) {
                        this.rivalCrashed = true;
                        this.rivalFinalDist = Math.max(1, Math.floor(this.mpRivalData.dist));
                        this.sound.playCrash();
                        if (this.mpNameP2) {
                            this.mpNameP2.textContent = `Cyber IA 💥 (${this.rivalFinalDist}m)`;
                        }
                        if (this.p1Crashed) {
                            this.finishDuel();
                            return;
                        } else {
                            this.triggerActionPopup(`⚡ CYBER IA BATEU AOS ${this.rivalFinalDist}m! CONTINUE!`);
                            this.speakAnnouncer("Rival Down! Keep Going!", true);
                        }
                        break;
                    }
                }

                this.mpRivalVehicle.position.set(this.mpRivalData.x, GROUND_Y, relativeZ);
            }

            // Se P1 bateu e IA ainda está viva, limite o tempo da IA para finalizar o duelo
            if (this.p1Crashed && !this.rivalCrashed) {
                this.aiPostCrashTimer = (this.aiPostCrashTimer || 0) + delta;
                if (this.aiPostCrashTimer > 4.5) {
                    this.rivalCrashed = true;
                    this.rivalFinalDist = Math.max(1, Math.floor(this.mpRivalData.dist));
                    this.finishDuel();
                    return;
                }
            }

            rivalDist = this.rivalCrashed ? this.rivalFinalDist : this.mpRivalData.dist;
        }

        // 3. MODO ONLINE (WEBSOCKET REAL-TIME)
        else if (this.mpMode === 'online') {
            // Interpolação suave das coordenadas recebidas
            this.mpRivalVehicle.position.x += (this.mpRivalData.x - this.mpRivalVehicle.position.x) * 12.0 * delta;
            this.mpRivalVehicle.position.y += (this.mpRivalData.y - this.mpRivalVehicle.position.y) * 12.0 * delta;
            const relativeZ = this.truckGroup.position.z + (this.mpRivalData.dist - this.scoreDistance);
            this.mpRivalVehicle.position.z = relativeZ;

            // Envio de telemetria local via WebSocket (~25Hz)
            if (this.mpWs && this.mpWs.readyState === WebSocket.OPEN && !this.p1Crashed) {
                this.mpTelemetryTimer += delta;
                if (this.mpTelemetryTimer >= 0.04) {
                    this.mpTelemetryTimer = 0;
                    this.mpWs.send(JSON.stringify({
                        type: 'player_state',
                        username: this.currentUser,
                        selectedCar: this.selectedCar,
                        x: this.playerX,
                        y: this.playerY,
                        lane: this.currentLane,
                        dist: Math.floor(this.scoreDistance),
                        speed: Math.floor(this.currentSpeed),
                        isFlying: this.isFlying,
                        shield: this.shieldTimer > 0,
                        score: Math.floor(this.scorePoints)
                    }));
                }
            }
            rivalDist = this.rivalCrashed ? this.rivalFinalDist : this.mpRivalData.dist;
        }

        // Atualização dos números no Banner HUD
        const displayP1Dist = this.p1Crashed ? this.p1FinalDist : Math.floor(this.scoreDistance);
        if (this.mpDistP1) this.mpDistP1.textContent = `${displayP1Dist}m`;
        if (this.mpDistP2) this.mpDistP2.textContent = `${Math.floor(rivalDist)}m`;

        if (this.mpGapLabel) {
            const gap = Math.floor(displayP1Dist - rivalDist);
            if (gap >= 0) {
                this.mpGapLabel.className = "mp-gap-indicator";
                this.mpGapLabel.textContent = `+${gap}m À FRENTE`;
            } else {
                this.mpGapLabel.className = "mp-gap-indicator behind";
                this.mpGapLabel.textContent = `${gap}m ATRÁS`;
            }
        }
    }



    finishDuel(forceWon, customMessage) {
        this.isRunning = false;
        this.sound.stopEngine();

        const p1Dist = this.p1FinalDist || Math.floor(this.scoreDistance);
        const p2Dist = (this.mpMode === 'local2p') 
            ? (this.p2.finalDist || Math.floor(this.p2.dist)) 
            : (this.rivalFinalDist || Math.floor(this.mpRivalData.dist));

        let won = false;
        let isDraw = false;
        let title = "";
        let message = "";

        if (forceWon !== undefined && customMessage) {
            won = forceWon;
            message = customMessage;
            title = won ? "🏆 VITÓRIA!" : "💀 DERROTA!";
        } else {
            if (p1Dist > p2Dist) {
                won = true;
                const diff = p1Dist - p2Dist;
                title = (this.mpMode === 'local2p') ? "🏆 VITÓRIA DO PILOTO 1!" : "🏆 VITÓRIA ÉPICA!";
                message = `Piloto 1 percorreu ${p1Dist}m (+${diff}m a mais que o adversário)!`;
            } else if (p2Dist > p1Dist) {
                won = false;
                const diff = p2Dist - p1Dist;
                title = (this.mpMode === 'local2p') ? "🏆 VITÓRIA DO PILOTO 2!" : "💀 DERROTA!";
                message = (this.mpMode === 'local2p') 
                    ? `Piloto 2 resistiu mais e alcançou ${p2Dist}m (+${diff}m)!` 
                    : `O Rival resistiu mais e alcançou ${p2Dist}m (+${diff}m)!`;
            } else {
                isDraw = true;
                won = false;
                title = "🤝 EMPATE!";
                message = `Ambos os pilotos bateram na mesma distância: ${p1Dist}m!`;
            }
        }

        if (won) {
            this.sound.playMissionComplete();
            this.speakAnnouncer("Victory!", true);
            this.totalCoins += 100;
            localStorage.setItem("roadster_coins", this.totalCoins.toString());
            this.triggerHaptic("win");
        } else if (isDraw) {
            this.sound.playMissionComplete();
            this.totalCoins += 50;
            localStorage.setItem("roadster_coins", this.totalCoins.toString());
        } else {
            this.sound.playGameOver();
            this.speakAnnouncer("Game Over!", true);
            this.triggerHaptic("crash");
        }

        if (this.mpFinishModal) {
            this.mpFinishModal.classList.add("active");
            if (this.mpFinishTitle) this.mpFinishTitle.textContent = title;
            if (this.mpFinishSubtitle) this.mpFinishSubtitle.textContent = message;
            if (this.mpFinishDistP1) this.mpFinishDistP1.textContent = `${p1Dist} m`;
            if (this.mpFinishDistP2) this.mpFinishDistP2.textContent = `${p2Dist} m`;
            if (this.mpRewardBox) {
                this.mpRewardBox.style.display = (won || isDraw) ? "block" : "none";
                const rewardCoinEl = this.mpRewardBox.querySelector("strong");
                if (rewardCoinEl) rewardCoinEl.textContent = won ? "+100 MOEDAS" : "+50 MOEDAS";
            }
        }
    }

    // =================================================================
    // EVENTOS DE INTERFACE E MODAIS
    // =================================================================


};
