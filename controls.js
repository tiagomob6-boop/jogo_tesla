/**
 * controls.js - Gerenciamento de Controles, Teclado e HUD Touch Customizável
 * Implementa reposicionamento livre (drag-and-drop) dos botões touch com persistência no LocalStorage,
 * além do mapeamento seguro da tecla [R] para reinício e bloqueio de resets acidentais via [Enter].
 */

const STORAGE_KEY = "roadster_touch_layout";

export class ControlsSystem {
    constructor(gameInstance) {
        this.game = gameInstance;
        this.isEditMode = false;
        this.buttons = {};
    }

    /**
     * Inicializa os ouvintes de teclado universais e atalhos seguros
     */
    initKeyboard() {
        window.addEventListener("keydown", (e) => {
            // Tecla [R] dedicada para reiniciar o jogo de forma segura
            if ((e.key === "r" || e.key === "R") && !e.target.matches("input, textarea")) {
                if (!this.game.isRunning || (this.game.gameOverScreen && this.game.gameOverScreen.classList.contains("active"))) {
                    if (this.game.sound) this.game.sound.init();
                    this.game.startGame();
                    return;
                }
            }

            // Desativa completamente a tecla [Enter] de reiniciar ou interferir na corrida
            if (e.key === "Enter" && !e.target.matches("input, textarea")) {
                e.preventDefault();
            }

            if (!this.game.isRunning || this.game.isPaused) return;

            // Modo 2 Jogadores Local (WASD para P1 e Setas para P2)
            if (this.game.isMultiplayer && this.game.mpMode === "local2p") {
                if (e.key === "a" || e.key === "A") { this.game.changeLane(-1); return; }
                if (e.key === "d" || e.key === "D") { this.game.changeLane(1); return; }
                if (e.key === "w" || e.key === "W" || e.key === " ") { this.game.toggleFlight(); return; }
                if (e.key === "s" || e.key === "S") { this.game.slamDown(); return; }

                if (e.key === "ArrowLeft") { this.game.changeP2Lane(-1); return; }
                if (e.key === "ArrowRight") { this.game.changeP2Lane(1); return; }
                if (e.key === "ArrowUp") { this.game.toggleP2Flight(); return; }
                if (e.key === "ArrowDown") { this.game.slamP2Down(); return; }
            }

            // Controles Padrão (Setas e WASD)
            switch (e.key) {
                case "ArrowLeft":
                case "a":
                case "A":
                    this.game.changeLane(-1);
                    break;
                case "ArrowRight":
                case "d":
                case "D":
                    this.game.changeLane(1);
                    break;
                case " ":
                case "Shift":
                case "ArrowUp":
                case "w":
                case "W":
                    this.game.toggleFlight();
                    break;
                case "ArrowDown":
                case "s":
                case "S":
                    this.game.slamDown();
                    break;
            }
        });
    }

    /**
     * Inicializa os botões touch virtuais na tela e carrega o layout salvo
     */
    initTouchHUD(elements) {
        this.buttons = elements;
        this.restoreSavedPositions();
        this.setupDraggableButtons();
        this.createEditModeBanner();
    }

    /**
     * Restaura as coordenadas salvas do LocalStorage
     */
    restoreSavedPositions() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return;
            const layout = JSON.parse(raw);
            Object.keys(layout).forEach(btnKey => {
                const btn = this.buttons[btnKey];
                const pos = layout[btnKey];
                if (btn && pos && typeof pos.left === "number" && typeof pos.top === "number") {
                    btn.style.position = "fixed";
                    btn.style.left = `${pos.left}px`;
                    btn.style.top = `${pos.top}px`;
                    btn.style.bottom = "auto";
                    btn.style.right = "auto";
                    btn.style.zIndex = "99";
                }
            });
        } catch (e) {
            console.warn("Falha ao restaurar layout de botões touch:", e);
        }
    }

    /**
     * Configura o comportamento de arrastar (Drag and Drop Touch)
     */
    setupDraggableButtons() {
        Object.keys(this.buttons).forEach(key => {
            const btn = this.buttons[key];
            if (!btn) return;

            let isDragging = false;
            let offsetLeft = 0;
            let offsetTop = 0;

            btn.addEventListener("touchstart", (e) => {
                if (!this.isEditMode) return;
                isDragging = true;
                const touch = e.touches[0];
                const rect = btn.getBoundingClientRect();
                offsetLeft = touch.clientX - rect.left;
                offsetTop = touch.clientY - rect.top;
                btn.style.position = "fixed";
                btn.style.zIndex = "102";
                e.preventDefault();
            }, { passive: false });

            btn.addEventListener("touchmove", (e) => {
                if (!isDragging || !this.isEditMode) return;
                const touch = e.touches[0];
                const newX = Math.max(10, Math.min(window.innerWidth - 75, touch.clientX - offsetLeft));
                const newY = Math.max(50, Math.min(window.innerHeight - 75, touch.clientY - offsetTop));

                btn.style.left = `${newX}px`;
                btn.style.top = `${newY}px`;
                btn.style.bottom = "auto";
                btn.style.right = "auto";
                e.preventDefault();
            }, { passive: false });

            btn.addEventListener("touchend", () => {
                if (isDragging) {
                    isDragging = false;
                    this.saveSingleButtonPosition(key, btn);
                }
            });
        });
    }

    /**
     * Salva a posição individual de um botão no LocalStorage
     */
    saveSingleButtonPosition(key, btn) {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
            const rect = btn.getBoundingClientRect();
            saved[key] = {
                left: Math.round(rect.left),
                top: Math.round(rect.top)
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
        } catch (e) {}
    }

    /**
     * Ativa ou desativa o modo visual de reposicionamento de botões
     */
    toggleEditMode(forceState) {
        this.isEditMode = (forceState !== undefined) ? forceState : !this.isEditMode;
        const banner = document.getElementById("touch-edit-banner");

        if (this.isEditMode) {
            document.body.classList.add("touch-edit-active");
            if (banner) banner.classList.add("active");
            if (this.game.triggerActionPopup) {
                this.game.triggerActionPopup("🎮 Arraste os botões para onde desejar!");
            }
        } else {
            document.body.classList.remove("touch-edit-active");
            if (banner) banner.classList.remove("active");
            if (this.game.triggerActionPopup) {
                this.game.triggerActionPopup("✅ Layout de Botões Salvo!");
            }
        }
    }

    /**
     * Redefine os botões para o layout padrão de fábrica
     */
    resetToDefaultLayout() {
        localStorage.removeItem(STORAGE_KEY);
        Object.keys(this.buttons).forEach(k => {
            const btn = this.buttons[k];
            if (btn) {
                btn.style.position = "";
                btn.style.left = "";
                btn.style.top = "";
                btn.style.bottom = "";
                btn.style.right = "";
                btn.style.zIndex = "";
            }
        });
        this.toggleEditMode(false);
        if (this.game.triggerActionPopup) {
            this.game.triggerActionPopup("🔄 Controles Redefinidos ao Padrão!");
        }
    }

    /**
     * Cria a barra de ferramentas flutuante do modo de edição
     */
    createEditModeBanner() {
        let banner = document.getElementById("touch-edit-banner");
        if (banner) return;

        banner = document.createElement("div");
        banner.id = "touch-edit-banner";
        banner.className = "touch-edit-banner";
        banner.innerHTML = `
            <span style="color: #f59e0b; font-weight: bold; font-size: 0.95rem;">🎮 MODO DE EDIÇÃO: Arraste os botões na tela!</span>
            <div class="touch-edit-btn-row">
                <button id="save-touch-layout-btn" class="primary-btn" style="padding: 6px 14px; font-size: 0.85rem;">✅ Salvar Posições</button>
                <button id="reset-touch-layout-btn" class="secondary-btn" style="padding: 6px 14px; font-size: 0.85rem;">🔄 Redefinir Padrão</button>
            </div>
        `;
        document.body.appendChild(banner);

        document.getElementById("save-touch-layout-btn").addEventListener("click", () => this.toggleEditMode(false));
        document.getElementById("reset-touch-layout-btn").addEventListener("click", () => this.resetToDefaultLayout());
    }
}

