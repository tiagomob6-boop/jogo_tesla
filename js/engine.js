/**
 * engine.js - Motor de Execução do Mini-RPG "O Casamento do Professor"
 * Desenvolvido em Vanilla JavaScript puro (sem frameworks ou dependências).
 * 
 * Funcionalidades:
 * - Leitor de Nós do story.js e renderização dinâmica de estado
 * - Efeito Typewriter (máquina de escrever) com acelerador instantâneo por clique/tecla
 * - Sintetizador de Áudio Retrô via Web Audio API nativo (Beeps, Fanfarra, Alertas)
 * - Mecânica do Boss Final: Botão "Sim" fujão e resolução com Try/Catch Hotfix
 * - Renderizador de Tela Azul da Morte (BSOD) com dump de memória
 * - Sistema de Física de Confetes Digitais em Canvas para a Vitória
 * - Modal Interativo para Deploy em Produção (Lista de Presentes / PIX)
 */

(function () {
    "use strict";

    // =========================================================================
    // CONFIGURAÇÕES GLOBAIS E CHAVES PERSONALIZÁVEIS
    // =========================================================================
    const CONFIG = {
        typingSpeed: 18,              // Milissegundos por caractere
        defaultPixKey: "presente-professor@casamento.dev.br", // Chave PIX editável
        weddingUrl: "https://www.icasei.com.br",               // Link da lista oficial
        maxRunawayAttempts: 3         // Quantas vezes o botão foge antes de sugerir o Hotfix
    };

    // =========================================================================
    // MOTOR DE EFEITOS SONOROS RETRÔ (WEB AUDIO API - ZERO ARQUIVOS EXTERNOS)
    // =========================================================================
    class SoundFX {
        constructor() {
            this.audioCtx = null;
            this.enabled = true;
        }

        initContext() {
            if (!this.audioCtx && typeof window.AudioContext !== "undefined") {
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                this.audioCtx = new AudioContextClass();
            }
            if (this.audioCtx && this.audioCtx.state === "suspended") {
                this.audioCtx.resume();
            }
        }

        toggleSound() {
            this.enabled = !this.enabled;
            return this.enabled;
        }

        playTone(freq, type, duration, gainLevel = 0.05) {
            if (!this.enabled) return;
            try {
                this.initContext();
                if (!this.audioCtx) return;

                const osc = this.audioCtx.createOscillator();
                const gain = this.audioCtx.createGain();

                osc.type = type; // 'sine', 'square', 'sawtooth', 'triangle'
                osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

                gain.gain.setValueAtTime(gainLevel, this.audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);

                osc.connect(gain);
                gain.connect(this.audioCtx.destination);

                osc.start();
                osc.stop(this.audioCtx.currentTime + duration);
            } catch (e) {
                // Navegadores que bloqueiam áudio automático
            }
        }

        // Blip curto para teclas de digitação
        playKeyBlip() {
            if (!this.enabled) return;
            const freqs = [520, 580, 640, 700];
            const randFreq = freqs[Math.floor(Math.random() * freqs.length)];
            this.playTone(randFreq, "sine", 0.03, 0.02);
        }

        // Som de clique nos botões
        playClick() {
            this.playTone(440, "triangle", 0.08, 0.06);
        }

        // Som de alerta / erro / fuga do botão
        playBuzzer() {
            if (!this.enabled) return;
            this.playTone(180, "sawtooth", 0.25, 0.1);
        }

        // Som de patch aplicado / bugfix
        playSuccessChime() {
            if (!this.enabled) return;
            const notes = [523.25, 659.25, 783.99, 1046.50]; // Acorde C maior
            notes.forEach((freq, index) => {
                setTimeout(() => {
                    this.playTone(freq, "triangle", 0.18, 0.08);
                }, index * 90);
            });
        }

        // Fanfarra triunfal da vitória matrimonial
        playVictoryFanfare() {
            if (!this.enabled) return;
            const melody = [
                { f: 523.25, d: 0.15 }, // C5
                { f: 659.25, d: 0.15 }, // E5
                { f: 783.99, d: 0.15 }, // G5
                { f: 1046.50, d: 0.4 }, // C6
                { f: 880.00, d: 0.2 },  // A5
                { f: 1046.50, d: 0.6 }  // C6 sustenido
            ];
            let elapsed = 0;
            melody.forEach(item => {
                setTimeout(() => {
                    this.playTone(item.f, "sine", item.d, 0.12);
                }, elapsed);
                elapsed += item.d * 1000 + 40;
            });
        }
    }

    // =========================================================================
    // SISTEMA DE CONFETES DIGITAIS (CANVAS 60FPS)
    // =========================================================================
    class ConfettiRain {
        constructor(canvasId) {
            this.canvas = document.getElementById(canvasId);
            this.ctx = this.canvas ? this.canvas.getContext("2d") : null;
            this.particles = [];
            this.animationFrame = null;
            this.isActive = false;

            if (this.canvas) {
                this.resize();
                window.addEventListener("resize", () => this.resize());
            }
        }

        resize() {
            if (!this.canvas) return;
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }

        start() {
            if (!this.canvas || this.isActive) return;
            this.isActive = true;
            this.particles = [];
            const colors = ["#00adb5", "#00ff00", "#ffd700", "#ff5f56", "#ffffff", "#569cd6", "#c586c0"];

            for (let i = 0; i < 160; i++) {
                this.particles.push({
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height - this.canvas.height,
                    size: Math.random() * 8 + 4,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    speedY: Math.random() * 3 + 2,
                    speedX: Math.random() * 2 - 1,
                    rotation: Math.random() * 360,
                    rotationSpeed: Math.random() * 4 - 2,
                    shape: Math.random() > 0.4 ? "rect" : "circle"
                });
            }

            const loop = () => {
                if (!this.isActive) return;
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

                this.particles.forEach(p => {
                    p.y += p.speedY;
                    p.x += p.speedX;
                    p.rotation += p.rotationSpeed;

                    if (p.y > this.canvas.height) {
                        p.y = -10;
                        p.x = Math.random() * this.canvas.width;
                    }

                    this.ctx.save();
                    this.ctx.translate(p.x, p.y);
                    this.ctx.rotate((p.rotation * Math.PI) / 180);
                    this.ctx.fillStyle = p.color;

                    if (p.shape === "rect") {
                        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
                    } else {
                        this.ctx.beginPath();
                        this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                        this.ctx.fill();
                    }
                    this.ctx.restore();
                });

                this.animationFrame = requestAnimationFrame(loop);
            };

            loop();
        }

        stop() {
            this.isActive = false;
            if (this.animationFrame) {
                cancelAnimationFrame(this.animationFrame);
            }
            if (this.ctx && this.canvas) {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            }
        }
    }

    // =========================================================================
    // GAME ENGINE PRINCIPAL
    // =========================================================================
    class GameEngine {
        constructor() {
            this.sound = new SoundFX();
            this.confetti = new ConfettiRain("confetti-canvas");

            // Elementos da UI
            this.stageBadge = document.getElementById("stage-badge");
            this.sceneTitle = document.getElementById("scene-title");
            this.typewriterText = document.getElementById("typewriter-text");
            this.terminalCursor = document.getElementById("terminal-cursor");
            this.codeSnippetContainer = document.getElementById("code-snippet-container");
            this.codeSnippetContent = document.getElementById("code-snippet-content");
            this.codeSnippetTitle = document.getElementById("code-snippet-title");
            this.interactiveAlert = document.getElementById("interactive-alert");
            this.alertTitle = document.getElementById("alert-title");
            this.alertDesc = document.getElementById("alert-desc");
            this.choicesContainer = document.getElementById("choices-container");

            // Tabs e Breadcrumbs
            this.titleFileName = document.getElementById("title-file-name");
            this.tabFileName = document.getElementById("tab-file-name");
            this.tabLangIcon = document.getElementById("tab-lang-icon");
            this.bcStage = document.getElementById("bc-stage");
            this.bcFile = document.getElementById("bc-file");
            this.statusPosition = document.getElementById("status-position");
            this.statusLanguage = document.getElementById("status-language");

            // BSOD e Modais
            this.bsodScreen = document.getElementById("bsod-screen");
            this.bsodStopCode = document.getElementById("bsod-stopcode");
            this.bsodCrashDesc = document.getElementById("bsod-crash-desc");
            this.bsodRestartBtn = document.getElementById("bsod-restart-btn");
            this.giftModal = document.getElementById("gift-modal");
            this.modalCloseBtn = document.getElementById("modal-close-btn");
            this.pixKeyInput = document.getElementById("pix-key-input");
            this.btnCopyPix = document.getElementById("btn-copy-pix");
            this.copyText = document.getElementById("copy-text");
            this.giftLinkBtn = document.getElementById("gift-link-btn");

            // Ações da Titlebar
            this.btnSoundToggle = document.getElementById("btn-sound-toggle");
            this.soundIcon = document.getElementById("sound-icon");
            this.btnRestartGame = document.getElementById("btn-restart-game");

            // Estado interno do jogo
            this.currentNode = null;
            this.isTyping = false;
            this.currentFullText = "";
            this.typewriterIndex = 0;
            this.typewriterTimer = null;
            this.runawayCount = 0;

            this.initListeners();
        }

        initListeners() {
            // Acelerar digitação com clique na tela ou no texto
            const terminalScreen = document.getElementById("terminal-screen");
            if (terminalScreen) {
                terminalScreen.addEventListener("click", () => this.fastForwardTyping());
                terminalScreen.addEventListener("keydown", (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        this.fastForwardTyping();
                    }
                });
            }

            // Alternar Som
            if (this.btnSoundToggle) {
                this.btnSoundToggle.addEventListener("click", () => {
                    const enabled = this.sound.toggleSound();
                    this.soundIcon.textContent = enabled ? "🔊" : "🔇";
                    const textSpan = this.btnSoundToggle.querySelector(".btn-text");
                    if (textSpan) textSpan.textContent = enabled ? "Som: ON" : "Som: OFF";
                    if (enabled) this.sound.playClick();
                });
            }

            // Reiniciar Jogo pelo topo
            if (this.btnRestartGame) {
                this.btnRestartGame.addEventListener("click", () => {
                    this.sound.playClick();
                    this.loadNode("start");
                });
            }

            // Botão de Reboot no BSOD
            if (this.bsodRestartBtn) {
                this.bsodRestartBtn.addEventListener("click", () => {
                    this.sound.playClick();
                    this.hideBSOD();
                    this.loadNode("start");
                });
            }

            // Modal da Lista de Presentes
            if (this.modalCloseBtn) {
                this.modalCloseBtn.addEventListener("click", () => this.closeGiftModal());
            }

            if (this.btnCopyPix) {
                this.btnCopyPix.addEventListener("click", () => this.copyPixKey());
            }

            // Fechar modal ao clicar fora
            if (this.giftModal) {
                this.giftModal.addEventListener("click", (e) => {
                    if (e.target === this.giftModal) this.closeGiftModal();
                });
            }

            // Configurar dados customizados dos presentes
            if (this.pixKeyInput) this.pixKeyInput.value = CONFIG.defaultPixKey;
            if (this.giftLinkBtn) this.giftLinkBtn.href = CONFIG.weddingUrl;
        }

        start() {
            this.loadNode("start");
        }

        /**
         * Carrega e executa um nó de história do story.js
         */
        loadNode(nodeId) {
            const node = window.STORY_DATA[nodeId];
            if (!node) {
                console.error(`Nó da história não encontrado: ${nodeId}`);
                return;
            }

            this.currentNode = node;

            // Se for Game Over, exibe Tela Azul
            if (node.isGameOver) {
                this.showBSOD(node);
                return;
            }

            // Se for Vitória, ativa confetes e fanfarra
            if (node.isVictory) {
                this.confetti.start();
                this.sound.playVictoryFanfare();
            } else {
                this.confetti.stop();
            }

            // Atualiza barra de abas e caminhos da IDE
            this.updateIdeMetadata(node);

            // Esconde alertas interativos por padrão
            this.interactiveAlert.style.display = "none";

            // Renderiza Snippet de Código se houver
            if (node.code) {
                this.codeSnippetTitle.textContent = node.file || "snippet.js";
                this.codeSnippetContent.textContent = node.code;
                this.codeSnippetContainer.style.display = "block";
            } else {
                this.codeSnippetContainer.style.display = "none";
            }

            // Limpa botões de escolha enquanto digita
            this.choicesContainer.innerHTML = "";

            // Inicia efeito de máquina de escrever
            const textToType = Array.isArray(node.text) ? node.text.join("\n") : node.text;
            this.startTypewriter(textToType, () => {
                this.renderChoices(node);
            });
        }

        /**
         * Atualiza metadados visuais estilo VS Code
         */
        updateIdeMetadata(node) {
            const fileName = node.file || "casamento.js";
            const ext = fileName.split(".").pop().toUpperCase();

            this.stageBadge.textContent = node.stage || "IDE TERMINAL";
            this.sceneTitle.textContent = node.title || "Depuração em Andamento";
            this.titleFileName.textContent = fileName;
            this.tabFileName.textContent = fileName;
            this.tabLangIcon.textContent = ext;
            this.bcStage.textContent = node.stage || "src";
            this.bcFile.textContent = fileName;

            // Atualiza linguagem na status bar
            const langMap = { "JS": "JavaScript", "PY": "Python", "CPP": "C++", "C": "C", "DUMP": "Dump", "PROD": "Deploy" };
            this.statusLanguage.textContent = langMap[ext] || "Texto";
            this.statusPosition.textContent = `Ln ${Math.floor(Math.random() * 40) + 1}, Col 1`;
        }

        /**
         * Efeito de Máquina de Escrever com som suave
         */
        startTypewriter(fullText, onComplete) {
            // Cancelar digitação anterior se houver
            if (this.typewriterTimer) clearTimeout(this.typewriterTimer);

            this.isTyping = true;
            this.currentFullText = fullText;
            this.typewriterIndex = 0;
            this.typewriterText.textContent = "";
            this.terminalCursor.style.display = "inline-block";

            const typeNextChar = () => {
                if (!this.isTyping) return;

                if (this.typewriterIndex < this.currentFullText.length) {
                    const char = this.currentFullText.charAt(this.typewriterIndex);
                    this.typewriterText.textContent += char;
                    this.typewriterIndex++;

                    // Tocar som de digitação a cada 3 caracteres para não poluir
                    if (this.typewriterIndex % 3 === 0 && char.trim() !== "") {
                        this.sound.playKeyBlip();
                    }

                    this.typewriterTimer = setTimeout(typeNextChar, CONFIG.typingSpeed);
                } else {
                    this.finishTypewriter(onComplete);
                }
            };

            typeNextChar();
        }

        /**
         * Conclui instantaneamente a digitação ao clicar
         */
        fastForwardTyping() {
            if (this.isTyping) {
                if (this.typewriterTimer) clearTimeout(this.typewriterTimer);
                this.typewriterText.textContent = this.currentFullText;
                this.typewriterIndex = this.currentFullText.length;
                this.finishTypewriter(() => {
                    this.renderChoices(this.currentNode);
                });
            }
        }

        finishTypewriter(onComplete) {
            this.isTyping = false;
            if (onComplete) onComplete();
        }

        /**
         * Injeta dinamicamente as opções de escolha como botões no container
         */
        renderChoices(node) {
            this.choicesContainer.innerHTML = "";
            if (!node.options || node.options.length === 0) return;

            node.options.forEach((opt, index) => {
                const btn = document.createElement("button");
                btn.className = "choice-btn";
                btn.type = "button";
                btn.innerHTML = `<span class="btn-tag">&gt; fn()</span> <span class="btn-label">${opt.text}</span>`;

                // Botão de Hotfix estilizado
                if (opt.isHotfixButton) {
                    btn.classList.add("btn-hotfix");
                }

                // Botão de Vitória / Deploy com Destaque
                if (opt.isHighlighted || opt.isConfirmedVictory) {
                    btn.classList.add("btn-highlight");
                }

                // MECÂNICA DO BOSS FINAL: BOTÃO "SIM" QUE FOGE DO MOUSE
                if (opt.isRunawayButton) {
                    btn.classList.add("runaway-btn");
                    this.setupRunawayBehavior(btn);
                }

                // Evento de clique
                btn.addEventListener("click", () => {
                    this.sound.playClick();

                    if (opt.action === "openGiftModal") {
                        this.openGiftModal();
                        return;
                    }

                    if (opt.isRunawayButton) {
                        // Se o jogador conseguir clicar mesmo correndo, joga o erro simulado
                        this.triggerRunawayAlert(btn);
                        return;
                    }

                    if (opt.nextNode) {
                        if (opt.isHotfixButton) {
                            this.sound.playSuccessChime();
                        }
                        this.loadNode(opt.nextNode);
                    }
                });

                this.choicesContainer.appendChild(btn);
            });
        }

        /**
         * Mecânica divertida do Boss: Botão que desvia do cursor do usuário
         */
        setupRunawayBehavior(btn) {
            this.runawayCount = 0;

            const handleEscape = (e) => {
                this.runawayCount++;
                this.sound.playBuzzer();

                // Calcula deslocamento relativo dentro do container
                const containerRect = this.choicesContainer.getBoundingClientRect();
                const btnRect = btn.getBoundingClientRect();

                const maxOffsetX = Math.max(20, containerRect.width - btnRect.width - 40);
                const maxOffsetY = Math.max(20, containerRect.height - btnRect.height);

                const randomX = Math.floor(Math.random() * maxOffsetX);
                const randomY = Math.floor(Math.random() * maxOffsetY);

                btn.style.position = "relative";
                btn.style.transform = `translate(${randomX > 150 ? -randomX / 2 : randomX}px, ${randomY > 40 ? -randomY : randomY}px)`;

                this.triggerRunawayAlert(btn);
            };

            btn.addEventListener("mouseenter", handleEscape);
            btn.addEventListener("touchstart", (e) => {
                // Suporte para telas de toque
                e.preventDefault();
                handleEscape(e);
            });
        }

        /**
         * Alerta de erro simulado quando o botão foge
         */
        triggerRunawayAlert(btn) {
            this.interactiveAlert.style.display = "flex";
            this.alertTitle.textContent = "FATAL: UnhandledMaritalException (Frio na barriga detectado!)";
            this.alertDesc.textContent = `Tentativa #${this.runawayCount}: O ponteiro do mouse falhou devido à emoção extrema! Aplique o Hotfix com Try/Catch abaixo para estabilizar a aliança!`;

            // Faz o container vibrar suavemente
            btn.classList.add("shake-animation");
            setTimeout(() => btn.classList.remove("shake-animation"), 300);
        }

        /**
         * Exibe a Tela Azul da Morte (BSOD)
         */
        showBSOD(node) {
            this.sound.playBuzzer();
            this.bsodStopCode.textContent = `CÓDIGO DE PARADA: ${node.id.toUpperCase()}_ABORT`;
            this.bsodCrashDesc.textContent = node.bsodMessage || "Falha irrecuperável de execução na compilação do casamento.";
            this.bsodScreen.style.display = "flex";
        }

        /**
         * Oculta a Tela Azul
         */
        hideBSOD() {
            this.bsodScreen.style.display = "none";
        }

        /**
         * Abre modal de presentes / deploy
         */
        openGiftModal() {
            this.sound.playSuccessChime();
            this.giftModal.style.display = "flex";
        }

        closeGiftModal() {
            this.sound.playClick();
            this.giftModal.style.display = "none";
        }

        copyPixKey() {
            if (this.pixKeyInput) {
                this.pixKeyInput.select();
                this.pixKeyInput.setSelectionRange(0, 99999); // Mobile
                navigator.clipboard.writeText(this.pixKeyInput.value).then(() => {
                    this.sound.playSuccessChime();
                    this.copyText.textContent = "Copiado! ✓";
                    this.btnCopyPix.style.backgroundColor = "#00ff00";
                    setTimeout(() => {
                        this.copyText.textContent = "Copiar";
                        this.btnCopyPix.style.backgroundColor = "";
                    }, 2200);
                }).catch(() => {
                    alert("Chave PIX: " + this.pixKeyInput.value);
                });
            }
        }
    }

    // Inicialização ao carregar a página
    window.addEventListener("DOMContentLoaded", () => {
        const engine = new GameEngine();
        engine.start();
        window.GameEngineInstance = engine; // Disponibilizar para depuração no console
    });

})();

