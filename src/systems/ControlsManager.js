import { LANES, GROUND_Y, FLIGHT_Y, GRAVITY, SLAM_FORCE, CAR_CATALOG, PILOT_CATALOG, COIN_PACKAGES, DAILY_MISSION_DEFS, API_URL } from '../core/Config.js';

export const ControlsManager = (Base) => class extends Base {
    initControls() {
        // Teclado
        window.addEventListener("keydown", (e) => {
            if (!this.isRunning || this.isPaused) return;

            // Modo 2 Jogadores no Mesmo Teclado (Local Versus)
            if (this.isMultiplayer && this.mpMode === "local2p") {
                // Controles do Jogador 1 (WASD)
                if (e.key === "a" || e.key === "A") {
                    this.changeLane(-1);
                    return;
                }
                if (e.key === "d" || e.key === "D") {
                    this.changeLane(1);
                    return;
                }
                if (e.key === "w" || e.key === "W" || e.key === " ") {
                    this.toggleFlight();
                    return;
                }
                if (e.key === "s" || e.key === "S") {
                    this.slamDown();
                    return;
                }

                // Controles do Jogador 2 (Setas)
                if (e.key === "ArrowLeft") {
                    this.changeP2Lane(-1);
                    return;
                }
                if (e.key === "ArrowRight") {
                    this.changeP2Lane(1);
                    return;
                }
                if (e.key === "ArrowUp") {
                    this.toggleP2Flight();
                    return;
                }
                if (e.key === "ArrowDown") {
                    this.slamP2Down();
                    return;
                }
            }

            // Modo Solo / Online / Duelo IA (Teclas Universais)
            switch (e.key) {
                case "ArrowLeft":
                case "a":
                case "A":
                    this.changeLane(-1);
                    break;
                case "ArrowRight":
                case "d":
                case "D":
                    this.changeLane(1);
                    break;
                case " ":
                case "Shift":
                case "ArrowUp":
                case "w":
                case "W":
                    this.toggleFlight();
                    break;
                case "ArrowDown":
                case "s":
                case "S":
                    this.slamDown();
                    break;
            }
        });

        // Botões Touchscreen na tela para celular
        const bindTouchBtn = (element, action) => {
            if (!element) return;
            element.addEventListener("touchstart", (e) => {
                e.preventDefault();
                action();
            }, { passive: false });
            element.addEventListener("click", (e) => {
                e.preventDefault();
                action();
            });
        };

        bindTouchBtn(this.btnLeft, () => this.changeLane(-1));
        bindTouchBtn(this.btnRight, () => this.changeLane(1));
        bindTouchBtn(this.btnSlam, () => this.slamDown());
        bindTouchBtn(this.boostTouchBtn, () => this.toggleFlight());

        // Suporte a Swipe na tela
        let touchStartX = 0;
        let touchStartY = 0;
        let touchStartTime = 0;

        window.addEventListener("touchstart", (e) => {
            if (e.target.closest("button")) return; // Não interfere nos botões
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
            touchStartTime = Date.now();
        }, { passive: true });

        window.addEventListener("touchend", (e) => {
            if (!this.isRunning || this.isPaused || e.target.closest("button")) return;
            const touch = e.changedTouches[0];
            const deltaX = touch.clientX - touchStartX;
            const deltaY = touch.clientY - touchStartY;
            const deltaTime = Date.now() - touchStartTime;

            if (deltaTime < 400) {
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    if (deltaX > 25) this.changeLane(1);
                    else if (deltaX < -25) this.changeLane(-1);
                } else {
                    if (deltaY < -25) this.toggleFlight();
                    else if (deltaY > 25) this.slamDown();
                }
            }
        }, { passive: true });
    }



    changeLane(dir) {
        const targetLane = this.currentLane + dir;
        if (targetLane >= 0 && targetLane <= 2) {
            this.currentLane = targetLane;
            this.sound.playLaneChange();

            if (this.isFlying) {
                this.sound.playAirPuff();
                const truckPos = this.truckGroup.position;
                if (dir > 0) {
                    const puffOrigin = truckPos.clone().add(new THREE.Vector3(-1.0, 0.4, 0));
                    this.createLateralAirPuff(puffOrigin, new THREE.Vector3(-1, 0, 0));
                } else {
                    const puffOrigin = truckPos.clone().add(new THREE.Vector3(1.0, 0.4, 0));
                    this.createLateralAirPuff(puffOrigin, new THREE.Vector3(1, 0, 0));
                }
            }
        }
    }



    toggleFlight() {
        if (!this.isFlying) {
            if (this.airLiters > 20) {
                this.isFlying = true;
                this.sound.playAirPuff();
                this.triggerActionPopup("ROCKET BOOST!");
            } else {
                this.sound.playSlam();
                this.triggerActionPopup("AR ESGOTADO!");
            }
        } else {
            this.isFlying = false;
            this.triggerActionPopup("POUSANDO...");
        }
    }



    slamDown() {
        if (this.isFlying) {
            this.isFlying = false;
            this.triggerActionPopup("FAST SLAM");
        }
        if (this.isRampJumping) {
            this.isRampJumping = false;
            this.truckGroup.rotation.z = 0;
            this.truckGroup.rotation.x = 0;
        }
        if (this.playerY > GROUND_Y) {
            this.velocityY = SLAM_FORCE;
            this.sound.playSlam();
        }
    }



    triggerActionPopup(text) {
        this.actionPopup.textContent = text;
        this.actionPopup.classList.add("show");
        clearTimeout(this.popupTimeout);
        this.popupTimeout = setTimeout(() => {
            this.actionPopup.classList.remove("show");
        }, 1200);
    }

    // =================================================================
    // FEED DE COMBOS (estilo Roadster Dash): "+10 STREAK", "BARREL ROLL +180"...
    // =================================================================


    addScoreEvent(label, points, big = false) {
        this.streak = (this.streak || 0) + 1;
        this.streakTimer = 3.5;
        // Bônus de sequência: +10 por nível de streak (máx. +200)
        const streakBonus = this.streak >= 2 ? Math.min(this.streak, 20) * 10 : 0;
        const total = points + streakBonus;
        this.scorePoints += total;

        if (this.comboFeed) {
            const item = document.createElement("div");
            item.className = "combo-item" + (big ? " big" : "");
            const lbl = document.createElement("span");
            lbl.textContent = label;
            const pts = document.createElement("span");
            pts.className = "pts";
            pts.textContent = `+${total}`;
            item.appendChild(lbl);
            item.appendChild(pts);
            this.comboFeed.appendChild(item);

            const items = this.comboFeed.querySelectorAll(".combo-item");
            if (items.length > 4) items[0].remove();
            setTimeout(() => item.remove(), 2000);
        }
        this.updateStreakUI(true);
    }



    updateStreakUI(bump) {
        if (!this.streakLine) return;
        if (this.streak >= 2) {
            this.streakLine.textContent = `STREAK x${this.streak}`;
            this.streakLine.classList.add("active");
            if (bump) {
                this.streakLine.classList.remove("bump");
                void this.streakLine.offsetWidth; // reinicia a animação
                this.streakLine.classList.add("bump");
            }
        } else {
            this.streakLine.classList.remove("active");
        }
    }



    resetStreak() {
        this.streak = 0;
        this.streakTimer = 0;
        this.updateStreakUI(false);
    }

    // =================================================================
    // SISTEMA MULTIPLAYER & DUELOS (ONLINE, 2P LOCAL E CYBER IA)
    // =================================================================


    triggerHaptic(type) {
        if (!this.settings || this.settings.haptics === false) return;
        if (!("vibrate" in navigator)) return;
        try {
            switch (type) {
                case "crash":
                case "hit":
                    navigator.vibrate([80, 45, 120]);
                    break;
                case "shield":
                    navigator.vibrate([60, 40, 80]);
                    break;
                case "megaboost":
                    navigator.vibrate([60, 30, 60, 30, 90]);
                    break;
                case "nearmiss":
                    navigator.vibrate([35]);
                    break;
                case "coin":
                    navigator.vibrate([15]);
                    break;
                case "ramp":
                    navigator.vibrate([50, 30, 70]);
                    break;
                case "speedup":
                    navigator.vibrate([40, 40, 40]);
                    break;
            }
        } catch(e) {}
    }

    // =================================================================
    // VOZ SINTETIZADA DO LOCUTOR DE ARCADE (WEB SPEECH SYNTHESIS API)
    // =================================================================


    speakAnnouncer(text, priority = false) {
        if (!this.settings || this.settings.announcer === false) return;
        if (!("speechSynthesis" in window)) return;
        try {
            if (priority) {
                window.speechSynthesis.cancel();
            } else if (window.speechSynthesis.speaking) {
                return; // Evita falas acumuladas secundárias
            }
            const utter = new SpeechSynthesisUtterance(text);
            const vol = (this.settings.announcerVolume ?? 90) / 100;
            utter.volume = Math.max(0, Math.min(1.0, vol));
            utter.rate = 1.25; // Ritmo ágil e dinâmico de arcade
            utter.pitch = 1.12; // Tom vibrante e enérgico
            utter.lang = "en-US";
            window.speechSynthesis.speak(utter);
        } catch(e) {}
    }

    // =================================================================
    // GERENCIAMENTO DE MISSÕES DIÁRIAS / DESAFIOS
    // =================================================================


};
