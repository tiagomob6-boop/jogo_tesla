import { SoundSystem } from '../audio/SoundSystem.js';
import { LANES, GROUND_Y, FLIGHT_Y, GRAVITY, SLAM_FORCE, CAR_CATALOG, PILOT_CATALOG, COIN_PACKAGES, DAILY_MISSION_DEFS, API_URL } from './Config.js';
import { CarModelBuilder } from '../entities/CarModelBuilder.js';
import { EnvironmentBuilder } from '../entities/EnvironmentBuilder.js';
import { TrafficManager } from '../entities/TrafficManager.js';
import { ControlsManager } from '../systems/ControlsManager.js';
import { MultiplayerManager } from '../network/MultiplayerManager.js';
import { UIManager } from '../ui/UIManager.js';

class CoreGame {
    constructor() {
        // Configurações salvas (Volume SFX, Locutor Arcade, Vibração Háptica)
        let savedSettings = { sfxVolume: 100, announcer: true, announcerVolume: 90, haptics: true };
        try {
            const rawS = localStorage.getItem("roadster_settings");
            if (rawS) savedSettings = { ...savedSettings, ...JSON.parse(rawS) };
        } catch(e) {}
        this.settings = savedSettings;

        this.sound = new SoundSystem();
        this.sound.sfxVolume = (this.settings.sfxVolume || 100) / 100;
        this.canvas = document.getElementById("game-canvas");
        
        // HUD
        this.hudDistance = document.getElementById("hud-distance");
        this.hudSpeed = document.getElementById("hud-speed");
        this.hudLevel = document.getElementById("hud-level");
        this.hudSpeedTimer = document.getElementById("hud-speed-timer");
        this.hudCoins = document.getElementById("hud-coins");
        this.hudUsername = document.getElementById("hud-username");
        this.hudUserBadge = document.getElementById("hud-user-badge");
        this.hudScore = document.getElementById("hud-score");
        this.actionPopup = document.getElementById("action-popup");
        this.comboFeed = document.getElementById("combo-feed");
        this.streakLine = document.getElementById("streak-line");
        this.streak = 0;
        this.streakTimer = 0;
        this.rocketSubFill = document.getElementById("rocket-sub-fill");
        this.heartIcons = [
            document.getElementById("heart-1"),
            document.getElementById("heart-2"),
            document.getElementById("heart-3"),
            document.getElementById("heart-4"),
            document.getElementById("heart-5")
        ].filter(Boolean);
        
        // Segmentos de Ar (10 blocos)
        this.airSegments = document.querySelectorAll(".air-segment");
        this.airLitersEl = document.getElementById("air-liters");

        // Botões Mobile
        this.btnLeft = document.getElementById("btn-left");
        this.btnRight = document.getElementById("btn-right");
        this.btnSlam = document.getElementById("btn-slam");
        this.boostTouchBtn = document.getElementById("boost-touch-btn");

        this.damageFlash = document.getElementById("damage-flash");
        this.soundBtn = document.getElementById("sound-btn");
        this.pauseBtn = document.getElementById("pause-btn");

        // HUD & Piloto
        this.hudPilotBadge = document.getElementById("hud-pilot-badge");
        this.hudPilotName = document.getElementById("hud-pilot-name");
        this.hudShieldIndicator = document.getElementById("hud-shield-indicator");
        this.hudShieldTimer = document.getElementById("hud-shield-timer");
        this.hudShieldFill = document.getElementById("hud-shield-fill");

        // Mega Boost Indicator
        this.hudMegaBoostIndicator = document.getElementById("hud-megaboost-indicator");
        this.hudMegaBoostTimer = document.getElementById("hud-megaboost-timer");
        this.hudMegaBoostFill = document.getElementById("hud-megaboost-fill");

        // Magnet Indicator
        this.hudMagnetIndicator = document.getElementById("hud-magnet-indicator");
        this.hudMagnetTimer = document.getElementById("hud-magnet-timer");
        this.hudMagnetFill = document.getElementById("hud-magnet-fill");

        // Telas e Menus
        this.startScreen = document.getElementById("start-screen");
        this.gameoverScreen = document.getElementById("gameover-screen");
        this.startBtn = document.getElementById("start-btn");
        this.restartBtn = document.getElementById("restart-btn");
        this.menuCoins = document.getElementById("menu-coins");
        this.menuUsername = document.getElementById("menu-username");
        this.menuUserBadge = document.getElementById("menu-user-badge");
        this.menuPilotBadge = document.getElementById("menu-pilot-badge");
        this.menuPilotName = document.getElementById("menu-pilot-name");
        this.openGarageBtn = document.getElementById("open-garage-btn");
        this.openPilotBtn = document.getElementById("open-pilot-btn");
        this.openLeaderboardBtn = document.getElementById("open-leaderboard-btn");
        this.goGarageBtn = document.getElementById("go-garage-btn");
        this.goPilotBtn = document.getElementById("go-pilot-btn");
        this.goLeaderboardBtn = document.getElementById("go-leaderboard-btn");
        this.goScore = document.getElementById("go-score");
        this.goDist = document.getElementById("go-dist");
        this.goCoins = document.getElementById("go-coins");
        this.goBest = document.getElementById("go-best");
        this.goReason = document.getElementById("go-reason");

        // Modais
        this.userModal = document.getElementById("user-modal");
        this.usernameInput = document.getElementById("username-input");
        this.usernameStatus = document.getElementById("username-status");
        this.saveUsernameBtn = document.getElementById("save-username-btn");
        this.loginUsernameBtn = document.getElementById("login-username-btn");
        this.closeUserModalBtn = document.getElementById("close-user-modal-btn");

        this.garageModal = document.getElementById("garage-modal");
        this.garageCoinsVal = document.getElementById("garage-coins-val");
        this.garageCardsContainer = document.getElementById("garage-cards-container");
        this.closeGarageBtn = document.getElementById("close-garage-btn");

        this.pilotModal = document.getElementById("pilot-modal");
        this.pilotCardsContainer = document.getElementById("pilot-cards-container");
        this.closePilotBtn = document.getElementById("close-pilot-btn");
        this.modalActivePilot = document.getElementById("modal-active-pilot");
        this.modalPilotName = document.getElementById("modal-pilot-name");

        this.leaderboardModal = document.getElementById("leaderboard-modal");
        this.leaderboardListContainer = document.getElementById("leaderboard-list-container");
        this.closeLeaderboardBtn = document.getElementById("close-leaderboard-btn");

        // Modal de Missões Diárias
        this.missionsModal = document.getElementById("missions-modal");
        this.missionsListContainer = document.getElementById("missions-list-container");
        this.openMissionsBtn = document.getElementById("open-missions-btn");
        this.goMissionsBtn = document.getElementById("go-missions-btn");
        this.closeMissionsBtn = document.getElementById("close-missions-btn");

        // Modal de Pause e Configurações de Áudio
        this.pauseSettingsModal = document.getElementById("pause-settings-modal");
        this.pauseModalTitle = document.getElementById("pause-modal-title");
        this.sfxVolumeSlider = document.getElementById("sfx-volume-slider");
        this.sfxValLabel = document.getElementById("sfx-val-label");
        this.announcerToggleBtn = document.getElementById("announcer-toggle-btn");
        this.announcerVolumeSlider = document.getElementById("announcer-volume-slider");
        this.hapticsToggleBtn = document.getElementById("haptics-toggle-btn");
        this.resumeGameBtn = document.getElementById("resume-game-btn");
        this.restartFromPauseBtn = document.getElementById("restart-from-pause-btn");
        this.menuFromPauseBtn = document.getElementById("menu-from-pause-btn");
        this.openSettingsBtn = document.getElementById("open-settings-btn");
        this.goSettingsBtn = document.getElementById("go-settings-btn");

        // Estado do Jogo
        this.isRunning = false;
        this.isPaused = false;
        this.scoreDistance = 0;
        this.scorePoints = 0;
        this.coinsCollected = 0;
        this.coinsEarnedThisRun = 0;
        this.lives = 1;
        this.maxLives = 3;
        this.invulnerableTimer = 0;

        // Sistema de Escudo de Invencibilidade (5s)
        this.shieldTimer = 0;
        this.shieldMaxDuration = 5.0;
        this.shieldBubble = null;

        // Sistema de Mega Boost / Ar Infinito (4s)
        this.megaBoostTimer = 0;
        this.megaBoostMaxDuration = 4.0;

        // Sistema de Ímã Magnético de Moedas (8s)
        this.magnetTimer = 0;
        this.magnetMaxDuration = 8.0;

        // Ciclo Dia/Noite Synthwave
        this.currentNightFactor = 0;
        this.sunGroup = null;
        this.moonGroup = null;
        this.starField = null;

        // Referências UI Multiplayer
        this.hudMpBanner = document.getElementById("hud-mp-banner");
        this.mpDistP1 = document.getElementById("mp-dist-p1");
        this.mpDistP2 = document.getElementById("mp-dist-p2");
        this.mpNameP1 = document.getElementById("mp-name-p1");
        this.mpNameP2 = document.getElementById("mp-name-p2");
        this.mpGapLabel = document.getElementById("mp-gap-label");

        this.multiplayerModal = document.getElementById("multiplayer-modal");
        this.openMultiplayerBtn = document.getElementById("open-multiplayer-btn");
        this.closeMultiplayerBtn = document.getElementById("close-multiplayer-btn");
        this.mpQuickMatchBtn = document.getElementById("mp-quick-match-btn");
        this.mpCreateRoomBtn = document.getElementById("mp-create-room-btn");
        this.mpStartRoomBtn = document.getElementById("mp-start-room-btn");
        this.mpRoomInfoBox = document.getElementById("mp-room-info-box");
        this.mpRoomCodeLabel = document.getElementById("mp-room-code-label");
        this.mpRoomStatusLabel = document.getElementById("mp-room-status-label");
        this.mpJoinCodeInput = document.getElementById("mp-join-code-input");
        this.mpJoinRoomBtn = document.getElementById("mp-join-room-btn");
        this.mpOnlineStatus = document.getElementById("mp-online-status");
        this.mpStartLocalBtn = document.getElementById("mp-start-local-btn");
        this.mpStartAiBtn = document.getElementById("mp-start-ai-btn");

        this.mpFinishModal = document.getElementById("mp-finish-modal");
        this.mpFinishTitle = document.getElementById("mp-finish-title");
        this.mpFinishSubtitle = document.getElementById("mp-finish-subtitle");
        this.mpFinishDistP1 = document.getElementById("mp-finish-dist-p1");
        this.mpFinishDistP2 = document.getElementById("mp-finish-dist-p2");
        this.mpRewardBox = document.getElementById("mp-reward-box");
        this.mpPlayAgainBtn = document.getElementById("mp-play-again-btn");
        this.mpBackMenuBtn = document.getElementById("mp-back-menu-btn");

        // Estado do Multiplayer
        this.isMultiplayer = false;
        this.mpMode = null; // 'online' | 'local2p' | 'ai'
        this.mpWs = null;
        this.mpRoomCode = null;
        this.mpPlayerId = null;
        this.mpIsHost = false;
        this.mpRivalVehicle = null;
        this.mpRivalWheels = [];
        this.mpRivalTag = null;
        this.mpRivalData = {
            x: 3.8,
            y: GROUND_Y,
            dist: 0,
            speed: 78,
            isFlying: false,
            shield: false,
            crashed: false,
            name: 'Rival'
        };
        this.mpTelemetryTimer = 0;

        // Piloto 2 (Local Versus no Mesmo Teclado)
        this.p2 = {
            lane: 2,
            x: LANES[2],
            targetX: LANES[2],
            y: GROUND_Y,
            velocityY: 0,
            isFlying: false,
            isJumping: false,
            dist: 0,
            finalDist: 0,
            speed: 78,
            lives: 3,
            crashed: false,
            rollAngle: 0,
            shieldTimer: 0
        };
        this.p2Keys = { left: false, right: false, boost: false, slam: false };

        // Controle de Eliminação no Multiplayer (O sobrevivente continua correndo!)
        this.p1Crashed = false;
        this.p1FinalDist = 0;
        this.rivalCrashed = false;
        this.rivalFinalDist = 0;

        // Faróis Noturnos do Carro (Ativação Automática ao Escurecer)
        this.headlightsGroup = null;
        this.headlightBeams = [];
        this.headlightFlares = [];
        this.mpRivalHeadlightBeams = [];
        this.mpRivalHeadlightFlares = [];

        // Referências UI da Loja de Moedas & Mercado Pago
        this.coinShopModal = document.getElementById("coin-shop-modal");
        this.openCoinShopBtn = document.getElementById("open-coin-shop-btn");
        this.garageBuyCoinsBtn = document.getElementById("garage-buy-coins-btn");
        this.closeCoinShopBtn = document.getElementById("close-coin-shop-btn");
        this.shopUserCoins = document.getElementById("shop-user-coins");
        this.coinPackagesContainer = document.getElementById("coin-packages-container");

        this.mpPaymentModal = document.getElementById("mp-payment-modal");
        this.closePaymentModalBtn = document.getElementById("close-payment-modal-btn");
        this.payModalTitle = document.getElementById("pay-modal-title");
        this.payModalSubtitle = document.getElementById("pay-modal-subtitle");
        this.payPkgName = document.getElementById("pay-pkg-name");
        this.payPkgPrice = document.getElementById("pay-pkg-price");
        this.payPkgUsername = document.getElementById("pay-pkg-username");
        this.pixCopyPasteBox = document.getElementById("pix-copy-paste-box");
        this.copyPixBtn = document.getElementById("copy-pix-btn");
        this.payRedirectSection = document.getElementById("pay-redirect-section");
        this.payMercadoPagoLink = document.getElementById("pay-mercadopago-link");
        this.paySimulateBtn = document.getElementById("pay-simulate-btn");
        this.currentPendingPackage = null;

        // Sistema de Piloto Selecionado e Desbloqueios por Moedas
        this.selectedPilot = localStorage.getItem("roadster_selected_pilot") || "aria";
        let savedUnlockedPilots = ['aria'];
        try {
            const parsedPilots = JSON.parse(localStorage.getItem("roadster_unlocked_pilots") || "[\"aria\"]");
            if (Array.isArray(parsedPilots)) savedUnlockedPilots = parsedPilots;
        } catch(e) {}
        this.unlockedPilots = savedUnlockedPilots;
        this.activePilotPerks = (PILOT_CATALOG[this.selectedPilot] || PILOT_CATALOG.aria).perks || {};

        // Sistema de Velocidade a Cada 30 Segundos
        this.speedIntervalDuration = 30.0;
        this.speedIntervalTimer = 30.0;
        this.speedLevel = 1;

        // Perfil do Usuário e Economia
        this.currentUser = localStorage.getItem("roadster_user") || "Piloto";
        const savedAcc = this.loadAccountData(this.currentUser);
        this.totalCoins = savedAcc && typeof savedAcc.coins === 'number' ? savedAcc.coins : parseInt(localStorage.getItem("roadster_coins") || "0", 10);
        this.selectedCar = savedAcc && savedAcc.selectedCar ? savedAcc.selectedCar : (localStorage.getItem("roadster_selected_car") || "roadster");
        let savedUnlocked = ['roadster'];
        try {
            const parsed = savedAcc && savedAcc.unlockedCars ? savedAcc.unlockedCars : JSON.parse(localStorage.getItem("roadster_unlocked_cars") || "[\"roadster\"]");
            if (Array.isArray(parsed)) savedUnlocked = parsed;
        } catch(e) {}
        this.unlockedCars = savedUnlocked;
        this.upgrades = savedAcc && savedAcc.upgrades ? savedAcc.upgrades : { phantom_air: 0, cybertruck_armor: 0 };

        // SISTEMA DE AR (180 L BASE - 10 SEGMENTOS)
        this.maxAirLiters = 180;
        this.airLiters = 180;
        this.airDrainRate = 32.0;
        this.airRechargeRate = 26.0;
        this.isFlying = false;

        // Velocidade Aumentada (Alta Performance e Dificuldade Dinâmica)
        this.baseSpeed = 78.0;
        this.currentSpeed = this.baseSpeed;
        this.maxSpeed = 175.0;

        // Posição do Jogador
        this.currentLane = 1;
        this.playerX = LANES[this.currentLane];
        this.playerY = GROUND_Y;
        this.velocityY = 0;

        // Manobras Acrobáticas em Rampas
        this.isRampJumping = false;
        this.rampSpinProgress = 0;
        this.trickAwarded = false;

        // Entidades 3D
        this.trafficCars = [];
        this.ramps = [];
        this.skyObstacles = [];
        this.collectibles = [];
        this.smokeParticles = [];
        this.airPuffParticles = [];
        this.roadSegments = [];
        this.palmTrees = [];

        // Timers
        this.trafficSpawnTimer = 0;
        this.rampSpawnTimer = 3.5;
        this.skySpawnTimer = 0;
        this.collectibleSpawnTimer = 0;

        this.initDailyMissions();
        this.initThree();
        this.buildAtmosphericWorld();
        this.buildPlayerVehicle(this.selectedCar);
        this.initControls();
        this.initEventListeners();
        this.renderPilotCards();
        this.renderMissions();
        this.initUserData();
        this.initMultiplayer();
        this.initCoinShop();
    }

    // =================================================================
    // CENA THREE.JS COM ADAPTAÇÃO RESPONSIVA PARA CELULAR
    // =================================================================


    startGame() {
        this.startScreen.classList.remove("active");
        this.gameoverScreen.classList.remove("active");
        this.garageModal.classList.remove("active");
        this.leaderboardModal.classList.remove("active");
        this.userModal.classList.remove("active");
        if (this.pilotModal) this.pilotModal.classList.remove("active");
        if (this.missionsModal) this.missionsModal.classList.remove("active");
        if (this.pauseSettingsModal) this.pauseSettingsModal.classList.remove("active");

        this.isRunning = true;
        this.isPaused = false;
        this.scoreDistance = 0;
        this.scorePoints = 0;
        this.coinsCollected = 0;
        this.coinsEarnedThisRun = 0;
        this.invulnerableTimer = 0;
        this.shieldTimer = 0;
        this.shieldMaxDuration = 5.0;
        if (this.shieldBubble) this.shieldBubble.visible = false;
        if (this.hudShieldIndicator) this.hudShieldIndicator.style.display = "none";

        this.megaBoostTimer = 0;
        if (this.hudMegaBoostIndicator) this.hudMegaBoostIndicator.style.display = "none";
        if (this.hudMagnetIndicator) this.hudMagnetIndicator.style.display = "none";
        this.magnetTimer = 0;
        if (this.hudMagnetIndicator) this.hudMagnetIndicator.style.display = "none";
        this.initDailyMissions();

        // Carrega perks do piloto ativo
        this.activePilotPerks = (PILOT_CATALOG[this.selectedPilot] && PILOT_CATALOG[this.selectedPilot].perk) || PILOT_CATALOG.aria.perk;
        this.airRechargeRate = 18.0 * (this.activePilotPerks.airRechargeMult || 1.0);

        this.resetStreak();
        if (this.comboFeed) this.comboFeed.querySelectorAll(".combo-item").forEach(el => el.remove());
        
        // Atributos específicos do veículo equipado e Upgrades Comprados
        const armorLvl = (this.upgrades && this.upgrades.cybertruck_armor) || 0;
        if (this.selectedCar === 'cybertruck') {
            this.maxLives = 3 + armorLvl; // Base 2 + 1 (+ níveis extras de blindagem)
            this.lives = 2 + armorLvl; // Começa com 2 corações + blindagem
        } else {
            this.maxLives = 3;
            this.lives = 1;
        }

        const airLvl = (this.upgrades && this.upgrades.phantom_air) || 0;
        if (this.selectedCar === 'phantom') {
            this.maxAirLiters = 225 + (airLvl * 25);
            this.airLiters = this.maxAirLiters;
        } else {
            this.maxAirLiters = 180;
            this.airLiters = 180;
        }

        // Reset de Velocidade e Intervalo de 30 Segundos
        this.speedIntervalDuration = 30.0;
        this.speedIntervalTimer = this.speedIntervalDuration;
        this.speedLevel = 1;

        this.baseSpeed = (this.selectedCar === 'solaris') ? 88.0 : 78.0;
        this.currentSpeed = this.baseSpeed;
        this.maxSpeed = 175.0;

        if (!this.isMultiplayer) {
            if (this.hudMpBanner) this.hudMpBanner.style.display = "none";
            if (this.mpRivalVehicle) {
                this.scene.remove(this.mpRivalVehicle);
                this.mpRivalVehicle = null;
            }
            this.currentLane = 1;
            this.playerX = LANES[1];
        } else {
            if (this.hudMpBanner) this.hudMpBanner.style.display = "block";
            this.currentLane = 0;
            this.playerX = LANES[0];
        }
        this.playerY = GROUND_Y;
        this.velocityY = 0;
        this.isFlying = false;

        this.isRampJumping = false;
        this.rampSpinProgress = 0;
        this.trickAwarded = false;
        this.rampSpawnTimer = 3.5;

        this.trafficCars.forEach(car => this.scene.remove(car));
        this.trafficCars = [];
        this.ramps.forEach(ramp => this.scene.remove(ramp));
        this.ramps = [];
        this.skyObstacles.forEach(sky => this.scene.remove(sky));
        this.skyObstacles = [];
        this.collectibles.forEach(col => this.scene.remove(col));
        this.collectibles = [];
        this.smokeParticles.forEach(p => this.scene.remove(p));
        this.smokeParticles = [];
        this.airPuffParticles.forEach(p => this.scene.remove(p));
        this.airPuffParticles = [];

        this.updateHeartsUI();
        this.updateHUD();

        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.gameLoop(t));
    }



    gameOver(reason = "COLISÃO NO TRÁFEGO DA PONTE") {
        if (this.isMultiplayer) {
            if (!this.p1Crashed) {
                this.p1Crashed = true;
                this.p1FinalDist = Math.max(1, Math.floor(this.scoreDistance));
                this.sound.playCrash();
                this.flashDamage();
                this.triggerHaptic("crash");

                if (this.mpNameP1) {
                    const p1Label = (this.mpMode === 'local2p') ? "P1" : (this.currentUser || "Você");
                    this.mpNameP1.textContent = `${p1Label} 💥 (${this.p1FinalDist}m)`;
                }

                if (this.mpMode === "online" && this.mpWs && this.mpWs.readyState === WebSocket.OPEN) {
                    this.mpWs.send(JSON.stringify({ 
                        type: "player_crashed", 
                        dist: this.p1FinalDist, 
                        reason 
                    }));
                }

                const rivalAlreadyCrashed = (this.mpMode === 'local2p') ? this.p2.crashed : this.rivalCrashed;
                if (rivalAlreadyCrashed) {
                    this.finishDuel();
                    return;
                } else {
                    const rivalName = (this.mpMode === 'local2p') ? "PILOTO 2" : (this.mpRivalData.name || "RIVAL");
                    this.triggerActionPopup(`💥 VOCÊ BATEU AOS ${this.p1FinalDist}m! ${rivalName} CONTINUA!`);
                    this.speakAnnouncer("You crashed! Rival still racing!", true);
                    return;
                }
            }
            return;
        }

        this.isRunning = false;
        this.sound.stopEngine();
        this.sound.playCrash();
        this.sound.playGameOver();

        this.flashDamage();

        const finalScore = Math.floor(this.scorePoints);
        const finalDistance = Math.floor(this.scoreDistance);
        const earnedCoins = this.coinsEarnedThisRun;

        // Atualiza Moedas Locais
        this.totalCoins += earnedCoins;
        localStorage.setItem("roadster_coins", this.totalCoins.toString());

        const savedBest = parseInt(localStorage.getItem("roadster_dash_best") || "0", 10);
        const isNewBest = finalScore > savedBest;
        const newBest = Math.max(savedBest, finalScore);
        localStorage.setItem("roadster_dash_best", newBest.toString());

        this.triggerHaptic("crash");
        if (isNewBest && finalScore > 0) {
            this.speakAnnouncer("New High Score!", true);
        } else {
            this.speakAnnouncer("Game Over!", true);
        }
        if (this.hudMegaBoostIndicator) this.hudMegaBoostIndicator.style.display = "none";
        if (this.hudMagnetIndicator) this.hudMagnetIndicator.style.display = "none";

        this.goReason.textContent = reason;
        this.goScore.textContent = finalScore.toLocaleString();
        this.goDist.textContent = `${finalDistance} m`;
        this.goBest.textContent = newBest.toLocaleString();
        if (this.goCoins) this.goCoins.textContent = `+${earnedCoins} 🪙`;

        const totalDisplay = document.getElementById("go-total-coins");
        if (totalDisplay) totalDisplay.textContent = this.totalCoins.toLocaleString();

        // Envia para o banco de dados (Neon DB via API REST)
        this.submitRunScore(finalScore, finalDistance, earnedCoins);

        setTimeout(() => {
            this.gameoverScreen.classList.add("active");
        }, 400);
    }

    // =================================================================
    // MÉTODOS DE INTEGRAÇÃO COM BACKEND / BANCO DE DADOS NEON
    // =================================================================
    async apiCall(endpoint, method = "GET", body = null) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 6000);
            const options = {
                method,
                headers: { "Content-Type": "application/json" },
                signal: controller.signal
            };
            if (body) options.body = JSON.stringify(body);
            const res = await fetch(`${API_URL}${endpoint}`, options);
            clearTimeout(timeoutId);
            if (!res.ok) throw new Error("HTTP " + res.status);
            return await res.json();
        } catch (err) {
            return null;
        }
    }



    flashDamage() {
        this.damageFlash.style.opacity = "1";
        setTimeout(() => {
            this.damageFlash.style.opacity = "0";
        }, 260);
    }



    addHeart() {
        if (this.lives < this.maxLives) {
            this.lives++;
            this.sound.playHeart();
            this.updateHeartsUI();
            this.triggerActionPopup("+1 VIDA!");
        }
    }



    activateShield(duration = 5.0) {
        const bonus = (this.activePilotPerks && this.activePilotPerks.shieldBonusDuration) || 0;
        this.shieldMaxDuration = duration + bonus;
        this.shieldTimer = this.shieldMaxDuration;
        if (this.shieldBubble) {
            this.shieldBubble.visible = true;
            this.shieldBubble.material.opacity = 0.55;
        }
        if (this.hudShieldIndicator) {
            this.hudShieldIndicator.style.display = "inline-flex";
            if (this.hudShieldTimer) this.hudShieldTimer.textContent = `${this.shieldMaxDuration.toFixed(1)}s`;
            if (this.hudShieldFill) this.hudShieldFill.style.width = "100%";
        }
        this.sound.playShield();
        this.speakAnnouncer("Shield Online!", true);
        this.triggerHaptic("shield");
        this.triggerActionPopup(`🛡️ ESCUDO COLMEIA 3D (${this.shieldMaxDuration.toFixed(0)}s)!`);
    }



    activateMegaBoost(duration = 4.0) {
        this.megaBoostMaxDuration = duration;
        this.megaBoostTimer = duration;
        this.isFlying = true;
        this.airLiters = this.maxAirLiters;
        if (this.hudMegaBoostIndicator) {
            this.hudMegaBoostIndicator.style.display = "inline-flex";
            if (this.hudMegaBoostTimer) this.hudMegaBoostTimer.textContent = `${this.megaBoostTimer.toFixed(1)}s`;
            if (this.hudMegaBoostFill) this.hudMegaBoostFill.style.width = "100%";
        }
        this.sound.playMegaBoost();
        this.speakAnnouncer("Mega Boost!", true);
        this.triggerHaptic("megaboost");
        this.triggerActionPopup(`⚡ MEGA BOOST: AR INFINITO (${duration}s)!`);
    }



    activateMagnet(duration = 8.0) {
        this.magnetMaxDuration = duration;
        this.magnetTimer = duration;
        if (this.hudMagnetIndicator) {
            this.hudMagnetIndicator.style.display = "inline-flex";
            if (this.hudMagnetTimer) this.hudMagnetTimer.textContent = `${duration.toFixed(1)}s`;
            if (this.hudMagnetFill) this.hudMagnetFill.style.width = "100%";
        }
        this.sound.playMissionComplete();
        this.speakAnnouncer("Coin Magnet Online!", true);
        this.triggerHaptic("megaboost");
        this.triggerActionPopup(`🧲 ÍMÃ DE MOEDAS ATIVO (${duration}s)!`);
    }

    // =================================================================
    // FEEDBACK HÁPTICO (VIBRAÇÃO EM SMARTPHONES VIA WEB VIBRATION API)
    // =================================================================


    takeDamage(reason) {
        // Escudo Protetor absorve qualquer impacto ou colisão
        if (this.shieldTimer > 0) return;
        if (this.invulnerableTimer > 0) return;

        this.lives--;
        this.sound.playCrash();
        this.flashDamage();
        this.triggerHaptic("hit");
        this.updateHeartsUI();
        this.resetStreak();

        if (this.lives <= 0) {
            this.gameOver(reason);
        } else {
            this.invulnerableTimer = (this.activePilotPerks && this.activePilotPerks.invulnDuration) || 1.8;
        }
    }



    updateHeartsUI() {
        this.heartIcons.forEach((icon, index) => {
            if (index < this.maxLives) {
                icon.style.display = "inline-block";
            } else {
                icon.style.display = "none";
            }
            if (index < this.lives) {
                icon.classList.remove("empty");
            } else {
                icon.classList.add("empty");
            }
        });
    }

    // =================================================================
    // LOOP DO JOGO E FÍSICA
    // =================================================================


    gameLoop(currentTime) {
        if (!this.isRunning || this.isPaused) return;

        const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.05);
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.renderer.render(this.scene, this.camera);

        requestAnimationFrame((t) => this.gameLoop(t));
    }



    update(delta) {
        // Sistema de Aumento de Velocidade a Cada 30 Segundos
        this.speedIntervalTimer -= delta;
        if (this.speedIntervalTimer <= 0) {
            this.speedLevel++;
            this.speedIntervalTimer = this.speedIntervalDuration;
            this.baseSpeed += 12.0;
            this.currentSpeed += 12.0;
            this.maxSpeed += 15.0;
            this.sound.playSpeedUp();
            this.triggerActionPopup(`⚡ SPEED UP! NÍVEL ${this.speedLevel}`);
            this.speakAnnouncer("Speed Level Up!", true);
            this.triggerHaptic("speedup");
            this.trackMissionProgress('speed_level', this.speedLevel);
        }

        // Ciclo Dia/Noite Synthwave Dinâmico (Sunset to Midnight)
        this.updateDayNightCycle(delta);

        // Gerenciamento do Item Raro Mega Boost (Ar Infinito e Hiper-Aceleração)
        if (this.megaBoostTimer > 0) {
            this.megaBoostTimer -= delta;
            this.isFlying = true;
            this.airLiters = this.maxAirLiters; // Não consome ar durante o Mega Boost!
            if (this.hudMegaBoostIndicator) {
                this.hudMegaBoostIndicator.style.display = "inline-flex";
                if (this.hudMegaBoostTimer) this.hudMegaBoostTimer.textContent = `${this.megaBoostTimer.toFixed(1)}s`;
                if (this.hudMegaBoostFill) {
                    const pct = Math.max(0, (this.megaBoostTimer / this.megaBoostMaxDuration) * 100);
                    this.hudMegaBoostFill.style.width = `${pct}%`;
                }
            }
            if (this.megaBoostTimer <= 0) {
                this.megaBoostTimer = 0;
                if (this.hudMegaBoostIndicator) this.hudMegaBoostIndicator.style.display = "none";
        if (this.hudMagnetIndicator) this.hudMagnetIndicator.style.display = "none";
            }
        }

        // Gerenciamento do Ímã Magnético de Moedas Ativo (8s)
        if (this.magnetTimer > 0) {
            this.magnetTimer -= delta;
            if (this.hudMagnetIndicator) {
                this.hudMagnetIndicator.style.display = "inline-flex";
                if (this.hudMagnetTimer) this.hudMagnetTimer.textContent = `${this.magnetTimer.toFixed(1)}s`;
                if (this.hudMagnetFill) {
                    const pct = Math.max(0, (this.magnetTimer / this.magnetMaxDuration) * 100);
                    this.hudMagnetFill.style.width = `${pct}%`;
                }
            }
            if (this.magnetTimer <= 0) {
                this.magnetTimer = 0;
                if (this.hudMagnetIndicator) this.hudMagnetIndicator.style.display = "none";
            }
        }

        // Progressão de Velocidade Acelerada e Intensa
        this.currentSpeed = Math.min(this.maxSpeed, this.baseSpeed + (this.scoreDistance * 0.024));
        this.scoreDistance += this.currentSpeed * delta;

        const scoreMult = (this.selectedCar === 'solaris') ? 2.4 : 1.8;
        this.scorePoints += (this.currentSpeed * scoreMult) * delta;

        this.sound.updateEngine(this.currentSpeed, this.isFlying);

        // 1. GERENCIAMENTO DA BARRA DE AR (10 SEGMENTOS)
        if (this.isFlying) {
            if (this.megaBoostTimer <= 0) {
                this.airLiters -= this.airDrainRate * delta;
                if (this.airLiters <= 0) {
                    this.airLiters = 0;
                    this.isFlying = false;
                    this.triggerActionPopup("AR ESGOTADO!");
                }
            }
        } else {
            if (this.airLiters < this.maxAirLiters) {
                this.airLiters = Math.min(this.maxAirLiters, this.airLiters + this.airRechargeRate * delta);
            }
        }

        // Atualizar segmentos da barra de ar (10 blocos)
        const activeSegments = Math.round((this.airLiters / this.maxAirLiters) * 10);
        this.airSegments.forEach((seg, idx) => {
            if (idx < activeSegments) {
                seg.classList.remove("depleted");
            } else {
                seg.classList.add("depleted");
            }
        });
        this.airLitersEl.textContent = `${Math.floor(this.airLiters)} L`;

        // 2. Nuvem cônica de fumaça branca na traseira
        this.emitRearSmokeCloud();

        // 3. Deslocamento contínuo da rodovia e palmeiras
        const moveDist = this.currentSpeed * delta;
        this.roadSegments.forEach(seg => {
            seg.position.z += moveDist;
            if (seg.position.z > 40) {
                seg.position.z -= 70 * this.roadSegments.length;
            }
        });

        this.palmTrees.forEach(p => {
            p.position.z += moveDist;
            if (p.position.z > 30) {
                p.position.z -= 28 * 22;
            }
        });

        // Metrópole de arranha-céus à direita com efeito de parallax
        if (this.buildings) {
            const cityMove = this.currentSpeed * delta * 0.42;
            this.buildings.forEach(b => {
                b.position.z += cityMove;
                if (b.position.z > 80) {
                    b.position.z -= 530;
                }
            });
        }

        // 4. Movimentação do Carro na Faixa X
        const targetX = LANES[this.currentLane];
        const dx = targetX - this.playerX;
        const expLerp = 1.0 - Math.pow(0.0001, delta);
        this.playerX += dx * expLerp;
        this.truckGroup.position.x = this.playerX;

        // Inclinação lateral ao esterçar (Roll / Pitch)
        const maxTilt = this.isFlying ? -0.16 : -0.06;
        const tiltZ = dx * maxTilt;
        if (!this.isRampJumping) {
            this.truckGroup.rotation.z = THREE.MathUtils.lerp(this.truckGroup.rotation.z, tiltZ, 0.22);
        }
        this.truckGroup.rotation.y = dx * 0.035;

        // 5. ATUALIZAÇÃO E FÍSICA DAS RAMPAS
        let onRampThisFrame = false;
        for (let i = this.ramps.length - 1; i >= 0; i--) {
            const ramp = this.ramps[i];
            ramp.position.z += this.currentSpeed * delta;

            // Animação pulsante nas setas neon da rampa
            if (ramp.chevrons) {
                const pulse = (Math.sin(performance.now() * 0.01) + 1) * 0.5;
                ramp.chevrons.forEach(ch => {
                    ch.material.opacity = 0.65 + pulse * 0.35;
                });
            }

            // Checa alinhamento com a faixa da rampa
            const distToRampX = Math.abs(this.truckGroup.position.x - ramp.position.x);
            if (distToRampX < ramp.halfW) {
                const relZ = 0 - ramp.position.z;

                // Se o carro está sobre o comprimento da rampa
                if (relZ <= ramp.halfL && relZ >= -ramp.halfL) {
                    const progress = (ramp.halfL - relZ) / (2 * ramp.halfL);
                    const surfaceY = GROUND_Y + (progress * ramp.rampHeight);

                    if (!this.isFlying && this.playerY <= surfaceY + 0.75) {
                        this.playerY = surfaceY;
                        this.truckGroup.position.y = this.playerY;
                        this.truckGroup.rotation.x = -0.22;
                        ramp.hasContact = true;
                        onRampThisFrame = true;
                    }
                } else if (ramp.hasContact && relZ < -ramp.halfL && relZ > -ramp.halfL - 3.5) {
                    // DECOLAGEM NA CRISTA DA RAMPA!
                    ramp.hasContact = false;
                    if (!this.isFlying && !this.isRampJumping) {
                        this.isRampJumping = true;
                        this.rampSpinProgress = 0;
                        this.trickAwarded = false;
                        this.velocityY = 25.0 + (this.currentSpeed - this.baseSpeed) * 0.09;
                        this.sound.playRampLaunch();
                        this.addScoreEvent("RAMP LAUNCH", 300);
                    }
                }
            }

            if (ramp.position.z > 35) {
                this.scene.remove(ramp);
                this.ramps.splice(i, 1);
            }
        }

        // 6. ALTURA Y E ACROBACIAS AÉREAS (BARREL ROLL)
        if (this.isFlying) {
            this.playerY += (FLIGHT_Y - this.playerY) * (9.0 * delta);
            this.truckGroup.position.y = this.playerY;
        } else if (onRampThisFrame) {
            // Altura já cravada na superfície da rampa
        } else if (this.isRampJumping) {
            this.velocityY += GRAVITY * delta;
            this.playerY += this.velocityY * delta;

            // Giro acrobático 360° no ar (Barrel Roll do Roadster)
            this.rampSpinProgress += delta * 8.6;
            if (this.rampSpinProgress < Math.PI * 2) {
                this.truckGroup.rotation.z = this.rampSpinProgress;
            } else {
                this.truckGroup.rotation.z = 0;
                if (!this.trickAwarded) {
                    this.trickAwarded = true;
                    this.addScoreEvent("BARREL ROLL", 180);
                    this.sound.playTrickScore();
                    this.triggerHaptic("ramp");
                    this.trackMissionProgress('stunt', 1);
                }
            }
            this.truckGroup.rotation.x = -this.velocityY * 0.015;

            // Aterrissagem com bônus de ar e pontuação perfeita
       
            if (this.playerY <= GROUND_Y) {
                this.playerY = GROUND_Y;
                this.velocityY = 0;
                this.truckGroup.rotation.x = 0;
                this.truckGroup.rotation.z = 0;
                this.isRampJumping = false;
                this.addScoreEvent("PERFECT LANDING", 400, true);
                this.sound.playCoin();
                this.sound.playSlam();
                this.airLiters = Math.min(this.maxAirLiters, this.airLiters + 35);
            }
            this.truckGroup.position.y = this.playerY;
        } else {
            if (this.playerY > GROUND_Y) {
                this.velocityY += GRAVITY * delta;
                this.playerY += this.velocityY * delta;
                if (this.playerY <= GROUND_Y) {
                    this.playerY = GROUND_Y;
                    this.velocityY = 0;
                    this.truckGroup.rotation.x = 0;
                } else {
                    this.truckGroup.rotation.x = -this.velocityY * 0.02;
                }
            } else {
                this.playerY += (GROUND_Y - this.playerY) * (14.0 * delta);
            }
            this.truckGroup.position.y = this.playerY;
        }

        // Atualiza posição e intensidade da sombra de contato do carro
        if (this.playerShadow) {
            this.playerShadow.position.x = this.truckGroup.position.x;
            this.playerShadow.position.z = this.truckGroup.position.z;
            const heightAboveGround = Math.max(0, this.playerY - GROUND_Y);
            const altitudeFactor = Math.max(0, 1.0 - heightAboveGround / 4.5);
            this.playerShadow.material.opacity = 0.58 * altitudeFactor;
            const shadowScale = Math.max(0.4, 1.0 - heightAboveGround * 0.12);
            this.playerShadow.scale.set(shadowScale, shadowScale, 1);
        }

        // Rotação das rodas proporcional à alta velocidade
        const wheelRotation = (this.currentSpeed * delta) / 0.42;
        this.wheels.forEach(w => w.rotation.x -= wheelRotation);

        // Chamas dos escapes tremulando (Solaris) e pulso do neon (Phantom)
        if (this.exhaustFlames) {
            const boost = this.isFlying ? 1.6 : 1.0;
            this.exhaustFlames.forEach(f => {
                const sc = f.userData.base * boost * (0.75 + Math.random() * 0.5);
                f.scale.set(sc, sc, 1);
            });
        }
        if (this.underglow) {
            this.underglow.material.opacity = 0.45 + Math.sin(performance.now() * 0.006) * 0.15;
            this.underglow.visible = this.playerY < GROUND_Y + 1.5;
        }

        // Streak expira se o jogador ficar muito tempo sem pontuar
        if (this.streakTimer > 0) {
            this.streakTimer -= delta;
            if (this.streakTimer <= 0) this.resetStreak();
        }

        if (this.invulnerableTimer > 0) {
            this.invulnerableTimer -= delta;
            const isVis = Math.floor(performance.now() / 80) % 2 === 0;
            this.truckGroup.visible = isVis;
            if (this.playerShadow) this.playerShadow.visible = isVis;
        } else {
            this.truckGroup.visible = true;
            if (this.playerShadow) this.playerShadow.visible = true;
        }

        // Atualização e Contagem do Escudo de Invencibilidade (Colmeia 3D)
        if (this.shieldTimer > 0) {
            this.shieldTimer -= delta;
            if (this.shieldBubble) {
                this.shieldBubble.visible = true;
                this.shieldBubble.rotation.y += 0.85 * delta;
                if (this._honeycombTex) {
                    this._honeycombTex.offset.x += 0.14 * delta;
                    this._honeycombTex.offset.y += 0.07 * delta;
                }
                if (this.shieldTimer < 1.5) {
                    const blink = Math.floor(performance.now() / 90) % 2 === 0;
                    this.shieldBubble.material.opacity = blink ? 0.65 : 0.25;
                } else {
                    this.shieldBubble.material.opacity = 0.52 + Math.sin(performance.now() * 0.007) * 0.05;
                }
            }
            if (this.hudShieldIndicator) {
                this.hudShieldIndicator.style.display = "inline-flex";
                if (this.hudShieldTimer) this.hudShieldTimer.textContent = `${this.shieldTimer.toFixed(1)}s`;
                if (this.hudShieldFill) {
                    const pct = Math.max(0, (this.shieldTimer / this.shieldMaxDuration) * 100);
                    this.hudShieldFill.style.width = `${pct}%`;
                }
            }
            if (this.shieldTimer <= 0) {
                this.shieldTimer = 0;
                if (this.shieldBubble) this.shieldBubble.visible = false;
                if (this.hudShieldIndicator) this.hudShieldIndicator.style.display = "none";
            }
        }

        // 7. SPAWNERS DINÂMICOS COM DIFICULDADE CRESCENTE
        this.trafficSpawnTimer -= delta;
        if (this.trafficSpawnTimer <= 0) {
            this.spawnTrafficCar();
            this.trafficSpawnTimer = Math.max(0.65, 1.8 - (this.scoreDistance * 0.0006));
        }

        this.rampSpawnTimer -= delta;
        if (this.rampSpawnTimer <= 0) {
            this.spawnRamp();
            this.rampSpawnTimer = Math.random() * 3.5 + 4.5;
        }

        this.skySpawnTimer -= delta;
        if (this.skySpawnTimer <= 0) {
            this.spawnSkyObstacle();
            this.skySpawnTimer = Math.random() * 1.2 + 1.8;
        }

        this.collectibleSpawnTimer -= delta;
        if (this.collectibleSpawnTimer <= 0) {
            this.spawnCollectible();
            this.collectibleSpawnTimer = 0.85;
        }

        // 8. Atualizar Tráfego Terrestre
        for (let i = this.trafficCars.length - 1; i >= 0; i--) {
            const car = this.trafficCars[i];

            // Carros arremessados pelo Escudo (Shield Smash)
            if (car.isSmashed) {
                car.position.x += car.smashVelocity.x * delta;
                car.position.y += car.smashVelocity.y * delta;
                car.position.z += car.smashVelocity.z * delta;
                car.rotation.x += car.smashRot.x * delta;
                car.rotation.y += car.smashRot.y * delta;
                car.rotation.z += car.smashRot.z * delta;
                if (car.position.z > 35 || car.position.y > 40 || Math.abs(car.position.x) > 25) {
                    this.scene.remove(car);
                    this.trafficCars.splice(i, 1);
                }
                continue;
            }

            car.position.z += (this.currentSpeed + car.trafficSpeed) * delta;

            // IA ANTICOLISÃO E BLOQUEIO FÍSICO COM RAMPAS (Carros NUNCA atravessam rampas!)
            for (const ramp of this.ramps) {
                const latDist = Math.abs(car.position.x - ramp.position.x);
                const relZ = ramp.position.z - car.position.z;

                // Se a rampa estiver na mesma faixa e à frente do carro: IA desvia para outra faixa
                if (latDist < 1.4 && relZ > 0 && relZ < 50.0) {
                    if (car.targetLaneX === undefined || Math.abs(car.targetLaneX - ramp.position.x) < 0.5) {
                        const altLanes = LANES.filter(lx => Math.abs(lx - ramp.position.x) > 1.4);
                        if (altLanes.length > 0) {
                            altLanes.sort((a, b) => Math.abs(a - car.position.x) - Math.abs(b - car.position.x));
                            car.targetLaneX = altLanes[0];
                        }
                    }
                }

                // Barreira Física Impenetrável: se o carro tocar na rampa, é repelido imediatamente
                const currRelZ = Math.abs(car.position.z - ramp.position.z);
                if (latDist < ramp.halfW + 0.6 && currRelZ < ramp.halfL + 1.2) {
                    const pushDir = car.position.x >= ramp.position.x ? 1 : -1;
                    car.position.x = ramp.position.x + (ramp.halfW + 0.75) * pushDir;
                }
            }

            // Interpolação de desvio da IA
            if (car.targetLaneX !== undefined) {
                car.position.x += (car.targetLaneX - car.position.x) * Math.min(1.0, 5.0 * delta);
                if (Math.abs(car.position.x - car.targetLaneX) < 0.05) {
                    car.position.x = car.targetLaneX;
                    delete car.targetLaneX;
                }
            }

            // COLISÃO COM O CARRO DO JOGADOR
            const distToCarX = Math.abs(this.truckGroup.position.x - car.position.x);
            const distToCarZ = Math.abs(this.truckGroup.position.z - car.position.z);

            // Se o jogador estiver com Escudo Ativo: DESTRÓI E ARREMESSA O CARRO DO TRÂNSITO!
            if (this.shieldTimer > 0) {
                if (distToCarX < 2.0 && distToCarZ < 3.8) {
                    this.smashTrafficCar(car);
                    continue;
                }
            } else if (this.invulnerableTimer <= 0 && this.playerY < car.boxHeight) {
                // Se estiver em salto alto de rampa ou voando, o carro pula por cima do tráfego sem colidir!
                if (distToCarX < 1.7 && distToCarZ < 3.4) {
                    this.takeDamage("COLISÃO COM VEÍCULO NO TRÁFEGO");
                }
            }

            // NEAR MISS: passou raspando na faixa ao lado sem bater
            if (!car.passed && car.position.z > this.truckGroup.position.z + 2.0) {
                car.passed = true;
                const dX = Math.abs(this.truckGroup.position.x - car.position.x);
                if (this.invulnerableTimer <= 0 && !this.isFlying && this.playerY < car.boxHeight + 0.5 && dX >= 1.7 && dX < 4.3) {
                    const pts = (this.activePilotPerks && this.activePilotPerks.nearMissBonus) || 75;
                    this.addScoreEvent("NEAR MISS", pts);
                    this.speakAnnouncer("Near Miss!");
                    this.triggerHaptic("nearmiss");
                    this.trackMissionProgress('near_miss', 1);
                    if (this.activePilotPerks && this.activePilotPerks.nearMissAir) {
                        this.airLiters = Math.min(this.maxAirLiters, this.airLiters + this.activePilotPerks.nearMissAir);
                    }
                }
            }

            if (car.position.z > 30) {
                this.scene.remove(car);
                this.trafficCars.splice(i, 1);
            }
        }

        // 9. Atualizar Obstáculos Aéreos
        for (let i = this.skyObstacles.length - 1; i >= 0; i--) {
            const sky = this.skyObstacles[i];
            sky.position.z += (this.currentSpeed + sky.flySpeed) * delta;

            if (sky.obstacleType === "birds" && sky.wings) {
                const flap = Math.sin(performance.now() * 0.015) * 0.5;
                sky.wings.forEach(w => w.rotation.z = flap);
            }

            if (this.invulnerableTimer <= 0 && this.playerY > 2.5) {
                const distZ = Math.abs(this.truckGroup.position.z - sky.position.z);
                const distY = Math.abs(this.playerY - sky.position.y);
                
                if (sky.obstacleType === "powerlines") {
                    if (distZ < 1.2 && distY < 1.2) {
                        this.sound.playZap();
                        this.takeDamage("CHOQUE NOS FIOS DE ALTA TENSÃO");
                    }
                } else {
                    const distX = Math.abs(this.truckGroup.position.x - sky.position.x);
                    const hitDistX = sky.obstacleType === "plane" ? 3.0 : 1.5;
                    if (distX < hitDistX && distZ < 2.5 && distY < 1.6) {
                        const reason = sky.obstacleType === "plane" ? "COLISÃO COM AERONAVE NO CÉU" : "COLISÃO COM BANDO DE PÁSSAROS";
                        this.takeDamage(reason);
                    }
                }
            }

            if (sky.position.z > 30) {
                this.scene.remove(sky);
                this.skyObstacles.splice(i, 1);
            }
        }

        // 10. Atualizar Coletáveis
        for (let i = this.collectibles.length - 1; i >= 0; i--) {
            const item = this.collectibles[i];
            item.position.z += this.currentSpeed * delta;

            // Ímã Magnético de Moedas (Pelo item coletado ou habilidade passiva da pilota Luna)
            const isMagnetActive = (this.magnetTimer > 0);
            const lunaMagnetRange = (this.activePilotPerks && this.activePilotPerks.coinMagnetRange);
            if ((isMagnetActive || lunaMagnetRange) && item.itemType === "coin") {
                const magRange = isMagnetActive ? 18.0 : (lunaMagnetRange || 8.5);
                const pPos = this.truckGroup.position;
                const d3 = pPos.distanceTo(item.position);
                if (d3 < magRange) {
                    item.position.x += (pPos.x - item.position.x) * Math.min(1.0, 10.5 * delta);
                    item.position.y += (pPos.y - item.position.y) * Math.min(1.0, 10.5 * delta);
                    item.position.z += (pPos.z - item.position.z) * Math.min(1.0, 10.5 * delta);
                }
            }

            if (item.itemType === "coin") {
                // Rotação no próprio eixo Z (face redonda fica SEMPRE 100% voltada ao jogador, nunca vira palito!)
                item.rotation.z += 2.6 * delta;

                // Pulsação suave do halo de brilho dourado
                if (item.glowSprite) {
                    const pulse = 1.6 + Math.sin(performance.now() * 0.008 + item.position.z * 0.05) * 0.28;
                    item.glowSprite.scale.set(pulse, pulse, 1);
                }

                // Flutuação vertical elegante (hover bobbing)
                if (item.baseY !== undefined) {
                    item.position.y = item.baseY + Math.sin(performance.now() * 0.004 + item.position.z * 0.15) * 0.14;
                }
            } else if (item.itemType === "shield") {
                item.rotation.y += 2.8 * delta;
                if (item.ring) item.ring.rotation.z += 3.2 * delta;
            } else if (item.itemType === "magnet") {
                item.rotation.y += 3.2 * delta;
                if (item.fluxRing) {
                    item.fluxRing.rotation.z += 4.5 * delta;
                    item.fluxRing.rotation.x += 2.0 * delta;
                }
            } else if (item.itemType === "megaboost") {
                item.rotation.y += 2.8 * delta;
                if (item.ring1) item.ring1.rotation.x += 3.5 * delta;
                if (item.ring2) item.ring2.rotation.y += 3.5 * delta;
            } else {
                item.rotation.y += 2.5 * delta;
            }

            const dist = this.truckGroup.position.distanceTo(item.position);
            if (dist < 2.4) {
                if (item.itemType === "coin") {
                    const bonus = (this.activePilotPerks && this.activePilotPerks.coinBonusMult) || 1.0;
                    const coinEarned = Math.max(1, Math.round(1 * bonus));
                    this.coinsCollected++;
                    this.coinsEarnedThisRun += coinEarned;
                    this.addScoreEvent("COIN", 150);
                    this.sound.playCoin();
                    this.triggerHaptic("coin");
                    this.trackMissionProgress('coins', coinEarned);
                } else if (item.itemType === "heart") {
                    this.addHeart();
                } else if (item.itemType === "shield") {
                    this.activateShield(5.0);
                    this.addScoreEvent("SHIELD ONLINE", 250);
                } else if (item.itemType === "magnet") {
                    this.activateMagnet(8.0);
                    this.addScoreEvent("MAGNET ONLINE", 300, true);
                } else if (item.itemType === "megaboost") {
                    this.activateMegaBoost(4.0);
                    this.addScoreEvent("MEGA BOOST", 350, true);
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

        // 11. Atualizar Partículas de Fumaça Traseira
        for (let i = this.smokeParticles.length - 1; i >= 0; i--) {
            const p = this.smokeParticles[i];
            p.position.addScaledVector(p.velocity, delta);
            p.life -= delta;
            const grow = delta * (p.growth || 2.8);
            p.scale.x += grow;
            p.scale.y += grow;
            // aparece rápido e some suavemente
            const t = 1 - Math.max(0, p.life) / p.maxLife;
            p.material.opacity = (p.baseOpacity || 0.3) * Math.min(1, t * 6) * (1 - t);

            if (p.life <= 0) {
                this.scene.remove(p);
                p.material.dispose();
                this.smokeParticles.splice(i, 1);
            }
        }

        // Partículas de ar lateral
        for (let i = this.airPuffParticles.length - 1; i >= 0; i--) {
            const p = this.airPuffParticles[i];
            p.position.addScaledVector(p.velocity, delta);
            p.life -= delta;
            p.material.opacity = (p.life / p.maxLife) * 0.8;

            if (p.life <= 0) {
                this.scene.remove(p);
                this.airPuffParticles.splice(i, 1);
            }
        }

        // 12. Câmera Adaptativa com Efeito de Alta Velocidade (FOV Dinâmico)
        const isPortrait = window.innerHeight > window.innerWidth;
        const camFollowX = isPortrait ? 0.32 : 0.42;
        const camFollowY = isPortrait ? (this.isFlying ? 7.8 : 4.8) : (this.isFlying ? 7.6 : 4.2);

        const speedRatio = Math.min(1.0, (this.currentSpeed - this.baseSpeed) / (this.maxSpeed - this.baseSpeed));
        const baseFov = isPortrait ? 75 : 60;
        this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, baseFov + speedRatio * 14, 0.08);
        this.camera.updateProjectionMatrix();

        let targetCamX = this.playerX * camFollowX;
        let targetCamLookX = this.playerX * 0.15;
        let targetCamLookY = this.playerY + 0.8;

        if (this.isMultiplayer && this.p1Crashed && this.mpRivalVehicle) {
            targetCamX = this.mpRivalVehicle.position.x * camFollowX;
            targetCamLookX = this.mpRivalVehicle.position.x * 0.15;
            targetCamLookY = this.mpRivalVehicle.position.y + 0.8;
        }

        this.camera.position.x += (targetCamX - this.camera.position.x) * (7.5 * delta);
        this.camera.position.y += (camFollowY - this.camera.position.y) * (5.5 * delta);
        this.camera.lookAt(targetCamLookX, targetCamLookY, -12);

        if (this.isMultiplayer) {
            this.updateMultiplayer(delta);
        }

        this.updateHUD();
    }



    updateHUD() {
        this.hudDistance.textContent = `${Math.floor(this.scoreDistance)} m`;
        this.hudScore.textContent = Math.floor(this.scorePoints).toLocaleString();
        if (this.hudSpeed) {
            const speedKmH = Math.floor(this.currentSpeed * 1.6);
            this.hudSpeed.textContent = `${speedKmH} KM/H`;
        }
        if (this.hudSpeedTimer) {
            this.hudSpeedTimer.textContent = `${Math.max(1, Math.ceil(this.speedIntervalTimer))}s`;
        }
        if (this.hudLevel) {
            this.hudLevel.textContent = `NÍVEL ${this.speedLevel}`;
        }
        if (this.hudCoins) {
            this.hudCoins.textContent = (this.totalCoins + this.coinsEarnedThisRun).toLocaleString();
        }
        
        const rocketProgress = (this.airLiters / this.maxAirLiters) * 100;
        this.rocketSubFill.style.width = `${rocketProgress}%`;
    }

    // =================================================================
    // LOJA VIP DE MOEDAS COM MERCADO PAGO (PIX E CARTÃO)
    // =================================================================


}

// Composição de Classes Mixin
export class RoadsterDashGame extends UIManager(
    MultiplayerManager(
        ControlsManager(
            TrafficManager(
                EnvironmentBuilder(
                    CarModelBuilder(CoreGame)
                )
            )
        )
    )
) {}
