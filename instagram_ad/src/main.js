/**
 * main.js
 * Ponto de entrada modular para o Anúncio Interativo do Instagram no Project IDX.
 */

import { CarBuilder } from './CarBuilder.js';
import { Environment } from './Environment.js';
import { GamePlay } from './GamePlay.js';
import { DebugControls } from './DebugControls.js';

class InstagramPlayableAd {
    constructor() {
        this.canvas = document.getElementById('ad-canvas');
        this.container = document.getElementById('ad-viewport');

        this.scene = null;
        this.camera = null;
        this.renderer = null;

        this.carBuilder = null;
        this.environment = null;
        this.gamePlay = null;
        this.debugControls = null;

        this.lastTime = performance.now();
        this.hasInteracted = false;

        this.initThree();
        this.initModules();
        this.bindUI();
        this.startLoop();
    }

    initThree() {
        this.scene = new THREE.Scene();

        const w = this.container.clientWidth || window.innerWidth;
        const h = this.container.clientHeight || window.innerHeight;

        this.camera = new THREE.PerspectiveCamera(68, w / h, 0.1, 800);
        this.camera.position.set(0, 5.6, 8.8);

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(w, h);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.05;

        window.addEventListener('resize', () => this.onResize());
    }

    onResize() {
        const w = this.container.clientWidth || window.innerWidth;
        const h = this.container.clientHeight || window.innerHeight;
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
    }

    initModules() {
        // 1. Cenário e Luzes
        this.environment = new Environment(this.scene);

        // 2. Carro Solaris Hypercar
        this.carBuilder = new CarBuilder(this.scene);

        // 3. Mecânicas de Jogo Subway Surfers
        this.gamePlay = new GamePlay(this.scene, this.carBuilder, this.environment, {
            onScoreUpdate: (score, dist, coins) => {
                const scoreEl = document.getElementById('hud-score');
                const distEl = document.getElementById('hud-distance');
                const coinsEl = document.getElementById('hud-coins');
                if (scoreEl) scoreEl.textContent = score.toLocaleString();
                if (distEl) distEl.textContent = dist + ' m';
                if (coinsEl) coinsEl.textContent = coins;
            },
            onShieldActive: (ratio) => {
                const shieldBar = document.getElementById('shield-bar-wrapper');
                const shieldFill = document.getElementById('shield-bar-fill');
                if (shieldBar && shieldFill) {
                    if (ratio > 0) {
                        shieldBar.style.display = 'block';
                        shieldFill.style.width = (ratio * 100) + '%';
                    } else {
                        shieldBar.style.display = 'none';
                    }
                }
            },
            onActionPopup: (text) => {
                this.showPopup(text);
            },
            onGameOver: (finalScore, finalDist, finalCoins) => {
                this.showEndCard(finalScore, finalDist, finalCoins);
            }
        });

        // 4. Painel de Ajustes IDX em Tempo Real
        this.debugControls = new DebugControls(this.camera, this.environment, this.gamePlay);
    }

    bindUI() {
        // Remove dica de tutorial ao primeiro toque ou tecla
        const hideTutorial = () => {
            if (!this.hasInteracted) {
                this.hasInteracted = true;
                const hand = document.getElementById('tutorial-hand');
                if (hand) hand.classList.add('hidden');
            }
        };
        window.addEventListener('touchstart', hideTutorial, { once: true });
        window.addEventListener('keydown', hideTutorial, { once: true });
        window.addEventListener('mousedown', hideTutorial, { once: true });

        // Botão de Instalar / Jogar Agora do Anúncio
        const ctaBtn = document.getElementById('ad-cta-btn');
        if (ctaBtn) {
            ctaBtn.addEventListener('click', () => {
                window.open('https://tiagomob6-boop.github.io/jogo_tesla/', '_blank');
            });
        }

        // Botão Jogar Novamente no End Card
        const replayBtn = document.getElementById('end-replay-btn');
        if (replayBtn) {
            replayBtn.addEventListener('click', () => {
                document.getElementById('ad-endcard').classList.remove('active');
                this.gamePlay.restart();
            });
        }

        // Botão Instalar Agora no End Card
        const endCtaBtn = document.getElementById('end-cta-btn');
        if (endCtaBtn) {
            endCtaBtn.addEventListener('click', () => {
                window.open('https://tiagomob6-boop.github.io/jogo_tesla/', '_blank');
            });
        }

        // Toggle Simulador de Celular 9:16 vs Tela Cheia
        const viewToggle = document.getElementById('toggle-device-view');
        if (viewToggle) {
            viewToggle.addEventListener('click', () => {
                const appContainer = document.getElementById('app-wrapper');
                const isPhone = appContainer.classList.toggle('phone-simulator');
                viewToggle.textContent = isPhone ? '🖥️ Modo Tela Cheia' : '📱 Modo Instagram 9:16';
                setTimeout(() => this.onResize(), 100);
            });
        }
    }

    showPopup(text) {
        const popup = document.getElementById('action-popup');
        if (popup) {
            popup.textContent = text;
            popup.classList.remove('show');
            void popup.offsetWidth; // Força reflow para reiniciar animação CSS
            popup.classList.add('show');
            setTimeout(() => popup.classList.remove('show'), 1600);
        }
    }

    showEndCard(score, dist, coins) {
        const endCard = document.getElementById('ad-endcard');
        if (endCard) {
            document.getElementById('end-score-val').textContent = score.toLocaleString();
            document.getElementById('end-dist-val').textContent = dist + 'm';
            document.getElementById('end-coins-val').textContent = coins;
            endCard.classList.add('active');
        }
    }

    startLoop() {
        const loop = (time) => {
            const delta = Math.min((time - this.lastTime) / 1000, 0.05);
            this.lastTime = time;

            if (this.gamePlay.isRunning) {
                this.environment.update(delta, this.gamePlay.currentSpeed);
                this.gamePlay.update(delta);
                this.debugControls.updateCamera(this.gamePlay.playerX, this.gamePlay.playerY, delta);
            }

            this.renderer.render(this.scene, this.camera);
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }
}

// Inicia aplicação assim que o DOM carregar
window.addEventListener('DOMContentLoaded', () => {
    new InstagramPlayableAd();
});
