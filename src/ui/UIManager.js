import { LANES, GROUND_Y, FLIGHT_Y, GRAVITY, SLAM_FORCE, CAR_CATALOG, PILOT_CATALOG, COIN_PACKAGES, DAILY_MISSION_DEFS, API_URL } from '../core/Config.js';

export const UIManager = (Base) => class extends Base {
    initEventListeners() {
        this.startBtn.addEventListener("click", () => {
            this.sound.init();
            this.startGame();
        });

        this.restartBtn.addEventListener("click", () => {
            this.sound.init();
            this.startGame();
        });

        this.soundBtn.addEventListener("click", () => {
            this.sound.init();
            const enabled = this.sound.enabled;
            this.sound.enabled = !enabled;
            this.soundBtn.textContent = !enabled ? "🔊" : "🔇";
        });

        // Botão de Pause do HUD
        this.pauseBtn.addEventListener("click", () => {
            this.togglePause();
        });

        // Botões de Missões Diárias
        const openMissionsModal = () => {
            this.sound.init();
            this.renderMissions();
            if (this.missionsModal) this.missionsModal.classList.add("active");
        };
        if (this.openMissionsBtn) this.openMissionsBtn.addEventListener("click", openMissionsModal);
        if (this.goMissionsBtn) this.goMissionsBtn.addEventListener("click", openMissionsModal);
        if (this.closeMissionsBtn) this.closeMissionsBtn.addEventListener("click", () => {
            if (this.missionsModal) this.missionsModal.classList.remove("active");
        });

        // Botões de Configurações e Áudio
        const openSettingsModal = () => {
            this.sound.init();
            this.togglePause(true);
        };
        if (this.openSettingsBtn) this.openSettingsBtn.addEventListener("click", openSettingsModal);
        if (this.goSettingsBtn) this.goSettingsBtn.addEventListener("click", openSettingsModal);

        // Configurações: Volume SFX
        if (this.sfxVolumeSlider) {
            this.sfxVolumeSlider.value = this.settings.sfxVolume ?? 100;
            if (this.sfxValLabel) this.sfxValLabel.textContent = `${this.sfxVolumeSlider.value}%`;
            this.sfxVolumeSlider.addEventListener("input", (e) => {
                const val = parseInt(e.target.value, 10);
                this.settings.sfxVolume = val;
                this.sound.sfxVolume = val / 100;
                if (this.sfxValLabel) this.sfxValLabel.textContent = `${val}%`;
                localStorage.setItem("roadster_settings", JSON.stringify(this.settings));
            });
        }

        // Configurações: Locutor Arcade
        if (this.announcerToggleBtn) {
            const isAnnouncerOn = this.settings.announcer !== false;
            this.announcerToggleBtn.classList.toggle("active", isAnnouncerOn);
            this.announcerToggleBtn.textContent = isAnnouncerOn ? "LIGADO" : "DESLIGADO";
            this.announcerToggleBtn.addEventListener("click", () => {
                this.settings.announcer = !this.settings.announcer;
                this.announcerToggleBtn.classList.toggle("active", this.settings.announcer);
                this.announcerToggleBtn.textContent = this.settings.announcer ? "LIGADO" : "DESLIGADO";
                localStorage.setItem("roadster_settings", JSON.stringify(this.settings));
                if (this.settings.announcer) this.speakAnnouncer("Voice Online!", true);
            });
        }
        if (this.announcerVolumeSlider) {
            this.announcerVolumeSlider.value = this.settings.announcerVolume ?? 90;
            this.announcerVolumeSlider.addEventListener("input", (e) => {
                this.settings.announcerVolume = parseInt(e.target.value, 10);
                localStorage.setItem("roadster_settings", JSON.stringify(this.settings));
            });
        }

        // Configurações: Vibração Háptica
        if (this.hapticsToggleBtn) {
            const isHapticsOn = this.settings.haptics !== false;
            this.hapticsToggleBtn.classList.toggle("active", isHapticsOn);
            this.hapticsToggleBtn.textContent = isHapticsOn ? "LIGADO" : "DESLIGADO";
            this.hapticsToggleBtn.addEventListener("click", () => {
                this.settings.haptics = !this.settings.haptics;
                this.hapticsToggleBtn.classList.toggle("active", this.settings.haptics);
                this.hapticsToggleBtn.textContent = this.settings.haptics ? "LIGADO" : "DESLIGADO";
                localStorage.setItem("roadster_settings", JSON.stringify(this.settings));
                if (this.settings.haptics) this.triggerHaptic("coin");
            });
        }

        // Ações do Modal de Pause
        if (this.resumeGameBtn) {
            this.resumeGameBtn.addEventListener("click", () => this.togglePause(false));
        }

        const customTouchBtn = document.getElementById("custom-touch-btn");
        if (customTouchBtn) {
            customTouchBtn.addEventListener("click", () => {
                this.togglePause(false);
                if (typeof this.toggleTouchEditMode === "function") {
                    this.toggleTouchEditMode(true);
                }
            });
        }
        if (this.restartFromPauseBtn) {
            this.restartFromPauseBtn.addEventListener("click", () => {
                this.togglePause(false);
                this.startGame();
            });
        }
        if (this.menuFromPauseBtn) {
            this.menuFromPauseBtn.addEventListener("click", () => {
                this.togglePause(false);
                this.isRunning = false;
                this.startScreen.classList.add("active");
            });
        }

        // Botões de Garagem
        const openGarage = () => {
            this.sound.init();
            this.renderGarageCards();
            this.garageModal.classList.add("active");
        };
        if (this.openGarageBtn) this.openGarageBtn.addEventListener("click", openGarage);
        if (this.goGarageBtn) this.goGarageBtn.addEventListener("click", openGarage);
        if (this.closeGarageBtn) this.closeGarageBtn.addEventListener("click", () => {
            this.garageModal.classList.remove("active");
        });

        // Botões de Pistas & Mapas (5 Circuitos)
        const openMaps = () => {
            this.sound.init();
            this.renderMapsCards();
            const modal = document.getElementById("maps-modal");
            if (modal) modal.classList.add("active");
            const userCoins = document.getElementById("maps-user-coins");
            if (userCoins) userCoins.textContent = (this.totalCoins || 0).toLocaleString();
        };

        const openMapsBtn = document.getElementById("open-maps-btn");
        if (openMapsBtn) openMapsBtn.addEventListener("click", openMaps);

        const menuMapBadge = document.getElementById("menu-map-badge");
        if (menuMapBadge) menuMapBadge.addEventListener("click", openMaps);

        const closeMapsBtn = document.getElementById("close-maps-btn");
        if (closeMapsBtn) closeMapsBtn.addEventListener("click", () => {
            const modal = document.getElementById("maps-modal");
            if (modal) modal.classList.remove("active");
        });

        // Botões de Ranking Global
        const openLeaderboard = () => {
            this.sound.init();
            this.fetchLeaderboard();
            this.leaderboardModal.classList.add("active");
        };
        if (this.openLeaderboardBtn) this.openLeaderboardBtn.addEventListener("click", openLeaderboard);
        if (this.goLeaderboardBtn) this.goLeaderboardBtn.addEventListener("click", openLeaderboard);
        if (this.closeLeaderboardBtn) this.closeLeaderboardBtn.addEventListener("click", () => {
            this.leaderboardModal.classList.remove("active");
        });

        // Abas e Ações do Mini-Sistema de Autenticação (Usuário & Senha)
        this.authMode = "login";

        const setAuthMode = (mode) => {
            this.authMode = mode;
            this.usernameStatus.textContent = "";
            this.usernameStatus.className = "status-msg";
            if (mode === "login") {
                if (this.authTabLogin) this.authTabLogin.classList.add("active");
                if (this.authTabRegister) this.authTabRegister.classList.remove("active");
                if (this.passwordConfirmContainer) this.passwordConfirmContainer.style.display = "none";
                if (this.loginUsernameBtn) this.loginUsernameBtn.style.display = "block";
                if (this.saveUsernameBtn) this.saveUsernameBtn.style.display = "none";
                if (this.authModalSubtitle) this.authModalSubtitle.textContent = "ACESSO SEGURO COM USUÁRIO E SENHA";
            } else {
                if (this.authTabRegister) this.authTabRegister.classList.add("active");
                if (this.authTabLogin) this.authTabLogin.classList.remove("active");
                if (this.passwordConfirmContainer) this.passwordConfirmContainer.style.display = "block";
                if (this.loginUsernameBtn) this.loginUsernameBtn.style.display = "none";
                if (this.saveUsernameBtn) this.saveUsernameBtn.style.display = "block";
                if (this.authModalSubtitle) this.authModalSubtitle.textContent = "CRIE SUA CONTA COM USUÁRIO E SENHA";
            }
        };

        if (this.authTabLogin) this.authTabLogin.addEventListener("click", () => setAuthMode("login"));
        if (this.authTabRegister) this.authTabRegister.addEventListener("click", () => setAuthMode("register"));

        if (this.authTogglePwdBtn) {
            this.authTogglePwdBtn.addEventListener("click", () => {
                const isPwd = this.passwordInput && this.passwordInput.type === "password";
                const nextType = isPwd ? "text" : "password";
                if (this.passwordInput) this.passwordInput.type = nextType;
                if (this.passwordConfirmInput) this.passwordConfirmInput.type = nextType;
                this.authTogglePwdBtn.textContent = isPwd ? "🙈" : "👁️";
            });
        }

        const openUserModal = () => {
            this.sound.init();
            setAuthMode("login");
            if (this.usernameInput) this.usernameInput.value = this.currentUser === "Piloto" ? "" : this.currentUser;
            if (this.passwordInput) this.passwordInput.value = "";
            if (this.passwordConfirmInput) this.passwordConfirmInput.value = "";
            this.usernameStatus.textContent = "";
            this.renderSavedAccounts();
            if (this.userModal) this.userModal.classList.add("active");
            setTimeout(() => {
                if (this.usernameInput && !this.usernameInput.value) {
                    this.usernameInput.focus();
                } else if (this.passwordInput) {
                    this.passwordInput.focus();
                }
            }, 200);
        };

        if (this.hudUserBadge) this.hudUserBadge.addEventListener("click", openUserModal);
        if (this.menuUserBadge) this.menuUserBadge.addEventListener("click", openUserModal);
        if (this.closeUserModalBtn) this.closeUserModalBtn.addEventListener("click", () => {
            if (this.userModal) this.userModal.classList.remove("active");
        });

        const submitLogin = () => {
            const u = this.usernameInput ? this.usernameInput.value.trim() : "";
            const p = this.passwordInput ? this.passwordInput.value : "";
            this.loginUser(u, p);
        };

        const submitRegister = () => {
            const u = this.usernameInput ? this.usernameInput.value.trim() : "";
            const p = this.passwordInput ? this.passwordInput.value : "";
            const c = this.passwordConfirmInput ? this.passwordConfirmInput.value : "";
            this.registerUser(u, p, c);
        };

        if (this.loginUsernameBtn) this.loginUsernameBtn.addEventListener("click", submitLogin);
        if (this.saveUsernameBtn) this.saveUsernameBtn.addEventListener("click", submitRegister);

        const handleEnterKey = (e) => {
            if (e.key === "Enter") {
                if (this.authMode === "register") submitRegister();
                else submitLogin();
            }
        };

        if (this.usernameInput) this.usernameInput.addEventListener("keydown", handleEnterKey);
        if (this.passwordInput) this.passwordInput.addEventListener("keydown", handleEnterKey);
        if (this.passwordConfirmInput) this.passwordConfirmInput.addEventListener("keydown", handleEnterKey);

        // Botões de Seleção de Pilotos
        const openPilotModal = () => {
            this.sound.init();
            this.renderPilotCards();
            this.pilotModal.classList.add("active");
        };
        if (this.openPilotBtn) this.openPilotBtn.addEventListener("click", openPilotModal);
        if (this.goPilotBtn) this.goPilotBtn.addEventListener("click", openPilotModal);
        if (this.menuPilotBadge) this.menuPilotBadge.addEventListener("click", openPilotModal);
        if (this.hudPilotBadge) this.hudPilotBadge.addEventListener("click", openPilotModal);
        if (this.closePilotBtn) this.closePilotBtn.addEventListener("click", () => {
            this.pilotModal.classList.remove("active");
        });
    }



    togglePause(forceState = null) {
        const nextState = forceState !== null ? forceState : !this.isPaused;
        this.isPaused = nextState;
        if (this.pauseBtn) this.pauseBtn.textContent = this.isPaused ? "▶" : "⏸";

        if (this.isPaused) {
            this.sound.stopEngine();
            if (this.pauseSettingsModal) {
                this.pauseSettingsModal.classList.add("active");
                if (this.pauseModalTitle) this.pauseModalTitle.textContent = this.isRunning ? "JOGO PAUSADO" : "AJUSTES & ÁUDIO";
            }
        } else {
            if (this.pauseSettingsModal) this.pauseSettingsModal.classList.remove("active");
            if (this.isRunning) {
                this.lastTime = performance.now();
                requestAnimationFrame((t) => this.gameLoop(t));
            }
        }
    }



    loadAccountData(username) {
        if (!username || username === "Piloto") return null;
        const raw = localStorage.getItem(`roadster_acc_${username.toLowerCase()}`);
        if (raw) {
            try { return JSON.parse(raw); } catch(e) {}
        }
        return null;
    }



    saveAccountData(username) {
        if (!username || username === "Piloto") return;
        const accData = {
            username: this.currentUser,
            coins: this.totalCoins,
            selectedCar: this.selectedCar,
            unlockedCars: this.unlockedCars,
            selectedPilot: this.selectedPilot,
            unlockedPilots: this.unlockedPilots,
            upgrades: this.upgrades || {}
        };
        localStorage.setItem(`roadster_acc_${username.toLowerCase()}`, JSON.stringify(accData));

        localStorage.setItem("roadster_user", this.currentUser);
        localStorage.setItem("roadster_coins", this.totalCoins.toString());
        localStorage.setItem("roadster_selected_car", this.selectedCar);
        localStorage.setItem("roadster_unlocked_cars", JSON.stringify(this.unlockedCars));
        localStorage.setItem("roadster_selected_pilot", this.selectedPilot);
        localStorage.setItem("roadster_unlocked_pilots", JSON.stringify(this.unlockedPilots));

        let accounts = [];
        try {
            accounts = JSON.parse(localStorage.getItem("roadster_saved_accounts") || "[]");
        } catch(e) {}
        if (!accounts.map(a => a.toLowerCase()).includes(username.toLowerCase())) {
            accounts.push(username);
            localStorage.setItem("roadster_saved_accounts", JSON.stringify(accounts));
        }
    }



    switchUser(username) {
        if (!username) return;
        const local = this.loadAccountData(username);
        this.currentUser = username;
        if (local) {
            this.totalCoins = typeof local.coins === 'number' ? local.coins : 0;
            this.selectedCar = local.selectedCar || 'roadster';
            this.unlockedCars = local.unlockedCars || ['roadster'];
            this.selectedPilot = local.selectedPilot || 'aria';
            this.unlockedPilots = local.unlockedPilots || ['aria'];
            this.upgrades = local.upgrades || { phantom_air: 0, cybertruck_armor: 0 };
        }
        this.saveAccountData(username);
        this.buildPlayerVehicle(this.selectedCar);
        this.updateUserUI();
        this.renderGarageCards();
        this.renderPilotCards();
        this.sound.playHeart();
        this.triggerActionPopup(`BEM-VINDO, ${username}!`);

        // Sincroniza dados mais recentes com o banco de dados em background
        this.apiCall(`/api/user/${encodeURIComponent(username)}`).then(data => {
            if (data && data.success && data.user) {
                this.totalCoins = Math.max(this.totalCoins, data.user.coins || 0);
                if (data.user.unlocked_cars && Array.isArray(data.user.unlocked_cars)) {
                    this.unlockedCars = Array.from(new Set([...this.unlockedCars, ...data.user.unlocked_cars]));
                }
                if (data.user.upgrades) {
                    this.upgrades = { ...this.upgrades, ...data.user.upgrades };
                }
                this.saveAccountData(username);
                this.updateUserUI();
                this.renderGarageCards();
            }
        }).catch(() => {});
    }



    renderSavedAccounts() {
        const container = document.getElementById("saved-accounts-list");
        if (!container) return;
        container.innerHTML = "";

        let accounts = [];
        try {
            accounts = JSON.parse(localStorage.getItem("roadster_saved_accounts") || "[]");
        } catch(e) {}

        if (!accounts.map(a => a.toLowerCase()).includes(this.currentUser.toLowerCase()) && this.currentUser !== "Piloto") {
            accounts.push(this.currentUser);
        }

        if (accounts.length === 0) {
            container.innerHTML = '<span style="font-size:0.75rem; color:#64748b;">Nenhum piloto registrado neste aparelho.</span>';
            return;
        }

        accounts.forEach(acc => {
            const data = this.loadAccountData(acc);
            const coins = data ? data.coins : 0;
            const chip = document.createElement("button");
            chip.type = "button";
            chip.className = `account-chip ${acc.toLowerCase() === this.currentUser.toLowerCase() ? 'active' : ''}`;
            chip.innerHTML = `👤 ${acc} <span style="color:#fbbf24; font-size:0.72rem;">(🪙 ${coins})</span>`;
            chip.addEventListener("click", () => {
                if (this.usernameInput) this.usernameInput.value = acc;
                if (this.passwordInput) {
                    this.passwordInput.value = "";
                    this.passwordInput.focus();
                }
                this.usernameStatus.className = "status-msg";
                this.usernameStatus.textContent = `Piloto ${acc} selecionado. Digite a senha para entrar.`;
            });
            container.appendChild(chip);
        });
    }

    async loginUser(targetUsername) {
        const name = (targetUsername || '').trim();
        if (!name) {
            this.usernameStatus.className = "status-msg error";
            this.usernameStatus.textContent = "Digite o nome do piloto!";
            return;
        }

        this.usernameStatus.className = "status-msg";
        this.usernameStatus.textContent = "Buscando piloto...";

        const res = await this.apiCall('/api/user/login', 'POST', { username: name });
        if (res && res.success && res.user) {
            this.currentUser = res.user.username;
            this.totalCoins = res.user.coins;
            this.selectedCar = res.user.selected_car || 'roadster';
            this.unlockedCars = res.user.unlocked_cars || ['roadster'];
            this.upgrades = res.user.upgrades || {};
            this.saveAccountData(this.currentUser);

            this.usernameStatus.className = "status-msg success";
            this.usernameStatus.textContent = `Piloto ${this.currentUser} conectado!`;
            this.buildPlayerVehicle(this.selectedCar);
            this.updateUserUI();
            this.renderGarageCards();
            this.sound.playHeart();

            setTimeout(() => {
                this.userModal.classList.remove("active");
            }, 650);
            return;
        }

        const local = this.loadAccountData(name);
        if (local) {
            this.switchUser(name);
            this.usernameStatus.className = "status-msg success";
            this.usernameStatus.textContent = `Acesso local liberado para ${name}!`;
            setTimeout(() => {
                this.userModal.classList.remove("active");
            }, 650);
            return;
        }

        this.usernameStatus.className = "status-msg error";
        this.usernameStatus.textContent = "Piloto não encontrado. Se for seu 1º acesso, clique em CRIAR NOVO PILOTO.";
    }

    async initUserData() {
        this.updateUserUI();
        if (!this.currentUser || this.currentUser === "Piloto") return;

        const data = await this.apiCall(`/api/user/${encodeURIComponent(this.currentUser)}`);
        if (data && data.success && data.user) {
            this.totalCoins = Math.max(this.totalCoins, data.user.coins || 0);
            this.selectedCar = data.user.selected_car || this.selectedCar;
            if (data.user.unlocked_cars && Array.isArray(data.user.unlocked_cars)) {
                this.unlockedCars = Array.from(new Set([...this.unlockedCars, ...data.user.unlocked_cars]));
            }
            if (data.user.upgrades) {
                this.upgrades = { ...this.upgrades, ...data.user.upgrades };
            }

            this.saveAccountData(this.currentUser);
            this.buildPlayerVehicle(this.selectedCar);
            this.updateUserUI();
        }
    }



    updateUserUI() {
        if (this.hudUsername) this.hudUsername.textContent = this.currentUser;
        if (this.menuUsername) this.menuUsername.textContent = this.currentUser;
        if (this.hudCoins) this.hudCoins.textContent = this.totalCoins.toLocaleString();
        if (this.menuCoins) this.menuCoins.textContent = this.totalCoins.toLocaleString();
        if (this.garageCoinsVal) this.garageCoinsVal.textContent = this.totalCoins.toLocaleString();

        const pilot = PILOT_CATALOG[this.selectedPilot] || PILOT_CATALOG.aria;
        if (this.hudPilotName) this.hudPilotName.textContent = pilot.name;
        if (this.menuPilotName) this.menuPilotName.textContent = pilot.name;
        if (this.modalPilotName) this.modalPilotName.textContent = pilot.name;
    }

    async registerUser(newUsername) {
        const name = (newUsername || '').trim();
        if (!name || name.length < 3) {
            this.usernameStatus.className = "status-msg error";
            this.usernameStatus.textContent = "O nome precisa ter pelo menos 3 caracteres.";
            return;
        }

        this.usernameStatus.className = "status-msg";
        this.usernameStatus.textContent = "Registrando piloto...";

        const res = await this.apiCall('/api/user/register', 'POST', { username: name });
        if (res && res.success && res.user) {
            this.currentUser = res.user.username;
            this.totalCoins = res.user.coins;
            this.selectedCar = res.user.selected_car || 'roadster';
            this.unlockedCars = res.user.unlocked_cars || ['roadster'];
            this.upgrades = res.user.upgrades || {};
            this.saveAccountData(this.currentUser);

            this.usernameStatus.className = "status-msg success";
            this.usernameStatus.textContent = res.isNew ? "Piloto registrado com sucesso no Neon DB!" : "Perfil sincronizado!";
            
            this.buildPlayerVehicle(this.selectedCar);
            this.updateUserUI();
            this.renderGarageCards();
            this.sound.playHeart();

            setTimeout(() => {
                this.userModal.classList.remove("active");
            }, 650);
        } else {
            this.currentUser = name;
            this.totalCoins = 0;
            this.selectedCar = 'roadster';
            this.unlockedCars = ['roadster'];
            this.upgrades = { phantom_air: 0, cybertruck_armor: 0 };
            this.saveAccountData(name);

            this.usernameStatus.className = "status-msg success";
            this.usernameStatus.textContent = "Piloto salvo localmente!";
            this.buildPlayerVehicle(this.selectedCar);
            this.updateUserUI();
            this.renderGarageCards();

            setTimeout(() => {
                this.userModal.classList.remove("active");
            }, 650);
        }
    }

    async submitRunScore(score, distance, coinsEarned) {
        if (!this.currentUser || this.currentUser === "Piloto") return;
        const res = await this.apiCall('/api/score/submit', 'POST', {
            username: this.currentUser,
            score,
            distance,
            coinsEarned,
            carUsed: this.selectedCar
        });
        if (res && res.success) {
            this.totalCoins = res.coins;
            this.saveAccountData(this.currentUser);
            this.updateUserUI();
        }
    }

    async fetchLeaderboard() {
        const container = this.leaderboardListContainer;
        container.innerHTML = '<div style="text-align: center; color: #94a3b8; padding: 25px;">Consultando banco de dados Neon...</div>';

        const res = await this.apiCall('/api/leaderboard');
        if (res && res.success && res.leaderboard && res.leaderboard.length > 0) {
            this.renderLeaderboard(res.leaderboard);
        } else {
            const localBest = parseInt(localStorage.getItem("roadster_dash_best") || "0", 10);
            const mockData = [
                { username: this.currentUser, best_score: localBest, selected_car: this.selectedCar },
                { username: "CyberRacer", best_score: 18450, selected_car: "solaris" },
                { username: "NeonGhost", best_score: 14200, selected_car: "phantom" },
                { username: "TeslaPilot", best_score: 9800, selected_car: "cybertruck" }
            ].sort((a, b) => b.best_score - a.best_score);
            this.renderLeaderboard(mockData);
        }
    }



    renderLeaderboard(list) {
        const container = this.leaderboardListContainer;
        container.innerHTML = "";

        list.forEach((item, index) => {
            const row = document.createElement("div");
            const pos = index + 1;
            const topClass = pos === 1 ? "top-1" : pos === 2 ? "top-2" : pos === 3 ? "top-3" : "";
            row.className = `leaderboard-row ${topClass}`;

            const medal = pos === 1 ? "🥇" : pos === 2 ? "🥈" : pos === 3 ? "🥉" : `#${pos}`;
            const carInfo = CAR_CATALOG[item.selected_car] || { name: item.selected_car };

            row.innerHTML = `
                <div class="rank-pos">${medal}</div>
                <div class="rank-user-info">
                    <span class="rank-username">${item.username}</span>
                    <span class="rank-car-tag">${carInfo.name}</span>
                </div>
                <div class="rank-score-val">${item.best_score.toLocaleString()}</div>
            `;
            container.appendChild(row);
        });
    }



    renderGarageCards() {
        const container = this.garageCardsContainer;
        container.innerHTML = "";
        if (this.garageCoinsVal) this.garageCoinsVal.textContent = this.totalCoins.toLocaleString();

        Object.values(CAR_CATALOG).forEach(car => {
            const card = document.createElement("div");
            const isSelected = this.selectedCar === car.id;
            const isOwned = this.unlockedCars.includes(car.id);

            card.className = `car-card ${isSelected ? 'selected' : ''}`;

            let badgeHTML = '';
            if (isSelected) {
                badgeHTML = '<span class="car-badge selected-tag">EQUIPADO</span>';
            } else if (isOwned) {
                badgeHTML = '<span class="car-badge owned">ADQUIRIDO</span>';
            } else {
                badgeHTML = `<span class="car-badge" style="background: rgba(255,255,255,0.1); color: #cbd5e1;">${car.tag}</span>`;
            }

            let btnHTML = '';
            if (isSelected) {
                btnHTML = '<button class="car-action-btn btn-disabled">EM USO</button>';
            } else if (isOwned) {
                btnHTML = `<button class="car-action-btn btn-equip" data-car="${car.id}">SELECIONAR</button>`;
            } else {
                if (this.totalCoins >= car.price) {
                    btnHTML = `<button class="car-action-btn btn-buy" data-car="${car.id}">COMPRAR (🪙 ${car.price})</button>`;
                } else {
                    btnHTML = `<button class="car-action-btn btn-disabled">FALTAM 🪙 ${car.price - this.totalCoins}</button>`;
                }
            }

            // Seção de Melhoria (Upgrades) para Cybertruck (Blindagem) e Neon Phantom (Ar)
            let upgradeHTML = '';
            if (isOwned && car.id === 'cybertruck') {
                const armorLvl = (this.upgrades && this.upgrades.cybertruck_armor) || 0;
                const armorCost = 150;
                const canBuyArmor = this.totalCoins >= armorCost && armorLvl < 3;
                const armorBtnText = armorLvl >= 3 
                    ? 'BLINDAGEM MÁXIMA (★ MAX)' 
                    : canBuyArmor 
                        ? `+1 CORAÇÃO EXTRA (🪙 ${armorCost})` 
                        : `FALTAM 🪙 ${armorCost - this.totalCoins} P/ BLINDAGEM`;
                
                upgradeHTML = `
                    <div class="upgrade-section">
                        <div class="upgrade-header">
                            <span>🛡️ BLINDAGEM REFORÇADA</span>
                            <span class="upgrade-badge">NÍVEL ${armorLvl} (${2 + armorLvl} ❤️)</span>
                        </div>
                        <button class="btn-upgrade ${canBuyArmor ? '' : 'btn-disabled'}" data-upgrade="cybertruck_armor" ${canBuyArmor ? '' : 'disabled'}>
                            ${armorBtnText}
                        </button>
                    </div>
                `;
            } else if (isOwned && car.id === 'phantom') {
                const airLvl = (this.upgrades && this.upgrades.phantom_air) || 0;
                const airCost = 100;
                const canBuyAir = this.totalCoins >= airCost && airLvl < 5;
                const totalAir = 225 + (airLvl * 25);
                const airBtnText = airLvl >= 5
                    ? 'TANQUE MÁXIMO (★ MAX)'
                    : canBuyAir
                        ? `EXPANDIR +25L AR (🪙 ${airCost})`
                        : `FALTAM 🪙 ${airCost - this.totalCoins} P/ EXPANSÃO`;

                upgradeHTML = `
                    <div class="upgrade-section">
                        <div class="upgrade-header">
                            <span>💨 EXPANSÃO DE AR</span>
                            <span class="upgrade-badge">NÍVEL ${airLvl} (${totalAir} L)</span>
                        </div>
                        <button class="btn-upgrade ${canBuyAir ? '' : 'btn-disabled'}" data-upgrade="phantom_air" ${canBuyAir ? '' : 'disabled'}>
                            ${airBtnText}
                        </button>
                    </div>
                `;
            }

            const priceText = car.price === 0 ? "GRÁTIS" : `🪙 ${car.price}`;

            card.innerHTML = `
                <div>
                    <div class="car-card-header">
                        <span class="car-title">${car.name}</span>
                        ${badgeHTML}
                    </div>
                    <div class="car-desc">${car.desc}</div>
                    <div class="car-bonus">⚡ ${car.bonus}</div>
                    ${upgradeHTML}
                </div>
                <div class="car-footer">
                    <span class="car-price-tag">${priceText}</span>
                    ${btnHTML}
                </div>
            `;

            // Listeners dos botões de selecionar e comprar
            const equipBtn = card.querySelector(".btn-equip");
            if (equipBtn) {
                equipBtn.addEventListener("click", () => this.selectCar(car.id));
            }
            const buyBtn = card.querySelector(".btn-buy");
            if (buyBtn) {
                buyBtn.addEventListener("click", () => this.buyCar(car.id));
            }
            const upgradeBtn = card.querySelector(".btn-upgrade:not(.btn-disabled)");
            if (upgradeBtn) {
                upgradeBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    const uType = upgradeBtn.getAttribute("data-upgrade");
                    this.buyUpgrade(uType);
                });
            }

            container.appendChild(card);
        });
    }



    buyUpgrade(upgradeType) {
        const costs = { phantom_air: 100, cybertruck_armor: 150 };
        const cost = costs[upgradeType];
        if (!cost || this.totalCoins < cost) return;

        // Atualização Otimista Imediata (Zero delay)
        this.totalCoins -= cost;
        this.upgrades = this.upgrades || {};
        this.upgrades[upgradeType] = (this.upgrades[upgradeType] || 0) + 1;

        this.saveAccountData(this.currentUser);
        this.sound.playBuyCar();
        this.updateUserUI();
        this.renderGarageCards();

        const upgradeName = upgradeType === 'phantom_air' ? 'Tanque de Ar (+25L)' : 'Blindagem (+1 Vida)';
        this.triggerActionPopup(`UPGRADE: ${upgradeName}!`);

        // Sincroniza em segundo plano com a API
        this.apiCall('/api/user/upgrade', 'POST', {
            username: this.currentUser,
            upgradeType: upgradeType
        }).catch(() => {});
    }



    buyCar(carId) {
        const car = CAR_CATALOG[carId];
        if (!car || this.totalCoins < car.price) return;

        // Atualização Otimista Imediata
        this.totalCoins -= car.price;
        if (!this.unlockedCars.includes(carId)) {
            this.unlockedCars.push(carId);
        }
        this.selectedCar = carId;

        this.saveAccountData(this.currentUser);
        this.sound.playBuyCar();
        this.buildPlayerVehicle(this.selectedCar);
        this.updateUserUI();
        this.renderGarageCards();
        this.triggerActionPopup(`NOVO CARRO: ${car.name}!`);

        // Sincroniza em segundo plano com a API
        this.apiCall('/api/user/buy-car', 'POST', {
            username: this.currentUser,
            carId: carId
        }).catch(() => {});
    }



    selectCar(carId) {
        if (!this.unlockedCars.includes(carId)) return;
        this.selectedCar = carId;

        // Atualização Otimista Imediata
        this.saveAccountData(this.currentUser);
        this.sound.playLaneChange();
        this.buildPlayerVehicle(this.selectedCar);
        this.renderGarageCards();
        this.triggerActionPopup(`EQUIPADO: ${CAR_CATALOG[carId].name}!`);

        // Sincroniza em segundo plano com a API
        this.apiCall('/api/user/select-car', 'POST', {
            username: this.currentUser,
            carId: carId
        }).catch(() => {});
    }



    renderPilotCards() {
        const container = this.pilotCardsContainer;
        if (!container) return;
        container.innerHTML = "";

        Object.values(PILOT_CATALOG).forEach(pilot => {
            const card = document.createElement("div");
            const isSelected = this.selectedPilot === pilot.id;
            const isUnlocked = (pilot.price === 0) || (this.unlockedPilots && this.unlockedPilots.includes(pilot.id));
            card.className = `pilot-card ${isSelected ? 'selected' : ''} ${!isUnlocked ? 'locked' : ''}`;

            let btnHTML = "";
            if (isSelected) {
                btnHTML = '<button class="car-action-btn btn-disabled">EM COMANDO</button>';
            } else if (isUnlocked) {
                btnHTML = `<button class="car-action-btn btn-equip" data-pilot="${pilot.id}">SELECIONAR</button>`;
            } else {
                const canAfford = this.totalCoins >= pilot.price;
                if (canAfford) {
                    btnHTML = `<button class="car-action-btn btn-buy-pilot" data-pilot="${pilot.id}" style="background: linear-gradient(135deg, #f59e0b, #d97706); color: #000; font-weight: 900; border: none; cursor: pointer; border-radius: 8px; padding: 7px 14px; font-size: 0.8rem;">CONTRATAR (${pilot.price} 🪙)</button>`;
                } else {
                    const missing = pilot.price - this.totalCoins;
                    btnHTML = `<button class="car-action-btn btn-disabled">FALTAM ${missing} 🪙</button>`;
                }
            }

            card.innerHTML = `
                <div>
                    <div class="pilot-card-header">
                        <div class="pilot-avatar">${pilot.avatar}</div>
                        <div>
                            <div class="pilot-name">${pilot.name}</div>
                            <div class="pilot-title">${pilot.title}</div>
                        </div>
                        ${!isUnlocked ? `<div style="margin-left: auto; background: #0f172a; border: 1px solid #f59e0b; border-radius: 6px; padding: 3px 8px; font-size: 0.75rem; font-weight: 800; color: #fbbf24;">🪙 ${pilot.price}</div>` : ''}
                    </div>
                    <div class="car-desc">${pilot.desc}</div>
                    <div class="pilot-skill-box">
                        <div class="pilot-skill-name">⚡ ${pilot.skill}</div>
                        <div class="pilot-skill-desc">${pilot.perkDesc}</div>
                    </div>
                </div>
                <div class="car-footer" style="margin-top: 10px;">
                    <span style="font-size: 0.72rem; color: #38bdf8; font-weight: 800;">HABILIDADE PASSIVA</span>
                    ${btnHTML}
                </div>
            `;

            const selectBtn = card.querySelector(".btn-equip");
            if (selectBtn) {
                selectBtn.addEventListener("click", () => this.selectPilot(pilot.id));
            }
            const buyBtn = card.querySelector(".btn-buy-pilot");
            if (buyBtn) {
                buyBtn.addEventListener("click", () => this.buyPilot(pilot.id));
            }

            container.appendChild(card);
        });
    }



    buyPilot(pilotId) {
        const pilot = PILOT_CATALOG[pilotId];
        if (!pilot || (this.unlockedPilots && this.unlockedPilots.includes(pilotId))) return;
        if (this.totalCoins < pilot.price) {
            this.triggerActionPopup("MOEDAS INSUFICIENTES!");
            this.sound.playCrash();
            return;
        }
        this.totalCoins -= pilot.price;
        if (!this.unlockedPilots) this.unlockedPilots = ['aria'];
        this.unlockedPilots.push(pilotId);
        localStorage.setItem("roadster_coins", this.totalCoins.toString());
        localStorage.setItem("roadster_unlocked_pilots", JSON.stringify(this.unlockedPilots));
        this.saveAccountData(this.currentUser);
        this.sound.playBuyCar();
        this.updateUserCoinsEverywhere();
        this.triggerActionPopup(`PILOTO CONTRATADO: ${pilot.name}! 🎉`);
        this.selectPilot(pilotId);
    }



    selectPilot(pilotId) {
        if (!PILOT_CATALOG[pilotId]) return;
        const isUnlocked = (PILOT_CATALOG[pilotId].price === 0) || (this.unlockedPilots && this.unlockedPilots.includes(pilotId));
        if (!isUnlocked) return;
        this.selectedPilot = pilotId;
        localStorage.setItem("roadster_selected_pilot", pilotId);
        this.activePilotPerks = PILOT_CATALOG[pilotId].perk;
        this.airRechargeRate = 18.0 * (this.activePilotPerks.airRechargeMult || 1.0);
        this.sound.playHeart();
        this.updateUserUI();
        this.renderPilotCards();
        this.triggerActionPopup(`PILOTO: ${PILOT_CATALOG[pilotId].name}!`);
    }



    initDailyMissions() {
        const todayStr = new Date().toISOString().slice(0, 10);
        this.missionsKey = `roadster_missions_${todayStr}`;
        let saved = {};
        try {
            const raw = localStorage.getItem(this.missionsKey);
            if (raw) saved = JSON.parse(raw);
        } catch(e) {}
        this.missionsState = saved || {};
        DAILY_MISSION_DEFS.forEach(m => {
            if (!this.missionsState[m.id]) {
                this.missionsState[m.id] = { progress: 0, claimed: false };
            }
        });
        this.saveMissionsState();
    }



    saveMissionsState() {
        if (!this.missionsKey) return;
        localStorage.setItem(this.missionsKey, JSON.stringify(this.missionsState));
    }



    trackMissionProgress(type, amount = 1) {
        let updated = false;
        DAILY_MISSION_DEFS.forEach(m => {
            if (m.type === type) {
                const st = this.missionsState[m.id];
                if (st && !st.claimed && st.progress < m.target) {
                    if (type === 'speed_level') {
                        st.progress = Math.max(st.progress, amount);
                    } else {
                        st.progress += amount;
                    }
                    if (st.progress >= m.target) {
                        st.progress = m.target;
                        this.triggerActionPopup(`📜 MISSÃO CONCLUÍDA: ${m.title}!`);
                        this.sound.playMissionComplete();
                        this.speakAnnouncer("Mission Complete!");
                        this.triggerHaptic("speedup");
                    }
                    updated = true;
                }
            }
        });
        if (updated) {
            this.saveMissionsState();
            this.renderMissions();
        }
    }



    renderMissions() {
        const container = this.missionsListContainer;
        if (!container) return;
        container.innerHTML = "";

        DAILY_MISSION_DEFS.forEach(m => {
            const st = (this.missionsState && this.missionsState[m.id]) || { progress: 0, claimed: false };
            const isDone = st.progress >= m.target;
            const pct = Math.min(100, Math.round((st.progress / m.target) * 100));

            const card = document.createElement("div");
            card.className = "mission-card";

            let btnHTML = "";
            if (st.claimed) {
                btnHTML = `<button class="btn-claim-reward btn-claimed" disabled>RESGATADO</button>`;
            } else if (isDone) {
                btnHTML = `<button class="btn-claim-reward" data-id="${m.id}">RESGATAR 🪙 +${m.reward}</button>`;
            } else {
                btnHTML = `<span style="font-size: 0.72rem; color: #94a3b8; font-weight: 700;">${st.progress}/${m.target}</span>`;
            }

            card.innerHTML = `
                <div class="mission-header">
                    <span class="mission-title">${m.icon} ${m.title}</span>
                    <span class="mission-reward">🪙 +${m.reward}</span>
                </div>
                <div class="mission-desc">${m.desc}</div>
                <div class="mission-progress-bar">
                    <div class="mission-progress-fill" style="width: ${pct}%;"></div>
                </div>
                <div style="display: flex; justify-content: flex-end; align-items: center; margin-top: 6px;">
                    ${btnHTML}
                </div>
            `;

            const claimBtn = card.querySelector(".btn-claim-reward:not(.btn-claimed)");
            if (claimBtn) {
                claimBtn.addEventListener("click", () => this.claimMissionReward(m.id));
            }

            container.appendChild(card);
        });
    }



    claimMissionReward(missionId) {
        const def = DAILY_MISSION_DEFS.find(m => m.id === missionId);
        const st = this.missionsState && this.missionsState[missionId];
        if (!def || !st || st.claimed || st.progress < def.target) return;

        st.claimed = true;
        this.saveMissionsState();
        this.totalCoins += def.reward;
        this.saveAccountData(this.currentUser);
        this.sound.playCoin();
        this.updateUserUI();
        this.renderMissions();
        this.triggerActionPopup(`+${def.reward} MOEDAS RESGATADAS!`);
    }

    // =================================================================
    // CICLO DIA / NOITE DINÂMICO SYNTHWAVE (SUNSET TO MIDNIGHT)
    // =================================================================


    initCoinShop() {
        this.coinShopModal = document.getElementById("coin-shop-modal");
        this.closeCoinShopBtn = document.getElementById("close-coin-shop-btn");
        this.coinPackagesContainer = document.getElementById("coin-packages-container");
        this.shopUserBalance = document.getElementById("shop-user-balance");
        this.mpPaymentModal = document.getElementById("mp-payment-modal");
        this.closeMpModalBtn = document.getElementById("close-mp-modal-btn");
        this.mpPkgName = document.getElementById("mp-pkg-name");
        this.mpPkgPrice = document.getElementById("mp-pkg-price");
        this.mpCheckoutLink = document.getElementById("mp-checkout-link");
        this.mpPixCode = document.getElementById("mp-pix-code");
        this.copyPixBtn = document.getElementById("copy-pix-btn");
        this.simulatePaymentBtn = document.getElementById("simulate-payment-btn");
        this.mpPaymentStatus = document.getElementById("mp-payment-status");
        this.openCoinShopBtn = document.getElementById("open-coin-shop-btn");
        this.garageBuyCoinsBtn = document.getElementById("garage-buy-coins-btn");

        if (this.openCoinShopBtn) {
            this.openCoinShopBtn.addEventListener("click", () => {
                this.sound.playCoin();
                this.openCoinShop();
            });
        }

        if (this.garageBuyCoinsBtn) {
            this.garageBuyCoinsBtn.addEventListener("click", () => {
                this.sound.playCoin();
                if (this.garageModal) this.garageModal.classList.remove("active");
                this.openCoinShop();
            });
        }

        if (this.closeCoinShopBtn) {
            this.closeCoinShopBtn.addEventListener("click", () => {
                if (this.coinShopModal) this.coinShopModal.classList.remove("active");
            });
        }

        if (this.closeMpModalBtn) {
            this.closeMpModalBtn.addEventListener("click", () => {
                if (this.mpPaymentModal) this.mpPaymentModal.classList.remove("active");
            });
        }

        if (this.copyPixBtn && this.mpPixCode) {
            this.copyPixBtn.addEventListener("click", () => {
                const code = this.mpPixCode.textContent || "";
                if (navigator.clipboard && code) {
                    navigator.clipboard.writeText(code).then(() => {
                        this.copyPixBtn.textContent = "COPIADO! ✅";
                        setTimeout(() => { if (this.copyPixBtn) this.copyPixBtn.textContent = "COPIAR CÓDIGO PIX"; }, 2500);
                    }).catch(() => {
                        this.copyPixBtn.textContent = "SELECIONADO!";
                    });
                }
            });
        }

        if (this.simulatePaymentBtn) {
            this.simulatePaymentBtn.addEventListener("click", () => {
                this.simulatePaymentApproval();
            });
        }
    }



    openCoinShop() {
        if (this.shopUserBalance) {
            this.shopUserBalance.textContent = this.totalCoins.toLocaleString();
        }
        this.renderCoinShopCards();
        if (this.coinShopModal) {
            this.coinShopModal.classList.add("active");
        }
    }



    renderCoinShopCards() {
        if (!this.coinPackagesContainer) return;
        this.coinPackagesContainer.innerHTML = "";

        const packagesList = Object.values(COIN_PACKAGES).filter(p => !p.type || p.type !== 'map');
        packagesList.forEach(pkg => {
            const card = document.createElement("div");
            card.className = "coin-package-card";
            const priceVal = Number(pkg.priceBRL || pkg.price || 0);
            card.innerHTML = `
                ${pkg.tag ? `<div class="pkg-badge">${pkg.tag}</div>` : ""}
                <div class="pkg-icon">${pkg.icon || '🪙'}</div>
                <div class="pkg-coins">${(pkg.coins || 0).toLocaleString()} MOEDAS</div>
                <div class="pkg-tag">${pkg.desc || pkg.name}</div>
                <button class="pkg-price-btn" data-pkg="${pkg.id}">
                    💳 R$ ${priceVal.toFixed(2).replace('.', ',')}
                </button>
            `;

            const btn = card.querySelector(".pkg-price-btn");
            if (btn) {
                btn.addEventListener("click", () => {
                    this.sound.playCoin();
                    this.openPaymentCheckout(pkg.id);
                });
            }
            this.coinPackagesContainer.appendChild(card);
        });
    }

    async openPaymentCheckout(packageId) {
        const pkg = COIN_PACKAGES[packageId] || Object.values(COIN_PACKAGES).find(p => p.id === packageId);
        if (!pkg) return;

        this.selectedCheckoutPackage = pkg;
        const priceVal = Number(pkg.priceBRL || pkg.price || 0);

        if (this.payPkgName) this.payPkgName.textContent = pkg.type === 'map' ? pkg.name : `${(pkg.coins || 0).toLocaleString()} Moedas (${pkg.tag || pkg.name})`;
        if (this.payPkgPrice) this.payPkgPrice.textContent = `R$ ${priceVal.toFixed(2).replace('.', ',')}`;
        if (this.payPkgUsername) this.payPkgUsername.textContent = this.currentUser || 'Piloto';

        const pixBox = this.pixCopyPasteBox || document.getElementById("pix-copy-paste-box");
        if (pixBox) pixBox.textContent = "Gerando cobrança oficial com Mercado Pago...";

        const redirSec = this.payRedirectSection || document.getElementById("pay-redirect-section");
        if (redirSec) redirSec.style.display = "none";

        if (this.mpPaymentModal) this.mpPaymentModal.classList.add("active");

        const loc = window.location;
        const isLocal = loc.hostname === "localhost" || loc.hostname === "127.0.0.1";
        const apiBase = isLocal ? `http://${loc.hostname}:${loc.port || 3000}` : "https://jogo-tesla.onrender.com";

        try {
            const res = await fetch(`${apiBase}/api/payment/create-preference`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    packageId: pkg.id,
                    username: this.currentUser || "Piloto"
                })
            });

            const data = await res.json();
            if (data.success) {
                const checkoutLink = this.payMercadoPagoLink || document.getElementById("pay-mercadopago-link");
                if (data.init_point && checkoutLink) {
                    checkoutLink.href = data.init_point;
                    checkoutLink.target = "_blank";
                    if (redirSec) redirSec.style.display = "block";
                }

                const pixSection = document.getElementById("pay-pix-section");
                const qrImg = document.getElementById("pay-qr-image") || document.getElementById("mp-qr-image");

                if (data.qrCodeBase64 && qrImg) {
                    qrImg.src = "data:image/png;base64," + data.qrCodeBase64;
                    if (pixBox) pixBox.textContent = data.pixCode || "";
                    if (pixSection) pixSection.style.display = "block";
                } else if (data.pixCode) {
                    if (qrImg) qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=6&data=${encodeURIComponent(data.pixCode)}`;
                    if (pixBox) pixBox.textContent = data.pixCode;
                    if (pixSection) pixSection.style.display = "block";
                } else {
                    if (pixSection) pixSection.style.display = "none";
                    if (redirSec) {
                        redirSec.style.display = "block";
                        if (checkoutLink) {
                            checkoutLink.textContent = "💳 CLIQUE AQUI PARA PAGAR VIA PIX OU CARTÃO NO MERCADO PAGO ➔";
                            checkoutLink.style.padding = "16px";
                            checkoutLink.style.fontSize = "0.95rem";
                        }
                    }
                }

                if (data.orderId) {
                    this.startPaymentApprovalPolling(data.orderId, pkg);
                }
            } else {
                throw new Error(data.error || "Falha ao gerar cobrança");
            }
        } catch(err) {
            console.warn("[Payment] Falha na preferência do Mercado Pago, usando fallback seguro:", err);
            const offlinePix = `00020126580014br.gov.bcb.pix0136pix-mercadopago-${pkg.id}520400005303986540${priceVal.toFixed(2)}5802BR5916ROADSTER DASH`;
            if (pixBox) {
                pixBox.textContent = offlinePix;
            }
            const qrImgFallback = document.getElementById("pay-qr-image") || document.getElementById("mp-qr-image");
            if (qrImgFallback) {
                qrImgFallback.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=6&data=${encodeURIComponent(offlinePix)}`;
            }
            const checkoutLink = this.payMercadoPagoLink || document.getElementById("pay-mercadopago-link");
            if (checkoutLink) {
                checkoutLink.href = "https://www.mercadopago.com.br";
                if (redirSec) redirSec.style.display = "block";
            }
        }
    }

    startPaymentApprovalPolling(orderId, pkg) {
        if (this.activePaymentPolling) clearInterval(this.activePaymentPolling);
        const loc = window.location;
        const isLocal = loc.hostname === "localhost" || loc.hostname === "127.0.0.1";
        const apiBase = isLocal ? `http://${loc.hostname}:${loc.port || 3000}` : "https://jogo-tesla.onrender.com";

        let attempts = 0;
        this.activePaymentPolling = setInterval(async () => {
            attempts++;
            if (attempts > 90) {
                clearInterval(this.activePaymentPolling);
                this.activePaymentPolling = null;
                return;
            }
            try {
                const res = await fetch(`${apiBase}/api/payment/check-status?orderId=${encodeURIComponent(orderId)}&username=${encodeURIComponent(this.currentUser)}`);
                if (res.ok) {
                    const status = await res.json();
                    if (status.approved) {
                        clearInterval(this.activePaymentPolling);
                        this.activePaymentPolling = null;
                        this.onPaymentApprovedSuccess(pkg);
                    }
                }
            } catch(e) {}
        }, 3000);
    }

    onPaymentApprovedSuccess(pkg) {
        if (pkg.type === 'map' || pkg.id === 'pista_premium' || pkg.id === 'map_cyber_premium') {
            if (!this.unlockedMaps.includes("pista_premium")) {
                this.unlockedMaps.push("pista_premium");
            }
            localStorage.setItem("roadster_unlocked_maps", JSON.stringify(this.unlockedMaps));
            this.selectMap("pista_premium");
            this.updateMapBadge();
            this.triggerActionPopup("💎 PISTA PREMIUM DESBLOQUEADA COM SUCESSO!");
            this.speakAnnouncer("Super Speedway Unlocked!", true);
        } else {
            const coinsToAdd = pkg.coins || 0;
            this.totalCoins += coinsToAdd;
            localStorage.setItem("roadster_coins", this.totalCoins.toString());
            this.updateUserCoinsEverywhere();
            this.triggerActionPopup(`+${coinsToAdd.toLocaleString()} MOEDAS VIP!`);
            this.speakAnnouncer("Payment Approved! Coins Added!", true);
        }

        this.sound.playMissionComplete();
        this.saveAccountData(this.currentUser);

        setTimeout(() => {
            if (this.mpPaymentModal) this.mpPaymentModal.classList.remove("active");
            if (this.coinShopModal) this.coinShopModal.classList.remove("active");
        }, 1200);
    }

    async simulatePaymentApproval() {
        if (!this.selectedCheckoutPackage) return;
        const pkg = this.selectedCheckoutPackage;

        const loc = window.location;
        const isLocal = loc.hostname === "localhost" || loc.hostname === "127.0.0.1";
        const apiBase = isLocal ? `http://${loc.hostname}:${loc.port || 3000}` : "https://jogo-tesla.onrender.com";

        try {
            const res = await fetch(`${apiBase}/api/payment/simulate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    packageId: pkg.id,
                    username: this.currentUser || "Piloto"
                })
            });
            const data = await res.json();
            if (data.success && data.totalCoins !== undefined) {
                this.totalCoins = data.totalCoins;
            }
        } catch(e) {}

        this.onPaymentApprovedSuccess(pkg);
    }



    
    updateMapBadge() {
        if (!this.selectedMap) this.selectedMap = "rodovia_dupla";
        const map = (typeof MAPS_CATALOG !== "undefined" && MAPS_CATALOG[this.selectedMap]) || { name: "Rodovia Dupla" };
        const badge = document.getElementById("menu-map-name");
        if (badge) {
            badge.textContent = map.name;
        }
    }

    renderMapsCards() {
        const grid = document.getElementById("maps-grid-container");
        if (!grid) return;
        grid.innerHTML = "";

        if (!this.unlockedMaps || !Array.isArray(this.unlockedMaps)) {
            this.unlockedMaps = ["rodovia_dupla"];
        }
        if (!this.unlockedMaps.includes("rodovia_dupla")) {
            this.unlockedMaps.push("rodovia_dupla");
        }

        const mapsList = Object.values(typeof MAPS_CATALOG !== "undefined" ? MAPS_CATALOG : {});
        mapsList.forEach(map => {
            const isUnlocked = this.unlockedMaps.includes(map.id);
            const isSelected = (this.selectedMap === map.id);
            const isPremium = (map.unlockType === "real_money");

            const card = document.createElement("div");
            card.className = `map-card ${isSelected ? "selected" : ""} ${isPremium ? "premium-card" : ""}`;

            let actionBtnHTML = "";
            if (isSelected) {
                actionBtnHTML = `<button class="primary-btn" style="width: 100%; padding: 8px; font-size: 0.82rem;" disabled>✓ EQUIPADO</button>`;
            } else if (isUnlocked) {
                actionBtnHTML = `<button class="primary-btn" style="width: 100%; padding: 8px; font-size: 0.82rem;" onclick="window.game.selectMap('${map.id}')">SELECIONAR PISTA</button>`;
            } else if (isPremium) {
                actionBtnHTML = `<button class="action-btn" style="width: 100%; padding: 8px; font-size: 0.82rem; background: linear-gradient(135deg, #f59e0b, #d97706); box-shadow: 0 0 12px rgba(245, 158, 11, 0.5);" onclick="window.game.buyPremiumMapRealMoney('${map.id}')">COMPRAR POR R$ 10,90 ⚡</button>`;
            } else {
                const canAfford = (this.totalCoins || 0) >= map.cost;
                const btnStyle = canAfford ? "" : "opacity: 0.5; filter: grayscale(1);";
                actionBtnHTML = `<button class="primary-btn" style="width: 100%; padding: 8px; font-size: 0.82rem; ${btnStyle}" onclick="window.game.buyMapWithCoins('${map.id}')">DESBLOQUEAR (${map.cost} 🪙)</button>`;
            }

            card.innerHTML = `
                <div>
                    <div class="map-header-row">
                        <span class="map-icon">${map.icon}</span>
                        <span class="map-badge ${isPremium ? "gold" : ""}">${map.badge}</span>
                    </div>
                    <div class="map-title">${map.name}</div>
                    <div class="map-subtitle">${map.subtitle}</div>
                    <div class="map-desc">${map.desc}</div>
                    <div class="map-perks-box">
                        <div class="map-perk-item">
                            <span class="map-perk-label">Bônus de Pontos:</span>
                            <span class="map-perk-val ${map.scoreMultiplier > 1 ? "gold" : ""}">x${map.scoreMultiplier.toFixed(2)}</span>
                        </div>
                        <div class="map-perk-item">
                            <span class="map-perk-label">Bônus de Moedas:</span>
                            <span class="map-perk-val ${map.coinMultiplier > 1 ? "gold" : ""}">x${map.coinMultiplier.toFixed(1)}</span>
                        </div>
                    </div>
                </div>
                <div style="margin-top: 6px;">
                    ${actionBtnHTML}
                </div>
            `;
            grid.appendChild(card);
        });
    }

    selectMap(mapId) {
        if (!this.unlockedMaps.includes(mapId)) return;
        this.selectedMap = mapId;
        localStorage.setItem("roadster_selected_map", mapId);
        this.updateMapBadge();
        this.renderMapsCards();
        if (typeof this.applyMapEnvironment === "function") {
            this.applyMapEnvironment(mapId);
        }
        const mapName = (typeof MAPS_CATALOG !== "undefined" && MAPS_CATALOG[mapId]) ? MAPS_CATALOG[mapId].name : mapId;
        this.triggerActionPopup(`🗺️ Pista Ativada: ${mapName}!`);
        if (this.sound) this.sound.playSpeedUp();
    }

    buyMapWithCoins(mapId) {
        const map = (typeof MAPS_CATALOG !== "undefined") ? MAPS_CATALOG[mapId] : null;
        if (!map) return;
        if ((this.totalCoins || 0) < map.cost) {
            this.triggerActionPopup("❌ Moedas insuficientes para desbloquear este circuito!");
            return;
        }

        this.totalCoins -= map.cost;
        localStorage.setItem("roadster_coins", this.totalCoins.toString());
        if (!this.unlockedMaps.includes(mapId)) {
            this.unlockedMaps.push(mapId);
            localStorage.setItem("roadster_unlocked_maps", JSON.stringify(this.unlockedMaps));
        }

        this.updateUserCoinsEverywhere();
        this.selectMap(mapId);
        this.triggerActionPopup(`🎉 Pista Desbloqueada: ${map.name}!`);
        this.speakAnnouncer("New Track Unlocked!", true);
    }

    buyPremiumMapRealMoney(mapId) {
        this.sound.init();
        const modal = document.getElementById("maps-modal");
        if (modal) modal.classList.remove("active");

        if (typeof window.PaymentSystem !== "undefined") {
            const ps = new window.PaymentSystem(typeof API_URL !== "undefined" ? API_URL : "");
            ps.checkoutPremiumMap(this.currentUser, () => {
                if (!this.unlockedMaps.includes("pista_premium")) {
                    this.unlockedMaps.push("pista_premium");
                    localStorage.setItem("roadster_unlocked_maps", JSON.stringify(this.unlockedMaps));
                }
                this.selectMap("pista_premium");
                this.triggerActionPopup("💎 PISTA PREMIUM DESBLOQUEADA COM SUCESSO!");
                this.speakAnnouncer("Super Speedway Unlocked!", true);
            }, (errMsg) => {
                this.triggerActionPopup(`⚠️ Falha no checkout: ${errMsg}`);
            });
        } else {
            this.openCoinShop();
            this.triggerActionPopup("⚡ Selecione o Pacote de R$ 10,90 para desbloquear a Pista Premium!");
        }
    }

    updateUserCoinsEverywhere() {
        if (this.hudCoins) this.hudCoins.textContent = (this.totalCoins + this.coinsEarnedThisRun).toLocaleString();
        if (this.menuCoins) this.menuCoins.textContent = this.totalCoins.toLocaleString();
        if (this.shopUserBalance) this.shopUserBalance.textContent = this.totalCoins.toLocaleString();
        const garageCoins = document.getElementById("garage-coins");
        if (garageCoins) garageCoins.textContent = this.totalCoins.toLocaleString();
    }


};
