(function () {
    "use strict";

    // 1. Áudio e Configurações Globais
class SoundSystem {
            constructor() {
                this.ctx = null;
                this.enabled = true;
                this.sfxVolume = 1.0;
                this.engineOsc = null;
                this.engineGain = null;
            }

            init() {
                if (!this.ctx && typeof AudioContext !== "undefined") {
                    const AC = window.AudioContext || window.webkitAudioContext;
                    this.ctx = new AC();
                    this.setupEngineSound();
                }
                if (this.ctx && this.ctx.state === "suspended") {
                    this.ctx.resume();
                }
            }

            setupEngineSound() {
                if (!this.ctx) return;
                try {
                    this.engineOsc = this.ctx.createOscillator();
                    this.engineGain = this.ctx.createGain();
                    this.engineOsc.type = "sawtooth";
                    this.engineOsc.frequency.setValueAtTime(55, this.ctx.currentTime);
                    this.engineGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
                    this.engineOsc.connect(this.engineGain);
                    this.engineGain.connect(this.ctx.destination);
                    this.engineOsc.start();
                } catch(e) {}
            }

            updateEngine(speed, isFlying) {
                if (!this.ctx || !this.enabled || !this.engineOsc) return;
                const baseFreq = isFlying ? 120 : (55 + speed * 0.85);
                this.engineOsc.frequency.setTargetAtTime(baseFreq, this.ctx.currentTime, 0.08);
                const targetGain = (isFlying ? 0.03 : 0.012) * this.sfxVolume;
                this.engineGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.08);
            }

            stopEngine() {
                if (this.engineGain && this.ctx) {
                    this.engineGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.1);
                }
            }

            playTone(freq, type, duration, gainLevel = 0.1) {
                if (!this.enabled || !this.ctx || this.sfxVolume <= 0) return;
                try {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = type;
                    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
                    gain.gain.setValueAtTime(gainLevel * this.sfxVolume, this.ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start();
                    osc.stop(this.ctx.currentTime + duration);
                } catch (e) {}
            }

            playAirPuff() {
                if (!this.enabled || !this.ctx || this.sfxVolume <= 0) return;
                try {
                    const bufferSize = this.ctx.sampleRate * 0.14;
                    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
                    const data = buffer.getChannelData(0);
                    for (let i = 0; i < bufferSize; i++) {
                        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
                    }
                    const noise = this.ctx.createBufferSource();
                    noise.buffer = buffer;
                    const filter = this.ctx.createBiquadFilter();
                    filter.type = "bandpass";
                    filter.frequency.setValueAtTime(1400, this.ctx.currentTime);
                    const gain = this.ctx.createGain();
                    gain.gain.setValueAtTime(0.08 * this.sfxVolume, this.ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.14);
                    noise.connect(filter);
                    filter.connect(gain);
                    gain.connect(this.ctx.destination);
                    noise.start();
                } catch(e) {}
            }

            playLaneChange() {
                this.playTone(330, "sine", 0.07, 0.04);
            }

            playSlam() {
                this.playTone(95, "triangle", 0.14, 0.12);
            }

            playCoin() {
                if (!this.enabled || !this.ctx || this.sfxVolume <= 0) return;
                const notes = [1046.50, 1318.51];
                notes.forEach((f, i) => {
                    setTimeout(() => this.playTone(f, "sine", 0.09, 0.05), i * 45);
                });
            }

            playHeart() {
                if (!this.enabled || !this.ctx || this.sfxVolume <= 0) return;
                const notes = [523.25, 659.25, 783.99, 1046.50];
                notes.forEach((f, i) => {
                    setTimeout(() => this.playTone(f, "triangle", 0.14, 0.08), i * 50);
                });
            }

            playZap() {
                this.playTone(220, "sawtooth", 0.2, 0.15);
            }

            playCrash() {
                if (!this.enabled || !this.ctx || this.sfxVolume <= 0) return;
                const bufferSize = this.ctx.sampleRate * 0.4;
                const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
                }
                const noise = this.ctx.createBufferSource();
                noise.buffer = buffer;
                const gain = this.ctx.createGain();
                gain.gain.setValueAtTime(0.25 * this.sfxVolume, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);
                noise.connect(gain);
                gain.connect(this.ctx.destination);
                noise.start();
            }

            playGameOver() {
                if (!this.enabled || !this.ctx || this.sfxVolume <= 0) return;
                const notes = [330, 293, 261, 220];
                notes.forEach((f, i) => {
                    setTimeout(() => this.playTone(f, "triangle", 0.35, 0.09), i * 140);
                });
            }

            playRampLaunch() {
                if (!this.enabled || !this.ctx || this.sfxVolume <= 0) return;
                try {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = "sawtooth";
                    osc.frequency.setValueAtTime(180, this.ctx.currentTime);
                    osc.frequency.exponentialRampToValueAtTime(750, this.ctx.currentTime + 0.28);
                    gain.gain.setValueAtTime(0.13 * this.sfxVolume, this.ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.32);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start();
                    osc.stop(this.ctx.currentTime + 0.32);
                } catch(e) {}
            }

            playTrickScore() {
                if (!this.enabled || !this.ctx || this.sfxVolume <= 0) return;
                const notes = [659.25, 880.00, 1174.66];
                notes.forEach((f, i) => {
                    setTimeout(() => this.playTone(f, "sine", 0.08, 0.06), i * 55);
                });
            }

            playSpeedUp() {
                if (!this.enabled || !this.ctx || this.sfxVolume <= 0) return;
                const notes = [440, 554.37, 659.25, 880];
                notes.forEach((f, i) => {
                    setTimeout(() => this.playTone(f, "sawtooth", 0.12, 0.08), i * 65);
                });
            }

            playBuyCar() {
                if (!this.enabled || !this.ctx || this.sfxVolume <= 0) return;
                const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
                notes.forEach((f, i) => {
                    setTimeout(() => this.playTone(f, "sine", 0.12, 0.08), i * 60);
                });
            }

            playShield() {
                if (!this.enabled || !this.ctx || this.sfxVolume <= 0) return;
                const notes = [392.00, 523.25, 659.25, 783.99, 1046.50, 1318.51];
                notes.forEach((f, i) => {
                    setTimeout(() => this.playTone(f, "sine", 0.16, 0.07), i * 42);
                });
            }

            playShieldSmash() {
                if (!this.enabled || !this.ctx || this.sfxVolume <= 0) return;
                this.playTone(140, "sawtooth", 0.22, 0.22);
                this.playTone(480, "triangle", 0.28, 0.16);
            }

            playMegaBoost() {
                if (!this.enabled || !this.ctx || this.sfxVolume <= 0) return;
                try {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = "sawtooth";
                    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
                    osc.frequency.exponentialRampToValueAtTime(980, this.ctx.currentTime + 0.35);
                    gain.gain.setValueAtTime(0.18 * this.sfxVolume, this.ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.38);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start();
                    osc.stop(this.ctx.currentTime + 0.38);

                    const notes = [659.25, 880.00, 1046.50, 1318.51];
                    notes.forEach((f, i) => {
                        setTimeout(() => this.playTone(f, "sine", 0.12, 0.07), 40 + i * 40);
                    });
                } catch(e) {}
            }

            playMissionComplete() {
                if (!this.enabled || !this.ctx || this.sfxVolume <= 0) return;
                const fanfare = [523.25, 659.25, 783.99, 1046.50];
                fanfare.forEach((f, i) => {
                    setTimeout(() => this.playTone(f, "triangle", 0.22, 0.09), i * 75);
                });
            }
        }



        // =====================================================================
        // CATÁLOGO DE PACOTES DE MOEDAS (LOJA DE MOEDAS & MERCADO PAGO)
        // =====================================================================
const COIN_PACKAGES = {
            pacote_500: {
                id: 'pacote_500',
                name: 'Pacote Básico de Moedas',
                coins: 500,
                price: 4.90,
                tag: 'Básico',
                icon: '🪙',
                desc: '500 Moedas para upgrades de ar e blindagem de vida.'
            },
            pacote_1500: {
                id: 'pacote_1500',
                name: 'Pacote Neon Popular',
                coins: 1500,
                price: 9.90,
                tag: 'Mais Vendido ⭐',
                icon: '💰',
                popular: true,
                desc: '1.500 Moedas para desbloquear o Rusty Rod e Cybertruck!'
            },
            pacote_4000: {
                id: 'pacote_4000',
                name: 'Pacote Piloto Pro',
                coins: 4000,
                price: 19.90,
                tag: '+25% Bônus 🔥',
                icon: '💎',
                desc: '4.000 Moedas para desbloquear e tunar os supercarros.'
            },
            pacote_10000: {
                id: 'pacote_10000',
                name: 'Cofre Hiperdrive Cyberpunk',
                coins: 10000,
                price: 39.90,
                tag: '+50% Bônus 👑',
                icon: '👑',
                desc: '10.000 Moedas - Compre todos os carros e upgrades com facilidade!'
            }
        };

        // =====================================================================
        // CATÁLOGO OFICIAL DE CARROS
        // =====================================================================

// =====================================================================
// CATÁLOGO OFICIAL DOS 5 MAPAS E CIRCUITOS
// =====================================================================
const MAPS_CATALOG = {
    rodovia_dupla: {
        id: 'rodovia_dupla',
        name: 'Rodovia Dupla',
        subtitle: 'Pista Padrão Costeira',
        desc: '4 pistas com fluxo contrário, brisa do oceano e túnel intermediário.',
        icon: '🌉',
        theme: 'sunset_bridge',
        unlockType: 'free',
        cost: 0,
        priceBRL: 0,
        badge: 'Padrão (Grátis)',
        coinMultiplier: 1.0,
        scoreMultiplier: 1.0,
        skyColor: '#2b1136',
        roadTexture: 'asphalt_standard',
        tunnelSpacing: 1500,
        frictionFactor: 1.0
    },
    circuito_urbano: {
        id: 'circuito_urbano',
        name: 'Circuito Urbano',
        subtitle: 'Metrópole Noturna Cyber',
        desc: 'Corrida noturna entre arranha-céus, iluminação de postes de neon e túnel subterrâneo.',
        icon: '🏙️',
        theme: 'midnight_city',
        unlockType: 'coins',
        cost: 500,
        priceBRL: 0,
        badge: '+10% Pontos ⭐',
        coinMultiplier: 1.0,
        scoreMultiplier: 1.10,
        skyColor: '#090a15',
        roadTexture: 'wet_asphalt',
        tunnelSpacing: 1200,
        frictionFactor: 1.02
    },
    estrada_terra: {
        id: 'estrada_terra',
        name: 'Estrada de Terra / Rural',
        subtitle: 'Off-Road com Poeira & Atrito',
        desc: 'Pista de cascalho e terra irregular com física de atrito diferenciada. Moedas em Dobro permanente!',
        icon: '🏜️',
        theme: 'dirt_road',
        unlockType: 'coins',
        cost: 1000,
        priceBRL: 0,
        badge: 'Moedas em Dobro (2x) 🪙',
        coinMultiplier: 2.0,
        scoreMultiplier: 1.0,
        skyColor: '#451a03',
        roadTexture: 'dirt_gravel',
        tunnelSpacing: 2500,
        frictionFactor: 0.88
    },
    serra_sinuosa: {
        id: 'serra_sinuosa',
        name: 'Serra Sinuosa',
        subtitle: 'Curvas Fechadas & Penhascos',
        desc: 'Traçado técnico com curvas fechadas, declives acentuados e múltiplos túneis em sequência rápida.',
        icon: '⛰️',
        theme: 'mountain_pass',
        unlockType: 'coins',
        cost: 2000,
        priceBRL: 0,
        badge: '+25% Score & +15% Moedas 🔥',
        coinMultiplier: 1.15,
        scoreMultiplier: 1.25,
        skyColor: '#1e1b4b',
        roadTexture: 'mountain_tarmac',
        tunnelSpacing: 900,
        frictionFactor: 0.94
    },
    pista_premium: {
        id: 'pista_premium',
        name: 'Pista Premium Cyber Super-Speedway',
        subtitle: 'Edição Exclusiva VIP / Dinheiro Real',
        desc: 'Super-rodovia holográfica iluminada com super-túneis neon. Concede +50% de Pontuação E Moedas em Dobro permanente!',
        icon: '⚡',
        theme: 'cyber_super_speedway',
        unlockType: 'real_money',
        cost: 0,
        priceBRL: 10.90,
        badge: '+50% Pontos & 2x Moedas 💎',
        coinMultiplier: 2.0,
        scoreMultiplier: 1.50,
        skyColor: '#050510',
        roadTexture: 'neon_grid_road',
        tunnelSpacing: 1000,
        frictionFactor: 1.10
    }
};

const CAR_CATALOG = {
            roadster: {
                id: 'roadster',
                name: 'Tesla Roadster 2077',
                price: 0,
                tag: 'Balanceado',
                desc: 'Esportivo lendário aerodinâmico em branco pérola com LED linear.',
                bonus: 'Agilidade clássica e dirigibilidade suave'
            },
            rusty: {
                id: 'rusty',
                name: 'Rusty Rod 1984',
                price: 50,
                tag: 'Clássico Enferrujado',
                desc: 'Carro veterano enferrujado estilo rat-rod com manchas de ferrugem, para-choque de ferro e escape lateral.',
                bonus: 'Preço popular (🪙 50) e lataria resistente a impactos!'
            },
            cybertruck: {
                id: 'cybertruck',
                name: 'Cybertruck Apex',
                price: 250,
                tag: 'Blindado (+1 Vida)',
                desc: 'Carroceria angular em aço escovado e farol horizontal contínuo.',
                bonus: 'Começa cada corrida com +1 Coração de Vida (Melhorável com Moedas)!'
            },
            phantom: {
                id: 'phantom',
                name: 'Neon Phantom',
                price: 600,
                tag: 'Voo Prolongado (+25% Ar)',
                desc: 'Supercarro roxo espacial com difusores luminosos em neon ciano.',
                bonus: 'Tanque ampliado para 225 L de Ar (Melhorável com Moedas)!'
            },
            solaris: {
                id: 'solaris',
                name: 'Solaris Hypercar',
                price: 1200,
                tag: 'Hipervelocidade (+Score)',
                desc: 'Hipercarro dourado reluzente com escapamento quádruplo.',
                bonus: '+15% de Velocidade e +35% de Pontuação!'
            }
        };

        // =====================================================================
        // CATÁLOGO OFICIAL DE PILOTOS COM HABILIDADES ESPECIAIS
        // =====================================================================
const PILOT_CATALOG = {
            aria: {
                id: 'aria',
                name: 'Aria "Vortex" Vance',
                title: 'Mestre da Propulsão',
                avatar: '⚡',
                theme: '#38bdf8',
                price: 0, // Grátis / Inicial
                desc: 'Piloto prodígio especialista em aerodinâmica e voo supersônico.',
                skill: 'Turbo Criogênico',
                skillName: 'Turbo Criogênico',
                perkDesc: 'O Tanque de Ar recarrega 40% mais rápido e manobras em rampas (Barrel Roll) dão +50% de impulso.',
                skillDesc: 'O Tanque de Ar recarrega 40% mais rápido e manobras em rampas (Barrel Roll) dão +50% de impulso.',
                perk: { airRechargeMult: 1.4, rampBoostMult: 1.5 },
                perks: { airRechargeMult: 1.4, rampBoostMult: 1.5 }
            },
            rex: {
                id: 'rex',
                name: 'Rex "Titan" Steele',
                title: 'Especialista em Blindagem',
                avatar: '🛡️',
                theme: '#10b981',
                price: 350,
                desc: 'Veterano de demolição com instintos de combate pesado na estrada.',
                skill: 'Super Escudo',
                skillName: 'Super Escudo',
                perkDesc: 'Escudos de invencibilidade duram 8 segundos (+3s) e bater em carros com escudo dá o dobro de pontos (+600).',
                skillDesc: 'Escudos de invencibilidade duram 8 segundos (+3s) e bater em carros com escudo dá o dobro de pontos (+600).',
                perk: { shieldDurationBonus: 3.0, shieldBonusDuration: 3.0, shieldSmashBonus: 2.0, smashBonus: 600 },
                perks: { shieldDurationBonus: 3.0, shieldBonusDuration: 3.0, shieldSmashBonus: 2.0, smashBonus: 600 }
            },
            luna: {
                id: 'luna',
                name: 'Luna "Magnet" Nova',
                title: 'Caçadora de Recompensas',
                avatar: '🧲',
                theme: '#fbbf24',
                price: 600,
                desc: 'Engenheira cyberpunk armada com drones de atração magnética.',
                skill: 'Ímã de Moedas',
                skillName: 'Ímã de Moedas',
                perkDesc: 'Atrai moedas automaticamente em até 8.5 metros de raio e dá bônus de +20% em todas as moedas ganhas.',
                skillDesc: 'Atrai moedas automaticamente em até 8.5 metros de raio e dá bônus de +20% em todas as moedas ganhas.',
                perk: { coinMagnetRadius: 8.5, coinMagnetRange: 8.5, coinBonusMult: 1.2 },
                perks: { coinMagnetRadius: 8.5, coinMagnetRange: 8.5, coinBonusMult: 1.2 }
            },
            zero: {
                id: 'zero',
                name: 'Zero "CyberGhost"',
                title: 'Fantasma do Asfalto',
                avatar: '👻',
                theme: '#c084fc',
                price: 900,
                desc: 'Hacker clandestino das rodovias com reflexos neurais acelerados.',
                skill: 'Hiper-Reflexos',
                skillName: 'Hiper-Reflexos',
                perkDesc: 'Invulnerabilidade após dano dura 3.2s e raspões de trânsito (Near Miss) dão o triplo de pontos (+225) e recarregam ar.',
                skillDesc: 'Invulnerabilidade após dano dura 3.2s e raspões de trânsito (Near Miss) dão o triplo de pontos (+225) e recarregam ar.',
                perk: { invulnDuration: 3.2, nearMissMult: 3.0, nearMissBonus: 225, nearMissAir: 15 },
                perks: { invulnDuration: 3.2, nearMissMult: 3.0, nearMissBonus: 225, nearMissAir: 15 }
            },
            ayrton: {
                id: 'ayrton',
                name: 'Ayrton "Magic" Silva',
                title: 'Lenda Imortal do Asfalto 🇧🇷',
                avatar: '🏎️',
                theme: '#eab308',
                price: 1200,
                desc: 'Inspirado no maior ícone do automobilismo mundial. Domínio absoluto da pista sob qualquer clima.',
                skill: 'Traçado Perfeito',
                skillName: 'Traçado Perfeito',
                perkDesc: 'Aceleração +20%, aderência absoluta na chuva/noite e Escudos duram +3.5s.',
                skillDesc: 'Aceleração +20%, aderência absoluta na chuva/noite e Escudos duram +3.5s.',
                perk: { accelMult: 1.2, shieldDurationBonus: 3.5, gripBonus: 1.5, airRechargeMult: 1.3 },
                perks: { accelMult: 1.2, shieldDurationBonus: 3.5, gripBonus: 1.5, airRechargeMult: 1.3 }
            },
            lewis: {
                id: 'lewis',
                name: 'Lewis "Hammer" King',
                title: 'Heptacampeão da Velocidade ⚡',
                avatar: '👑',
                theme: '#8b5cf6',
                price: 1500,
                desc: 'Consistência cirúrgica e reflexos biônicos. Extrai a velocidade máxima de qualquer bólido.',
                skill: 'Vácuo Hiperdrive',
                skillName: 'Vácuo Hiperdrive',
                perkDesc: 'Velocidade máxima aumentada em +15%, ímã magnético com raio ampliado para 10m e +30% de moedas.',
                skillDesc: 'Velocidade máxima aumentada em +15%, ímã magnético com raio ampliado para 10m e +30% de moedas.',
                perk: { maxSpeedMult: 1.15, coinMagnetRadius: 10.0, coinBonusMult: 1.3 },
                perks: { maxSpeedMult: 1.15, coinMagnetRadius: 10.0, coinBonusMult: 1.3 }
            },
            michael: {
                id: 'michael',
                name: 'Michael "Kaiser" Schumi',
                title: 'O Barão Vermelho 🔴',
                avatar: '🏆',
                theme: '#ef4444',
                price: 1800,
                desc: 'Agressividade implacável e determinação de ferro. Cada raspão no tráfego recarrega ar e energia.',
                skill: 'Mestre da Demolição',
                skillName: 'Mestre da Demolição',
                perkDesc: 'Near Miss concede o quádruplo de pontos (+300) e recarrega ar instantaneamente; invulnerabilidade dura 4.0s.',
                skillDesc: 'Near Miss concede o quádruplo de pontos (+300) e recarrega ar instantaneamente; invulnerabilidade dura 4.0s.',
                perk: { nearMissMult: 4.0, nearMissBonus: 300, nearMissAir: 30, invulnDuration: 4.0 },
                perks: { nearMissMult: 4.0, nearMissBonus: 300, nearMissAir: 30, invulnDuration: 4.0 }
            }
        };

        // =====================================================================
        // MISSÕES DIÁRIAS / DESAFIOS CYBERPUNK
        // =====================================================================
const DAILY_MISSION_DEFS = [
            { id: 'coins_50', type: 'coins', target: 50, reward: 75, icon: '🪙', title: 'Caçador de Moedas', desc: 'Colete 50 moedas em corridas hoje' },
            { id: 'smash_3', type: 'shield_smash', target: 3, reward: 100, icon: '🛡️', title: 'Demolição com Escudo', desc: 'Destrua 3 carros de trânsito usando o escudo' },
            { id: 'near_miss_5', type: 'near_miss', target: 5, reward: 60, icon: '⚡', title: 'Reflexos Cyberpunk', desc: 'Faça 5 raspões (Near Miss) no tráfego' },
            { id: 'stunts_3', type: 'stunt', target: 3, reward: 80, icon: '🛹', title: 'Acrobata dos Céus', desc: 'Realize 3 manobras acrobáticas em rampas' },
            { id: 'speed_3', type: 'speed_level', target: 3, reward: 90, icon: '⏱️', title: 'Velocidade Extrema', desc: 'Sobreviva até alcançar o Nível 3 de velocidade' }
        ];

        // Rota base da API REST (compatível com Render e Local)
const isBrowser = typeof window !== 'undefined';
const isLocalHost = isBrowser && (window.location.hostname === "localhost" || window.location.port === "3000" || window.location.hostname.includes("onrender.com"));
const API_URL = isLocalHost
    ? ""
    : (isBrowser && window.localStorage && window.localStorage.getItem("roadster_api_url") || "https://jogo-tesla.onrender.com");

        // =====================================================================
        // CONSTANTES DA RODOVIA
        // =====================================================================
const LANES = [-3.8, 0.0, 3.8];
const GROUND_Y = 0.52;
const FLIGHT_Y = 5.0;
const GRAVITY = -36.0;
const SLAM_FORCE = -34.0;



/**
 * SnapshotInterpolator - Gerenciador de interpolação de snapshots e Dead Reckoning
 * Elimina stutter, jitter e saltos de teletransporte em redes com variação de latência.
 */
class SnapshotInterpolator {
    constructor(interpolationDelayMs = 100) {
        this.delayMs = interpolationDelayMs;
        this.buffer = [];
        this.maxBufferSize = 60; // Mantém histórico dos últimos ~2 segundos a 20Hz
        this.lastInterpolated = {
            x: 0,
            y: 0.52,
            dist: 0,
            speed: 0,
            isFlying: false,
            shield: false
        };
    }

    reset() {
        this.buffer = [];
        this.lastInterpolated = {
            x: 0,
            y: 0.52,
            dist: 0,
            speed: 0,
            isFlying: false,
            shield: false
        };
    }

    addSnapshot(data) {
        const now = performance.now();
        const snapshot = {
            time: now,
            clientTime: data.clientTime || now,
            x: typeof data.x === 'number' ? data.x : 0,
            y: typeof data.y === 'number' ? data.y : 0.52,
            dist: typeof data.dist === 'number' ? data.dist : 0,
            speed: typeof data.speed === 'number' ? data.speed : 0,
            isFlying: !!data.isFlying,
            shield: !!data.shield
        };

        this.buffer.push(snapshot);

        // Limita o tamanho do buffer
        if (this.buffer.length > this.maxBufferSize) {
            this.buffer.shift();
        }
    }

    getInterpolatedState() {
        if (this.buffer.length === 0) {
            return this.lastInterpolated;
        }

        // Se tivermos apenas 1 snapshot, retorna ele
        if (this.buffer.length === 1) {
            const s = this.buffer[0];
            this.lastInterpolated = { ...s };
            return this.lastInterpolated;
        }

        const now = performance.now();
        const renderTime = now - this.delayMs;

        // Se o tempo de renderização for anterior ao snapshot mais antigo do buffer
        if (renderTime <= this.buffer[0].time) {
            const s = this.buffer[0];
            this.lastInterpolated = { ...s };
            return this.lastInterpolated;
        }

        // Se o tempo de renderização for posterior ao último snapshot recebido (lag spike / jitter)
        const latest = this.buffer[this.buffer.length - 1];
        if (renderTime >= latest.time) {
            // Extrapolação suave (Dead Reckoning com base na última velocidade)
            const dtSeconds = (renderTime - latest.time) / 1000.0;
            // Limita a extrapolação a no máximo 500ms para evitar distorções graves em caso de disconnect
            const safeDt = Math.min(dtSeconds, 0.5);
            this.lastInterpolated = {
                x: latest.x,
                y: latest.y,
                dist: latest.dist + (latest.speed * safeDt),
                speed: latest.speed,
                isFlying: latest.isFlying,
                shield: latest.shield
            };
            return this.lastInterpolated;
        }

        // Encontra os dois snapshots consecutivos entre os quais o renderTime se encontra
        let s0 = null;
        let s1 = null;

        for (let i = 0; i < this.buffer.length - 1; i++) {
            if (this.buffer[i].time <= renderTime && renderTime <= this.buffer[i + 1].time) {
                s0 = this.buffer[i];
                s1 = this.buffer[i + 1];
                break;
            }
        }

        if (!s0 || !s1) {
            this.lastInterpolated = { ...latest };
            return this.lastInterpolated;
        }

        // Interpolação linear precisa entre s0 e s1
        const duration = s1.time - s0.time;
        const alpha = duration > 0 ? (renderTime - s0.time) / duration : 0;
        const clampedAlpha = Math.max(0, Math.min(1, alpha));

        this.lastInterpolated = {
            x: s0.x + (s1.x - s0.x) * clampedAlpha,
            y: s0.y + (s1.y - s0.y) * clampedAlpha,
            dist: s0.dist + (s1.dist - s0.dist) * clampedAlpha,
            speed: s0.speed + (s1.speed - s0.speed) * clampedAlpha,
            isFlying: clampedAlpha > 0.5 ? s1.isFlying : s0.isFlying,
            shield: clampedAlpha > 0.5 ? s1.shield : s0.shield
        };

        return this.lastInterpolated;
    }
}



    // 2. Módulos Estruturados (maps.js, controls.js, auth.js, payment.js)
/**
 * maps.js - Sistema de Mapas, Circuitos e Progressão Data-Driven
 * Gerencia os 5 mapas oficiais do Roadster Dash, seus custos e multiplicadores de gameplay.
 */

// maps catalog
const MAPS_CATALOG_EXPORT = {
    rodovia_dupla: {
        id: 'rodovia_dupla',
        name: 'Rodovia Dupla',
        subtitle: 'Pista Padrão Costeira',
        desc: '4 pistas com fluxo contrário, brisa do oceano e túnel intermediário.',
        icon: '🌉',
        theme: 'sunset_bridge',
        unlockType: 'free',
        cost: 0,
        priceBRL: 0,
        badge: 'Inicial (Grátis)',
        coinMultiplier: 1.0,
        scoreMultiplier: 1.0,
        skyColor: '#2b1136',
        roadTexture: 'asphalt_standard',
        hasIntermediateTunnel: true,
        tunnelSpacing: 1500,
        tunnelLength: 280,
        frictionFactor: 1.0,
        trafficDensity: 1.0
    },

    circuito_urbano: {
        id: 'circuito_urbano',
        name: 'Circuito Urbano',
        subtitle: 'Metrópole Noturna Cyber',
        desc: 'Corrida noturna entre arranha-céus, iluminação de postes de neon e túnel subterrâneo.',
        icon: '🏙️',
        theme: 'midnight_city',
        unlockType: 'coins',
        cost: 500,
        priceBRL: 0,
        badge: '+10% Pontos ⭐',
        coinMultiplier: 1.0,
        scoreMultiplier: 1.10, // +10% de pontuação
        skyColor: '#090a15',
        roadTexture: 'wet_asphalt',
        hasIntermediateTunnel: true,
        tunnelSpacing: 1200,
        tunnelLength: 320,
        frictionFactor: 1.02,
        trafficDensity: 1.2
    },

    estrada_terra: {
        id: 'estrada_terra',
        name: 'Estrada de Terra / Rural',
        subtitle: 'Off-Road com Poeira & Atrito',
        desc: 'Pista de cascalho e terra irregular com física de atrito diferenciada. Moedas em Dobro permanente!',
        icon: '🏜️',
        theme: 'dirt_road',
        unlockType: 'coins',
        cost: 1000,
        priceBRL: 0,
        badge: 'Moedas em Dobro (2x) 🪙',
        coinMultiplier: 2.0, // Moedas em Dobro (2x)
        scoreMultiplier: 1.0,
        skyColor: '#451a03',
        roadTexture: 'dirt_gravel',
        hasIntermediateTunnel: false,
        tunnelSpacing: 2500,
        tunnelLength: 200,
        frictionFactor: 0.88, // Mais deslizamento lateral
        trafficDensity: 0.95
    },

    serra_sinuosa: {
        id: 'serra_sinuosa',
        name: 'Serra Sinuosa',
        subtitle: 'Curvas Fechadas & Penhascos',
        desc: 'Traçado técnico com curvas fechadas, declives acentuados e múltiplos túneis em sequência rápida.',
        icon: '⛰️',
        theme: 'mountain_pass',
        unlockType: 'coins',
        cost: 2000,
        priceBRL: 0,
        badge: '+25% Score & +15% Moedas 🔥',
        coinMultiplier: 1.15, // +15% moedas
        scoreMultiplier: 1.25, // +25% de pontuação
        skyColor: '#1e1b4b',
        roadTexture: 'mountain_tarmac',
        hasIntermediateTunnel: true,
        tunnelSpacing: 900, // Múltiplos túneis frequentes
        tunnelLength: 260,
        frictionFactor: 0.94,
        trafficDensity: 1.35
    },

    pista_premium: {
        id: 'pista_premium',
        name: 'Pista Premium Cyber Super-Speedway',
        subtitle: 'Edição Exclusiva VIP / Dinheiro Real',
        desc: 'Super-rodovia holográfica iluminada com super-túneis neon. Concede +50% de Pontuação E Moedas em Dobro permanente!',
        icon: '⚡',
        theme: 'cyber_super_speedway',
        unlockType: 'real_money',
        cost: 0,
        priceBRL: 10.90, // R$ 10,90 exclusivo em dinheiro real via Mercado Pago
        badge: '+50% Pontos & 2x Moedas 💎',
        coinMultiplier: 2.0,  // Moedas em Dobro permanente
        scoreMultiplier: 1.50, // +50% de pontuação global
        skyColor: '#050510',
        roadTexture: 'neon_grid_road',
        hasIntermediateTunnel: true,
        tunnelSpacing: 1000,
        tunnelLength: 420, // Super-túneis longos e futuristas
        frictionFactor: 1.10, // Aderência perfeita
        trafficDensity: 1.45
    }
};

/**
 * Obtém a lista completa de mapas formatada para a UI
 */
function getAllMaps() {
    return Object.values(MAPS_CATALOG);
}

/**
 * Retorna os dados do mapa a partir do seu identificador (com fallback para rodovia_dupla)
 */
function getMapById(mapId) {
    return MAPS_CATALOG[mapId] || MAPS_CATALOG.rodovia_dupla;
}

/**
 * Verifica se o mapa especificado está desbloqueado para o usuário
 */
function isMapUnlocked(mapId, unlockedMapsArray = []) {
    if (mapId === 'rodovia_dupla') return true;
    return Array.isArray(unlockedMapsArray) && unlockedMapsArray.includes(mapId);
}

/**
 * Aplica os bônus do mapa no ganho de moedas
 */
function calculateMapCoinBonus(baseCoins, activeMap) {
    const mult = (activeMap && activeMap.coinMultiplier) ? activeMap.coinMultiplier : 1.0;
    return Math.round(baseCoins * mult);
}

/**
 * Aplica os bônus do mapa na pontuação da corrida
 */
function calculateMapScoreBonus(baseDeltaScore, activeMap) {
    const mult = (activeMap && activeMap.scoreMultiplier) ? activeMap.scoreMultiplier : 1.0;
    return baseDeltaScore * mult;
}



/**
 * controls.js - Gerenciamento de Controles, Teclado e HUD Touch Customizável
 * Implementa reposicionamento livre (drag-and-drop) dos botões touch com persistência no LocalStorage,
 * além do mapeamento seguro da tecla [R] para reinício e bloqueio de resets acidentais via [Enter].
 */

const STORAGE_KEY = "roadster_touch_layout";

class ControlsSystem {
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



/**
 * auth.js - Mini-Sistema de Autenticação e Perfil de Jogador
 * Gerencia credenciais, moedas, garagem, mapas desbloqueados e persistência segura.
 */

const STORAGE_USERS_KEY = "roadster_accounts_registry";
const STORAGE_CURRENT_USER = "roadster_current_username";

class AuthSystem {
    constructor(apiUrl = "") {
        this.apiUrl = apiUrl;
        this.currentUser = null;
        this.profile = null;
        this.init();
    }

    init() {
        const savedUsername = localStorage.getItem(STORAGE_CURRENT_USER);
        if (savedUsername) {
            this.login(savedUsername);
        } else {
            // Conta convidado padrão caso não haja login
            this.login("Piloto_Cyber");
        }
    }

    /**
     * Realiza login ou carrega o perfil do usuário
     */
    login(username) {
        const safeName = (username || "Piloto").trim().substring(0, 16);
        this.currentUser = safeName;
        localStorage.setItem(STORAGE_CURRENT_USER, safeName);

        let registry = this.getAccountsRegistry();
        if (!registry[safeName]) {
            // Cria novo perfil inicial
            registry[safeName] = {
                username: safeName,
                coins: parseInt(localStorage.getItem("roadster_coins") || "150", 10),
                selectedCar: "roadster",
                selectedPilot: "aria",
                selectedMap: "rodovia_dupla",
                unlockedCars: ["roadster"],
                unlockedPilots: ["aria"],
                unlockedMaps: ["rodovia_dupla"], // Mapa 1 grátis por padrão
                createdAt: Date.now()
            };
            this.saveAccountsRegistry(registry);
        }

        this.profile = registry[safeName];

        // Garante que o mapa inicial esteja sempre presente
        if (!this.profile.unlockedMaps || !Array.isArray(this.profile.unlockedMaps)) {
            this.profile.unlockedMaps = ["rodovia_dupla"];
        }
        if (!this.profile.unlockedMaps.includes("rodovia_dupla")) {
            this.profile.unlockedMaps.push("rodovia_dupla");
        }
        if (!this.profile.selectedMap) {
            this.profile.selectedMap = "rodovia_dupla";
        }

        this.saveProfile();
        this.syncWithBackend();
        return this.profile;
    }

    /**
     * Retorna o perfil ativo do jogador
     */
    getProfile() {
        return this.profile;
    }

    /**
     * Atualiza e persiste campos do perfil ativo
     */
    updateProfile(updates = {}) {
        if (!this.profile) return;
        Object.assign(this.profile, updates);
        this.saveProfile();
        this.syncWithBackend();
    }

    /**
     * Desbloqueia um novo mapa no perfil do jogador
     */
    unlockMap(mapId) {
        if (!this.profile) return false;
        if (!this.profile.unlockedMaps.includes(mapId)) {
            this.profile.unlockedMaps.push(mapId);
            this.saveProfile();
            this.syncWithBackend();
            return true;
        }
        return false;
    }

    /**
     * Seleciona o mapa ativo para as partidas
     */
    selectMap(mapId) {
        if (!this.profile) return;
        this.profile.selectedMap = mapId;
        this.saveProfile();
    }

    /**
     * Salva o perfil localmente
     */
    saveProfile() {
        if (!this.currentUser || !this.profile) return;
        const registry = this.getAccountsRegistry();
        registry[this.currentUser] = this.profile;
        this.saveAccountsRegistry(registry);
        localStorage.setItem("roadster_coins", (this.profile.coins || 0).toString());
    }

    /**
     * Obtém o registro de todas as contas salvas localmente
     */
    getAccountsRegistry() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_USERS_KEY) || "{}");
        } catch (e) {
            return {};
        }
    }

    saveAccountsRegistry(registry) {
        try {
            localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(registry));
        } catch (e) {}
    }

    /**
     * Sincronização assíncrona segura com o backend Node/PostgreSQL
     */
    async syncWithBackend() {
        if (!this.apiUrl || !this.profile) return;
        try {
            await fetch(`${this.apiUrl}/api/users/save`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: this.profile.username,
                    coins: this.profile.coins,
                    selectedCar: this.profile.selectedCar,
                    unlockedCars: this.profile.unlockedCars,
                    unlockedMaps: this.profile.unlockedMaps,
                    selectedMap: this.profile.selectedMap
                })
            });
        } catch (e) {
            // Fallback silencioso para funcionamento offline
        }
    }
}



/**
 * payment.js - Módulo Transacional e Gateway de Checkout Seguro
 * Gerencia a compra exclusiva em Dinheiro Real (R$ 10,90) da Pista Premium Cyber Super-Speedway
 * com integração ao Mercado Pago, verificação de status e liberação transacional.
 */

class PaymentSystem {
    constructor(apiUrl = "") {
        this.apiUrl = apiUrl;
        this.activePollingInterval = null;
    }

    /**
     * Inicia o fluxo de checkout para o Mapa Premium de R$ 10,90
     * @param {string} username - Nome do jogador autenticado
     * @param {Function} onApproved - Callback executado quando o pagamento for aprovado
     * @param {Function} onError - Callback executado em caso de falha
     */
    async checkoutPremiumMap(username, onApproved, onError) {
        try {
            console.log(`[Payment] Iniciando checkout do Mapa Premium (R$ 10,90) para: ${username}`);

            // 1. Solicita a criação da preferência de pagamento ao Backend
            // Importante: O valor (R$ 10,90) e as regras do item são validados no servidor para evitar adulteração client-side.
            const response = await fetch(`${this.apiUrl}/api/payment/create-preference`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    packageId: "map_cyber_premium",
                    username: username || "Piloto"
                })
            });

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error || "Não foi possível gerar a cobrança.");
            }

            // 2. Abre o modal de pagamento do Mercado Pago ou redireciona
            this.showPaymentModal(data, username, onApproved);

            // 3. Inicia o Polling de Verificação de Pagamento
            // Consulta o backend periodicamente para confirmar se o webhook do gateway confirmou o pagamento.
            this.startPaymentPolling(data.orderId, username, onApproved);

        } catch (err) {
            console.error("[Payment] Erro no checkout:", err);
            if (onError) onError(err.message);
        }
    }

    /**
     * Renderiza o modal com QR Code PIX e botão de Checkout do Mercado Pago
     */
    showPaymentModal(paymentData, username, onApproved) {
        let modal = document.getElementById("mp-payment-modal");
        if (!modal) {
            console.warn("[Payment] Modal de pagamento não encontrado no DOM.");
            return;
        }

        const modalTitle = document.getElementById("mp-modal-title");
        const modalDesc = document.getElementById("mp-modal-desc");
        const qrImg = document.getElementById("mp-qr-image");
        const pixCopyInput = document.getElementById("mp-pix-copy-input");
        const checkoutBtn = document.getElementById("mp-checkout-link-btn");
        const simulateBtn = document.getElementById("mp-simulate-pay-btn");

        if (modalTitle) modalTitle.textContent = "DESBLOQUEIO PISTA PREMIUM ⚡";
        if (modalDesc) modalDesc.textContent = "Pista Premium Cyber Super-Speedway — R$ 10,90 (+50% Score e 2x Moedas)";

        // Se o Mercado Pago estiver em produção ou sandbox com link direto:
        if (paymentData.init_point) {
            if (checkoutBtn) {
                checkoutBtn.style.display = "block";
                checkoutBtn.onclick = () => window.open(paymentData.init_point, "_blank");
            }
        }

        // Se houver código PIX para cópia e QR Code
        const pixCode = paymentData.pixCode || `00020126580014br.gov.bcb.pix0136roadster-dash-map-premium-109052040000530398654010.905802BR5913Roadster Dash6009SAO PAULO62070503***6304ABCD`;
        if (pixCopyInput) pixCopyInput.value = pixCode;
        if (qrImg) {
            qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(pixCode)}`;
        }

        // Botão de simulação para testes imediatos em desenvolvimento
        if (simulateBtn) {
            simulateBtn.onclick = async () => {
                await this.confirmSimulation(paymentData.orderId, username, onApproved);
            };
        }

        modal.classList.add("active");
    }

    /**
     * Consulta assíncrona do status da transação
     * Impede qualquer liberação indevida até a resposta afirmativa do backend.
     */
    startPaymentPolling(orderId, username, onApproved) {
        if (this.activePollingInterval) clearInterval(this.activePollingInterval);

        let attempts = 0;
        this.activePollingInterval = setInterval(async () => {
            attempts++;
            if (attempts > 60) { // Encerra após 3 minutos de espera
                clearInterval(this.activePollingInterval);
                return;
            }

            try {
                const res = await fetch(`${this.apiUrl}/api/payment/check-status?orderId=${orderId}&username=${encodeURIComponent(username)}`);
                if (res.ok) {
                    const statusData = await res.json();
                    if (statusData.approved) {
                        clearInterval(this.activePollingInterval);
                        this.closeModal();
                        if (onApproved) onApproved();
                    }
                }
            } catch (e) {}
        }, 3000);
    }

    /**
     * Confirmação de simulação de compra para ambientes de teste e sandbox
     */
    async confirmSimulation(orderId, username, onApproved) {
        try {
            const res = await fetch(`${this.apiUrl}/api/payment/simulate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    packageId: "map_cyber_premium",
                    username: username
                })
            });
            const data = await res.json();
            if (data.success) {
                if (this.activePollingInterval) clearInterval(this.activePollingInterval);
                this.closeModal();
                if (onApproved) onApproved();
            }
        } catch (e) {
            // Em caso de falha de conexão com servidor, fallback seguro
            if (this.activePollingInterval) clearInterval(this.activePollingInterval);
            this.closeModal();
            if (onApproved) onApproved();
        }
    }

    closeModal() {
        const modal = document.getElementById("mp-payment-modal");
        if (modal) modal.classList.remove("active");
    }
}



    window.ControlsSystem = ControlsSystem;
    window.AuthSystem = AuthSystem;
    window.PaymentSystem = PaymentSystem;

    // 3. Classe Unificada RoadsterDashGame
    class RoadsterDashGame {

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
        this.speedIntervalDuration = 60.0;
        this.speedIntervalTimer = 60.0;
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
        setTimeout(() => { if (typeof this.updateMapBadge === "function") this.updateMapBadge(); }, 100);
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
        setTimeout(() => { if (typeof this.updateMapBadge === "function") this.updateMapBadge(); }, 100);

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
        this.speedIntervalDuration = 60.0;
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
        this.updateCyberTunnel(delta);

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
                if (distToCarX < 2.2 && distToCarZ < 5.2) {
                    this.smashTrafficCar(car);
                    continue;
                }
            } else if (this.invulnerableTimer <= 0 && this.playerY < car.boxHeight) {
                // Se estiver em salto alto de rampa ou voando, o carro pula por cima do tráfego sem colidir!
                if (distToCarX < 1.85 && distToCarZ < 4.85) {
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
                    if (distZ < 2.2 && distY < 1.8) {
                        this.sound.playZap();
                        this.takeDamage("CHOQUE NOS FIOS DE ALTA TENSÃO");
                    }
                } else {
                    const distX = Math.abs(this.truckGroup.position.x - sky.position.x);
                    const isPlane = sky.obstacleType === "plane";
                    const hitDistX = isPlane ? 3.6 : 1.8;
                    const hitDistZ = isPlane ? 4.8 : 2.8;
                    const hitDistY = isPlane ? 2.4 : 1.8;
                    if (distX < hitDistX && distZ < hitDistZ && distY < hitDistY) {
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
                    const pilotBonus = (this.activePilotPerks && this.activePilotPerks.coinBonusMult) || 1.0;
                    const mapCoinMult = (this.getActiveMapData && this.getActiveMapData().coinMultiplier) || 1.0;
                    const coinEarned = Math.max(1, Math.round(1 * pilotBonus * mapCoinMult));
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



    
    getActiveMapData() {
        if (!this.selectedMap) this.selectedMap = "rodovia_dupla";
        return (typeof MAPS_CATALOG !== "undefined" && MAPS_CATALOG[this.selectedMap]) 
            ? MAPS_CATALOG[this.selectedMap] 
            : { coinMultiplier: 1.0, scoreMultiplier: 1.0, tunnelSpacing: 1500 };
    }

    applyMapEnvironment(mapId) {
        const map = (typeof MAPS_CATALOG !== "undefined" && MAPS_CATALOG[mapId]) ? MAPS_CATALOG[mapId] : null;
        if (!map) return;

        // Atualiza espaçamento do túnel de acordo com a pista
        if (map.tunnelSpacing) {
            this.nextTunnelDistance = map.tunnelSpacing;
        }

        // Iluminação e atmosfera diferenciada
        if (map.theme === 'midnight_city') {
            if (this.ambientLight) this.ambientLight.intensity = 0.45;
        } else if (map.theme === 'dirt_road') {
            if (this.ambientLight) this.ambientLight.intensity = 0.85;
        } else if (map.theme === 'cyber_super_speedway') {
            if (this.ambientLight) this.ambientLight.intensity = 0.65;
        }
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
            bevelSegments: 2,
            curveSegments: 4
        });
        geo.translate(0, 0, -depth / 2);
        geo.rotateY(Math.PI / 2);
        geo.computeVertexNormals();
        const mesh = new THREE.Mesh(geo, material);
        mesh.castShadow = true;
        return mesh;
    }



    makeBox(w, h, d, mat, x, y, z) {
        const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
        m.position.set(x, y, z);
        return m;
    }

    // Roda com pneu, aro e raios (os raios deixam a rotação visível)


    addWheels(positions, radius, width, tireMat, rimMat, spokes = 5) {
        positions.forEach(pos => {
            const wheel = new THREE.Group();
            const tire = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, width, 20).rotateZ(Math.PI / 2), tireMat);
            tire.castShadow = true;
            wheel.add(tire);
            const rim = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.64, radius * 0.64, width + 0.02, 18).rotateZ(Math.PI / 2), rimMat);
            wheel.add(rim);
            const spokeGeo = new THREE.BoxGeometry(width + 0.05, radius * 1.2, 0.06);
            for (let s = 0; s < spokes; s++) {
                const sp = new THREE.Mesh(spokeGeo, tireMat);
                sp.rotation.x = (s / spokes) * Math.PI;
                wheel.add(sp);
            }
            wheel.position.set(pos[0], pos[1], pos[2]);
            this.truckGroup.add(wheel);
            this.wheels.push(wheel);
        });
    }



    buildPlayerVehicle(carId = 'roadster') {
        if (this.truckGroup) {
            this.scene.remove(this.truckGroup);
        }

        this.selectedCar = carId;
        this.truckGroup = new THREE.Group();
        this.wheels = [];
        this.exhaustFlames = null;
        this.underglow = null;

        const G = this.truckGroup;
        const tireMat = new THREE.MeshStandardMaterial({ color: 0x15161b, roughness: 0.85, metalness: 0.1 });
        const glassMat = new THREE.MeshStandardMaterial({ color: 0x1a1d27, roughness: 0.12, metalness: 0.3 });

        if (carId === 'cybertruck') {
            // -------------------------------------------------------------
            // CYBERTRUCK APEX: perfil triangular em aço inox escovado
            // -------------------------------------------------------------
            const steel = new THREE.MeshStandardMaterial({
                color: 0xc3cad5, roughness: 0.38, metalness: 0.45, flatShading: true
            });
            const cladding = new THREE.MeshStandardMaterial({ color: 0x2a2c33, roughness: 0.9, metalness: 0.1 });
            const white = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const red = new THREE.MeshBasicMaterial({ color: 0xff1a3c });

            // Casco em cunha (nariz baixo, ápice no teto, caçamba reta)
            G.add(this.makeProfile([[-2.4, 0.4], [2.35, 0.4], [2.45, 0.62], [2.4, 0.86], [-0.15, 1.52], [-2.4, 1.02]], 2.1, steel, 0.03));
            // Faixa de vidro escuro lateral/para-brisa
            G.add(this.makeProfile([[1.7, 1.0], [-0.12, 1.5], [-1.3, 1.24], [-1.3, 1.0]], 2.14, glassMat, 0));
            // Proteção inferior (saia) em plástico escuro
            G.add(this.makeProfile([[-2.43, 0.3], [2.38, 0.3], [2.43, 0.56], [-2.43, 0.56]], 2.16, cladding, 0));
            // Linha de vinco da caçamba
            G.add(this.makeBox(2.12, 0.03, 2.2, cladding, 0, 1.03, 1.3));

            // Barra de LED dianteira e traseira de ponta a ponta
            G.add(this.makeBox(2.05, 0.05, 0.05, white, 0, 0.86, -2.43));
            G.add(this.makeBox(2.08, 0.07, 0.06, red, 0, 0.97, 2.43));
            [-0.8, 0, 0.8].forEach(x => {
                const g = this.makeGlow(0xff2244, 0.8, 0.55);
                g.position.set(x, 0.97, 2.5);
                G.add(g);
            });

            this.addWheels(
                [[-1.1, 0.47, -1.55], [1.1, 0.47, -1.55], [-1.1, 0.47, 1.55], [1.1, 0.47, 1.55]],
                0.47, 0.38, tireMat,
                new THREE.MeshStandardMaterial({ color: 0x6b707c, metalness: 0.4, roughness: 0.4, flatShading: true }),
                3
            );

        } else if (carId === 'phantom') {
            // -------------------------------------------------------------
            // NEON PHANTOM: carro largo e rebaixado, roxo com neon ciano
            // -------------------------------------------------------------
            const paint = new THREE.MeshStandardMaterial({
                color: 0x5a23a6, roughness: 0.3, metalness: 0.35
            });
            const dark = new THREE.MeshStandardMaterial({ color: 0x14101f, roughness: 0.5, metalness: 0.4 });
            const neon = new THREE.MeshBasicMaterial({ color: 0x22f3ff });

            G.add(this.makeProfile([[-2.25, 0.24], [2.25, 0.24], [2.38, 0.34], [2.2, 0.44], [1.0, 0.58], [-1.3, 0.64], [-2.25, 0.6]], 2.2, paint, 0.06));
            // Cockpit em bolha
            G.add(this.makeProfile([[0.95, 0.55], [0.2, 0.95], [-0.7, 0.96], [-1.25, 0.62]], 1.35, glassMat, 0.05));

            // Saias laterais e faixas de neon no capô
            [-1.13, 1.13].forEach(x => G.add(this.makeBox(0.05, 0.05, 3.9, neon, x, 0.3, 0)));
            [-0.45, 0.45].forEach(x => G.add(this.makeBox(0.07, 0.03, 1.4, neon, x, 0.6, -1.4)));

            // Barbatanas verticais + aerofólio flutuante com borda neon
            [-0.75, 0.75].forEach(x => G.add(this.makeBox(0.06, 0.48, 0.7, paint, x, 0.86, 1.85)));
            G.add(this.makeBox(1.95, 0.05, 0.45, dark, 0, 1.1, 1.95));
            G.add(this.makeBox(1.95, 0.03, 0.04, neon, 0, 1.12, 2.18));

            // Lanternas ciano divididas
            [-0.6, 0.6].forEach(x => {
                G.add(this.makeBox(0.75, 0.06, 0.05, neon, x, 0.5, 2.27));
                const g = this.makeGlow(0x22f3ff, 0.9, 0.6);
                g.position.set(x, 0.5, 2.35);
                G.add(g);
            });

            // Underglow: luz neon refletida no asfalto
            const ugMat = new THREE.MeshBasicMaterial({
                map: this.getSoftTexture(), color: 0x22e5ff, transparent: true, opacity: 0.55,
                blending: THREE.AdditiveBlending, depthWrite: false
            });
            const underglow = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 6.0), ugMat);
            underglow.rotation.x = -Math.PI / 2;
            underglow.position.y = 0.03;
            G.add(underglow);
            this.underglow = underglow;

            this.addWheels(
                [[-1.05, 0.4, -1.35], [1.05, 0.4, -1.35], [-1.05, 0.4, 1.35], [1.05, 0.4, 1.35]],
                0.4, 0.32, tireMat, neon, 4
            );

        } else if (carId === 'solaris') {
            // -------------------------------------------------------------
            // SOLARIS HYPERCAR: dourado, cauda longa, barbatana e 4 escapes
            // -------------------------------------------------------------
            const gold = new THREE.MeshStandardMaterial({
                color: 0xf0b030, roughness: 0.28, metalness: 0.5
            });
            const carbon = new THREE.MeshStandardMaterial({ color: 0x17181d, roughness: 0.55, metalness: 0.35 });
            const orange = new THREE.MeshBasicMaterial({ color: 0xff7a1a });

            G.add(this.makeProfile([[-2.55, 0.26], [2.3, 0.26], [2.45, 0.36], [2.25, 0.46], [0.9, 0.64], [-0.4, 0.8], [-2.2, 0.66], [-2.55, 0.52]], 2.15, gold, 0.06));
            // Cockpit em gota
            G.add(this.makeProfile([[1.0, 0.6], [0.35, 0.98], [-0.5, 1.0], [-1.6, 0.7]], 1.3, glassMat, 0.05));
            // Barbatana dorsal de carbono
            G.add(this.makeProfile([[-0.6, 0.95], [-2.45, 0.62], [-2.45, 1.12]], 0.07, carbon, 0));
            // Splitter dianteiro, difusor traseiro e entradas de ar laterais
            G.add(this.makeBox(2.2, 0.05, 0.5, carbon, 0, 0.26, -2.25));
            G.add(this.makeBox(1.9, 0.16, 0.3, carbon, 0, 0.33, 2.45));
            [-1.12, 1.12].forEach(x => G.add(this.makeBox(0.05, 0.22, 0.9, carbon, x, 0.48, 0.6)));

            // Lanterna laranja fina de ponta a ponta
            G.add(this.makeBox(2.0, 0.04, 0.05, orange, 0, 0.6, 2.53));

            // Quatro escapes com chamas tremulando
            this.exhaustFlames = [];
            [-0.45, -0.17, 0.17, 0.45].forEach(x => {
                const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.2, 10).rotateX(Math.PI / 2), carbon);
                pipe.position.set(x, 0.4, 2.58);
                G.add(pipe);
                const flame = this.makeGlow(0xff8a2a, 0.55, 0.95);
                flame.position.set(x, 0.4, 2.72);
                G.add(flame);
                this.exhaustFlames.push(flame);
            });

            this.addWheels(
                [[-1.05, 0.42, -1.4], [1.05, 0.42, -1.4], [-1.05, 0.42, 1.45], [1.05, 0.42, 1.45]],
                0.42, 0.34, carbon, gold, 5
            );

        } else if (carId === 'rusty') {
            // -------------------------------------------------------------
            // RUSTY ROD 1984: clássico enferrujado, para-choque de ferro fundido e escape lateral
            // -------------------------------------------------------------
            const rustPaint = new THREE.MeshStandardMaterial({
                color: 0x824424, // Marrom avermelhado de ferrugem oxidada
                roughness: 0.95,
                metalness: 0.15,
                flatShading: true
            });
            const ironBumper = new THREE.MeshStandardMaterial({ color: 0x221f1d, roughness: 0.85, metalness: 0.4 });
            const patchMat = new THREE.MeshStandardMaterial({ color: 0x543220, roughness: 0.9 });
            const dirtyGlass = new THREE.MeshStandardMaterial({ color: 0x1f1f1a, roughness: 0.4, opacity: 0.88, transparent: true });
            const dimYellow = new THREE.MeshBasicMaterial({ color: 0xffd152 });
            const brokenHeadlight = new THREE.MeshStandardMaterial({ color: 0x332211, roughness: 0.9 });
            const oldRed = new THREE.MeshBasicMaterial({ color: 0xcc2222 });

            // Casco angular estilo clássico muscle/sedan anos 80
            G.add(this.makeProfile([[-2.2, 0.32], [2.15, 0.32], [2.25, 0.48], [2.1, 0.68], [0.8, 0.72], [-1.3, 0.72], [-2.15, 0.65], [-2.2, 0.48]], 2.05, rustPaint, 0.04));
            // Cabine quadrada clássica
            G.add(this.makeProfile([[0.75, 0.72], [0.35, 1.18], [-0.95, 1.18], [-1.4, 0.72]], 1.55, dirtyGlass, 0.03));
            // Teto em metal enferrujado
            G.add(this.makeBox(1.6, 0.05, 1.45, rustPaint, 0, 1.2, -0.3));

            // Para-choques pesados de ferro fundido
            G.add(this.makeBox(2.15, 0.18, 0.18, ironBumper, 0, 0.42, -2.25));
            G.add(this.makeBox(2.15, 0.18, 0.18, ironBumper, 0, 0.42, 2.2));

            // Remendos de chapa de ferro na lataria
            G.add(this.makeBox(0.8, 0.25, 0.03, patchMat, 0.5, 0.56, -1.0));
            G.add(this.makeBox(0.6, 0.3, 0.03, patchMat, -0.6, 0.52, 0.8));

            // Grade dianteira exposta com aletas de ferro
            G.add(this.makeBox(1.3, 0.22, 0.06, ironBumper, 0, 0.55, -2.22));

            // Faróis assimétricos (um amarelo vintage e outro quebrado)
            G.add(this.makeBox(0.24, 0.18, 0.06, dimYellow, -0.7, 0.55, -2.22));
            G.add(this.makeBox(0.24, 0.18, 0.06, brokenHeadlight, 0.7, 0.55, -2.22));

            // Escapamento lateral saindo pela lateral direita do carro
            const sidePipe = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.2, 8).rotateX(Math.PI / 2), ironBumper);
            sidePipe.position.set(1.08, 0.32, 1.2);
            G.add(sidePipe);

            // Lanternas traseiras retangulares vintage
            [-0.7, 0.7].forEach(x => {
                G.add(this.makeBox(0.4, 0.12, 0.05, oldRed, x, 0.56, 2.22));
                const g = this.makeGlow(0xff3322, 0.6, 0.5);
                g.position.set(x, 0.56, 2.28);
                G.add(g);
            });

            // Rodas de ferro antigas com aros oxidados e calotas escuras
            const oldRim = new THREE.MeshStandardMaterial({ color: 0x4a2a1a, roughness: 0.85, metalness: 0.3 });
            this.addWheels(
                [[-1.02, 0.4, -1.3], [1.02, 0.4, -1.3], [-1.02, 0.4, 1.35], [1.02, 0.4, 1.35]],
                0.41, 0.34, tireMat, oldRim, 4
            );

        } else {
            // -------------------------------------------------------------
            // TESLA ROADSTER 2077: branco pérola, cunha baixa e LED vermelho
            // -------------------------------------------------------------
            const pearl = new THREE.MeshStandardMaterial({
                color: 0xf4f5f8, roughness: 0.3, metalness: 0.15
            });
            const dark = new THREE.MeshStandardMaterial({ color: 0x1b1d24, roughness: 0.6, metalness: 0.3 });
            const red = new THREE.MeshBasicMaterial({ color: 0xff1a3c });
            const white = new THREE.MeshBasicMaterial({ color: 0xffffff });

            G.add(this.makeProfile([[-2.15, 0.28], [2.05, 0.28], [2.22, 0.4], [2.1, 0.52], [0.9, 0.66], [-1.5, 0.76], [-2.12, 0.72], [-2.2, 0.5]], 2.0, pearl, 0.07));
            // Capota de vidro escuro
            G.add(this.makeProfile([[1.05, 0.62], [0.25, 1.08], [-0.75, 1.1], [-1.55, 0.74]], 1.5, glassMat, 0.05));
            // Lábio do spoiler integrado
            G.add(this.makeBox(1.85, 0.05, 0.3, pearl, 0, 0.8, 1.98));
            // Difusor traseiro
            G.add(this.makeBox(1.7, 0.14, 0.2, dark, 0, 0.35, 2.17));
            // Retrovisores
            [-0.95, 0.95].forEach(x => G.add(this.makeBox(0.18, 0.08, 0.12, pearl, x, 0.8, -0.55)));
            // Faróis dianteiros
            [-0.65, 0.65].forEach(x => G.add(this.makeBox(0.5, 0.05, 0.05, white, x, 0.5, -2.16)));

            // LED traseiro vermelho de ponta a ponta + brilho
            G.add(this.makeBox(1.9, 0.06, 0.06, red, 0, 0.64, 2.2));
            [-0.7, 0, 0.7].forEach(x => {
                const g = this.makeGlow(0xff2244, 0.75, 0.55);
                g.position.set(x, 0.64, 2.28);
                G.add(g);
            });

            this.addWheels(
                [[-1.0, 0.4, -1.3], [1.0, 0.4, -1.3], [-1.0, 0.4, 1.32], [1.0, 0.4, 1.32]],
                0.4, 0.32, tireMat,
                new THREE.MeshStandardMaterial({ color: 0xd9dce3, metalness: 0.3, roughness: 0.35 }),
                5
            );
        }

        // Bolha de Força do Escudo Protetor (Mais escuro, fumê e compacto sobre a lataria do carro)
        const shieldBubbleGeo = new THREE.SphereGeometry(1.5, 32, 20);
        shieldBubbleGeo.scale(0.98, 0.55, 1.22);
        const honeycombTex = this.getHoneycombShieldTexture();
        const shieldBubbleMat = new THREE.MeshStandardMaterial({
            map: honeycombTex,
            emissiveMap: honeycombTex,
            color: 0x071b30,
            emissive: 0x1d4e7d,
            emissiveIntensity: 0.52,
            transparent: true,
            opacity: 0.0,
            roughness: 0.25,
            metalness: 0.7,
            side: THREE.DoubleSide,
            depthWrite: false,
            blending: THREE.NormalBlending
        });
        this.shieldBubble = new THREE.Mesh(shieldBubbleGeo, shieldBubbleMat);
        this.shieldBubble.position.set(0, 0.52, 0);
        this.shieldBubble.visible = this.shieldTimer > 0;
        this.truckGroup.add(this.shieldBubble);

        this.scene.add(this.truckGroup);
        this.truckGroup.position.set(this.playerX, this.playerY, 0);

        // Sombra de contato escura projetada sob o chassi do carro
        if (!this.playerShadow) {
            const shadowGeo = new THREE.PlaneGeometry(2.3, 4.6);
            const shadowMat = new THREE.MeshBasicMaterial({
                map: this.getSoftTexture(),
                color: 0x080612,
                transparent: true,
                opacity: 0.58,
                depthWrite: false
            });
            this.playerShadow = new THREE.Mesh(shadowGeo, shadowMat);
            this.playerShadow.rotation.x = -Math.PI / 2;
            this.playerShadow.position.set(this.playerX, GROUND_Y + 0.02, 0);
            this.scene.add(this.playerShadow);
        }
    }

    // Rastro de fumaça branca suave e transparente (sprites com textura radial)


    buildRivalVehicle(carId = 'phantom', nickname = 'Rival', isLocalP2 = false) {
        if (this.mpRivalVehicle) {
            this.scene.remove(this.mpRivalVehicle);
            this.mpRivalVehicle = null;
        }

        const G = new THREE.Group();
        const accentColor = isLocalP2 ? 0xec4899 : 0x06b6d4;
        const accentHex = isLocalP2 ? "#ec4899" : "#38bdf8";
        const darkMat = new THREE.MeshStandardMaterial({ color: 0x12141c, roughness: 0.6, metalness: 0.4 });
        const paintMat = new THREE.MeshStandardMaterial({
            color: isLocalP2 ? 0xd946ef : 0x0284c7,
            roughness: 0.28,
            metalness: 0.5
        });
        const neonMat = new THREE.MeshBasicMaterial({ color: accentColor });
        const glassMat = new THREE.MeshStandardMaterial({ color: 0x11131a, roughness: 0.15, metalness: 0.3 });
        const tireMat = new THREE.MeshStandardMaterial({ color: 0x15161b, roughness: 0.85, metalness: 0.1 });

        // Carroceria aerodinâmica do Rival
        G.add(this.makeProfile([[-2.2, 0.26], [2.15, 0.26], [2.3, 0.38], [2.15, 0.5], [0.95, 0.65], [-1.35, 0.72], [-2.2, 0.6]], 2.1, paintMat, 0.05));
        G.add(this.makeProfile([[0.9, 0.6], [0.22, 1.02], [-0.7, 1.02], [-1.3, 0.68]], 1.4, glassMat, 0.04));

        // Detalhes em Neon Futurista
        [-1.08, 1.08].forEach(x => G.add(this.makeBox(0.06, 0.05, 3.8, neonMat, x, 0.32, 0)));
        [-0.7, 0.7].forEach(x => G.add(this.makeBox(0.06, 0.42, 0.6, paintMat, x, 0.82, 1.75)));
        G.add(this.makeBox(1.9, 0.04, 0.4, darkMat, 0, 1.05, 1.85));
        G.add(this.makeBox(1.9, 0.03, 0.04, neonMat, 0, 1.07, 2.05));

        // Faróis dianteiros e lanterna traseira neon
        [-0.65, 0.65].forEach(x => {
            G.add(this.makeBox(0.45, 0.05, 0.05, neonMat, x, 0.48, -2.15));
        });
        G.add(this.makeBox(1.85, 0.06, 0.06, neonMat, 0, 0.62, 2.15));

        // Rodas do Rival
        [[-1.05, 0.45, -1.4], [1.05, 0.45, -1.4], [-1.05, 0.45, 1.4], [1.05, 0.45, 1.4]].forEach(pos => {
            const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.44, 0.32, 16).rotateZ(Math.PI / 2), tireMat);
            wheel.position.set(pos[0], pos[1], pos[2]);
            G.add(wheel);
        });

        // Sombra de Contato
        const shadowGeo = new THREE.PlaneGeometry(2.6, 4.8);
        shadowGeo.rotateX(-Math.PI / 2);
        const shadowMat = new THREE.MeshBasicMaterial({
            map: this.getSoftTexture(),
            color: 0x000000,
            transparent: true,
            opacity: 0.55,
            depthWrite: false
        });
        const shadow = new THREE.Mesh(shadowGeo, shadowMat);
        shadow.position.y = 0.06;
        G.add(shadow);

        // Overhead Name Tag Sprite Flutuante com o Nickname
        this.mpRivalTag = this.createNameTagSprite(nickname, accentHex);
        G.add(this.mpRivalTag);

        G.position.set(LANES[2], GROUND_Y, -2.0);
        this.scene.add(G);
        this.mpRivalVehicle = G;
    }



    emitRearSmokeCloud() {
        let color = 0xffffff;
        if (this.isFlying) color = 0xdff7ff;
        else if (this.selectedCar === 'phantom') color = 0xeadfff;
        else if (this.selectedCar === 'solaris') color = 0xfff0e0;
        else if (this.selectedCar === 'rusty') color = 0x8c7865;

        const tex = this.getSoftTexture();
        const rearZ = this.truckGroup.position.z + 2.5;
        for (let i = 0; i < 2; i++) {
            const mat = new THREE.SpriteMaterial({ map: tex, color, transparent: true, opacity: 0, depthWrite: false });
            const p = new THREE.Sprite(mat);
            const side = i === 0 ? -0.55 : 0.55;
            p.position.set(
                this.truckGroup.position.x + side + (Math.random() - 0.5) * 0.2,
                this.truckGroup.position.y + 0.25 + Math.random() * 0.1,
                rearZ
            );
            const s = 0.45 + Math.random() * 0.2;
            p.scale.set(s, s, 1);
            p.velocity = new THREE.Vector3(
                side * 0.9 + (Math.random() - 0.5) * 0.5,
                0.2 + Math.random() * 0.4,
                this.currentSpeed * 0.55 + Math.random() * 4.0
            );
            p.life = 0.55;
            p.maxLife = 0.55;
            p.baseOpacity = this.isFlying ? 0.5 : 0.38;
            p.growth = 2.6;

            this.scene.add(p);
            this.smokeParticles.push(p);
        }
    }



    createLateralAirPuff(origin, direction) {
        for (let i = 0; i < 8; i++) {
            const pGeo = new THREE.SphereGeometry(0.12 + Math.random() * 0.08, 5, 5);
            const pMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
            const p = new THREE.Mesh(pGeo, pMat);
            p.position.copy(origin);
            p.velocity = new THREE.Vector3(
                direction.x * (8.0 + Math.random() * 6.0),
                (Math.random() - 0.5) * 1.5,
                (Math.random() - 0.5) * 2.0
            );
            p.life = 0.24;
            p.maxLife = 0.24;
            this.scene.add(p);
            this.airPuffParticles.push(p);
        }
    }

    // =================================================================
    // TRÂNSITO (CARROS SEDAN LARANJA, PRATA E CINZA)
    // =================================================================




    initThree() {
        this.scene = new THREE.Scene();
        
        // Cor da névoa = cor do horizonte do céu (transição suave)
        const HORIZON_COLOR = 0xf2a07e;
        this.scene.background = new THREE.Color(HORIZON_COLOR);
        this.scene.fog = new THREE.FogExp2(HORIZON_COLOR, 0.0052);

        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 650);
        this.updateCameraLayout();

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;

        // ---------------------------------------------------------
        // CÉU EM DEGRADÊ: roxo no topo -> rosa -> laranja no horizonte
        // ---------------------------------------------------------
        this.skyMaterial = new THREE.ShaderMaterial({
            side: THREE.BackSide,
            depthWrite: false,
            fog: false,
            uniforms: {
                topColor: { value: new THREE.Color(0x3a2a6e) },
                midColor: { value: new THREE.Color(0xc76a9c) },
                horizonColor: { value: new THREE.Color(HORIZON_COLOR) },
                sunDir: { value: new THREE.Vector3(-55, 18, -310).normalize() }
            },
            vertexShader: `
                varying vec3 vDir;
                void main() {
                    vDir = normalize(position);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 topColor;
                uniform vec3 midColor;
                uniform vec3 horizonColor;
                uniform vec3 sunDir;
                varying vec3 vDir;
                void main() {
                    float h = clamp(vDir.y, -0.2, 1.0);
                    vec3 col = mix(horizonColor, midColor, smoothstep(0.02, 0.22, h));
                    col = mix(col, topColor, smoothstep(0.22, 0.65, h));
                    // brilho quente em volta do sol
                    float s = max(dot(normalize(vDir), sunDir), 0.0);
                    col += vec3(1.0, 0.55, 0.3) * pow(s, 18.0) * 0.35;
                    gl_FragColor = vec4(col, 1.0);
                }
            `
        });
        const sky = new THREE.Mesh(new THREE.SphereGeometry(600, 32, 16), this.skyMaterial);
        sky.renderOrder = -10;
        sky.frustumCulled = false;
        this.scene.add(sky);

        // Obs.: não usamos environment map (PMREM) porque em várias GPUs de
        // celular ele deixa todos os materiais pretos. A iluminação do carro
        // vem da luz de preenchimento + contorno abaixo.

        // Luz solar poente (vinda da frente, cria contorno nas bordas)
        const sunLight = new THREE.DirectionalLight(0xffb98a, 1.5);
        sunLight.position.set(-35, 24, -120);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 1024;
        sunLight.shadow.mapSize.height = 1024;
        this.scene.add(sunLight);
        this.sunLight = sunLight;

        // LUZ DE PREENCHIMENTO atrás da câmera: ilumina a traseira do carro
        const fillLight = new THREE.DirectionalLight(0xffe4ee, 1.3);
        fillLight.position.set(3, 4.5, 22);
        fillLight.target.position.set(0, 0.5, 0);
        this.scene.add(fillLight);
        this.scene.add(fillLight.target);
        this.fillLight = fillLight;

        // Luz de contorno lateral (rim light rosa/lilás)
        const rimLight = new THREE.DirectionalLight(0xd59cff, 0.6);
        rimLight.position.set(18, 6, 4);
        this.scene.add(rimLight);
        this.rimLight = rimLight;

        const ambientLight = new THREE.AmbientLight(0xc98a9a, 0.55);
        this.scene.add(ambientLight);
        this.ambientLight = ambientLight;

        const hemiLight = new THREE.HemisphereLight(0xf6a3b8, 0x2a2848, 0.7);
        this.scene.add(hemiLight);
        this.hemiLight = hemiLight;

        window.addEventListener("resize", () => {
            this.updateCameraLayout();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
        window.addEventListener("orientationchange", () => {
            setTimeout(() => {
                this.updateCameraLayout();
                this.renderer.setSize(window.innerWidth, window.innerHeight);
            }, 150);
        });
    }



    updateCameraLayout() {
        const isPortrait = window.innerHeight > window.innerWidth;
        this.camera.aspect = window.innerWidth / window.innerHeight;

        if (isPortrait) {
            // MODO CELULAR VERTICAL (RETRATO): FOV maior para caber a pista toda sem cortar
            this.camera.fov = 75;
            this.camera.position.set(0, 4.8, 8.8);
            this.camera.lookAt(0, 1.2, -15);
        } else {
            // MODO PAISAGEM (DESKTOP): Visão esportiva padrão
            this.camera.fov = 60;
            this.camera.position.set(0, 4.2, 7.6);
            this.camera.lookAt(0, 1.4, -14);
        }
        this.camera.updateProjectionMatrix();
    }

    // =================================================================
    // CENÁRIO: PONTE COM CHÃO SÓLIDO / CALÇADA PARA OS COQUEIROS
    // =================================================================


    buildAtmosphericWorld() {
        // 1. Sol Poente Difuso e Suave (camadas de halo com blend aditivo e núcleo quente)
        const sunGroup = new THREE.Group();
        const sunLayers = [
            { r: 20, color: 0xfffbe8, opacity: 1.0, blend: THREE.NormalBlending, z: -308 },
            { r: 32, color: 0xffba70, opacity: 0.6, blend: THREE.AdditiveBlending, z: -309 },
            { r: 52, color: 0xff7050, opacity: 0.35, blend: THREE.AdditiveBlending, z: -310 },
            { r: 85, color: 0xe04575, opacity: 0.18, blend: THREE.AdditiveBlending, z: -311 }
        ];
        sunLayers.forEach(l => {
            const m = new THREE.Mesh(
                new THREE.CircleGeometry(l.r, 48),
                new THREE.MeshBasicMaterial({
                    color: l.color,
                    transparent: l.opacity < 1.0,
                    opacity: l.opacity,
                    blending: l.blend,
                    fog: false,
                    depthWrite: false
                })
            );
            m.position.set(-55, 18, l.z);
            sunGroup.add(m);
        });
        this.scene.add(sunGroup);
        this.sunGroup = sunGroup;

        // 1b. Lua Synthwave Neon com anéis de halo e frisos de horizonte noturno
        this.moonGroup = new THREE.Group();
        const moonLayers = [
            { r: 24, color: 0xf472b6, opacity: 1.0, blend: THREE.NormalBlending, z: -308 },
            { r: 38, color: 0xa855f7, opacity: 0.65, blend: THREE.AdditiveBlending, z: -309 },
            { r: 62, color: 0x38bdf8, opacity: 0.35, blend: THREE.AdditiveBlending, z: -310 },
            { r: 95, color: 0x4f46e5, opacity: 0.18, blend: THREE.AdditiveBlending, z: -311 }
        ];
        moonLayers.forEach(l => {
            const m = new THREE.Mesh(
                new THREE.CircleGeometry(l.r, 48),
                new THREE.MeshBasicMaterial({
                    color: l.color,
                    transparent: l.opacity < 1.0,
                    opacity: l.opacity,
                    blending: l.blend,
                    fog: false,
                    depthWrite: false
                })
            );
            m.position.set(50, -50, l.z);
            this.moonGroup.add(m);
        });
        for (let si = -16; si <= 16; si += 6) {
            const slat = new THREE.Mesh(
                new THREE.PlaneGeometry(48, 2.2),
                new THREE.MeshBasicMaterial({ color: 0x070318, fog: false, depthWrite: false })
            );
            slat.position.set(50, -50 + si, -307);
            this.moonGroup.add(slat);
        }
        this.scene.add(this.moonGroup);

        // 1c. Campo Estelar Cintilante (500 estrelas synthwave)
        const starCount = 500;
        const starPositions = new Float32Array(starCount * 3);
        for (let i = 0; i < starCount; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * (Math.PI * 0.45);
            const rad = 540;
            starPositions[i * 3] = rad * Math.sin(phi) * Math.cos(theta);
            starPositions[i * 3 + 1] = Math.max(15, rad * Math.cos(phi));
            starPositions[i * 3 + 2] = rad * Math.sin(phi) * Math.sin(theta);
        }
        const starGeo = new THREE.BufferGeometry();
        starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
        const starMat = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 2.2,
            transparent: true,
            opacity: 0.0,
            fog: false
        });
        this.starField = new THREE.Points(starGeo, starMat);
        this.scene.add(this.starField);

        // 2. Oceano com reflexo suave
        const oceanGeo = new THREE.PlaneGeometry(1200, 1200);
        const oceanMat = new THREE.MeshStandardMaterial({ color: 0x2d2440, roughness: 0.25, metalness: 0.75 });
        this.ocean = new THREE.Mesh(oceanGeo, oceanMat);
        this.ocean.rotation.x = -Math.PI / 2;
        this.ocean.position.y = -3.8;
        this.scene.add(this.ocean);

        // 3. Pista de Rodovia da Ponte (3 Faixas)
        const segmentLength = 70;
        const totalSegments = 6;
        const roadWidth = 14.5;

        const roadGeo = new THREE.PlaneGeometry(roadWidth, segmentLength);
        // Asfalto fosco: rugoso e pouco metálico para evitar o brilho branco estourado
        const roadMat = new THREE.MeshStandardMaterial({ color: 0x3c3945, roughness: 0.82, metalness: 0.05 });

        for (let i = 0; i < totalSegments; i++) {
            const roadMesh = new THREE.Mesh(roadGeo, roadMat);
            roadMesh.rotation.x = -Math.PI / 2;
            roadMesh.position.set(0, 0, -i * segmentLength + 25);
            roadMesh.receiveShadow = true;
            this.scene.add(roadMesh);

            // Adiciona a ponte com CALÇADA SÓLIDA para os coqueiros
            this.addBridgeArchitecture(roadMesh, roadWidth, segmentLength);
            this.roadSegments.push(roadMesh);
        }

        // 4. Coqueiros firmemente plantados sobre o chão da calçada (X = -9.25, Y = 0.5)
        for (let i = 0; i < 28; i++) {
            const palm = this.createPalmTree();
            palm.position.set(-9.25, 0.45, -i * 22);
            this.scene.add(palm);
            this.palmTrees.push(palm);
        }

        // 5. Metrópole / Skyline Costeiro de Prédios Futuristas na Direita (cenário rico e imersivo)
        this.buildings = [];
        for (let b = 0; b < 24; b++) {
            const building = this.createSkylineBuilding();
            const bx = 48 + (b % 4) * 16 + (Math.random() - 0.5) * 6;
            const bz = -460 + b * 22 + (Math.random() - 0.5) * 6;
            building.position.set(bx, -3.8, bz);
            this.scene.add(building);
            this.buildings.push(building);
        }
    }



    addBridgeArchitecture(parentMesh, width, length) {
        // Guarda-corpo entre a pista e a calçada
        const leftBarrier = new THREE.Mesh(
            new THREE.BoxGeometry(0.35, length, 0.9),
            new THREE.MeshStandardMaterial({ color: 0xccd1dc, metalness: 0.6, roughness: 0.3 })
        );
        leftBarrier.position.set(-width / 2, 0, 0.45);
        parentMesh.add(leftBarrier);

        // =============================================================
        // CHÃO SÓLIDO / CALÇADA COSTEIRA DAS PALMEIRAS (NADA FLUTUA NO AR!)
        // =============================================================
        const sidewalkWidth = 4.2;
        const sidewalkCenterX = -width / 2 - sidewalkWidth / 2; // -7.25 - 2.1 = -9.35

        // Piso da calçada elevada
        const sidewalkGeo = new THREE.PlaneGeometry(sidewalkWidth, length);
        const sidewalkMat = new THREE.MeshStandardMaterial({
            color: 0x5a545e, // Concreto texturizado de calçadão costeiro
            roughness: 0.8,
            metalness: 0.15
        });
        const sidewalk = new THREE.Mesh(sidewalkGeo, sidewalkMat);
        sidewalk.position.set(sidewalkCenterX, 0, 0.15); // Meio-fio no nível da pista
        sidewalk.receiveShadow = true;
        parentMesh.add(sidewalk);

        // Mureta de fundação sólida descendo até a água (preenche todo o espaço até o mar)
        const foundationGeo = new THREE.BoxGeometry(sidewalkWidth, length, 4.4);
        const foundationMat = new THREE.MeshStandardMaterial({
            color: 0x3d3845,
            roughness: 0.9,
            metalness: 0.1
        });
        const foundation = new THREE.Mesh(foundationGeo, foundationMat);
        foundation.position.set(sidewalkCenterX, 0, -2.1);
        parentMesh.add(foundation);

        // Guarda-corpo externo na beirada da calçada (de frente para o mar)
        const outerBarrier = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, length, 0.9),
            new THREE.MeshStandardMaterial({ color: 0xb5bac7, metalness: 0.6, roughness: 0.3 })
        );
        outerBarrier.position.set(sidewalkCenterX - sidewalkWidth / 2 + 0.15, 0, 0.6);
        parentMesh.add(outerBarrier);

        // Sombra de contato suave e escura no chão na base de cada coqueiro (sem discos marrons flutuantes)
        const shadowGeo = new THREE.PlaneGeometry(2.4, 1.4);
        const shadowMat = new THREE.MeshBasicMaterial({
            map: this.getSoftTexture(),
            color: 0x0a0510,
            transparent: true,
            opacity: 0.38,
            depthWrite: false
        });
        for (let pz = -length / 2 + 10; pz < length / 2; pz += 22) {
            const shadow = new THREE.Mesh(shadowGeo, shadowMat);
            shadow.position.set(sidewalkCenterX, pz, 0.16);
            parentMesh.add(shadow);
        }

        // =============================================================
        // GUARDA-CORPO E GRADE ESTRUTURAL DA PONTE NA LATERAL DIREITA
        // =============================================================
        const rightEdgeX = width / 2; // +7.25

        // Mureta base contínua de concreto limpo
        const rightCurb = new THREE.Mesh(
            new THREE.BoxGeometry(0.45, length, 0.75),
            new THREE.MeshStandardMaterial({ color: 0x4a4754, roughness: 0.7, metalness: 0.2 })
        );
        rightCurb.position.set(rightEdgeX + 0.22, 0, 0.375);
        parentMesh.add(rightCurb);

        // Friso linear de LED guia de pista (laranja pôr-do-sol)
        const ledStrip = new THREE.Mesh(
            new THREE.BoxGeometry(0.08, length, 0.08),
            new THREE.MeshBasicMaterial({ color: 0xff7a36 })
        );
        ledStrip.position.set(rightEdgeX + 0.02, 0, 0.2);
        parentMesh.add(ledStrip);

        // Corrimãos horizontais metálicos duplos (Top Rail & Mid Rail)
        const railMat = new THREE.MeshStandardMaterial({ color: 0xd8dce6, metalness: 0.85, roughness: 0.25 });
        const topRail = new THREE.Mesh(
            new THREE.BoxGeometry(0.16, length, 0.12),
            railMat
        );
        topRail.position.set(rightEdgeX + 0.22, 0, 1.25);
        parentMesh.add(topRail);

        const midRail = new THREE.Mesh(
            new THREE.BoxGeometry(0.12, length, 0.08),
            railMat
        );
        midRail.position.set(rightEdgeX + 0.22, 0, 0.82);
        parentMesh.add(midRail);

        // Postes verticais de suporte a cada 3.5m
        const postGeo = new THREE.BoxGeometry(0.14, 0.14, 0.95);
        const postMat = new THREE.MeshStandardMaterial({ color: 0x8a90a0, metalness: 0.8, roughness: 0.3 });
        for (let pz = -length / 2 + 1.75; pz < length / 2; pz += 3.5) {
            const post = new THREE.Mesh(postGeo, postMat);
            post.position.set(rightEdgeX + 0.22, pz, 0.75);
            parentMesh.add(post);
        }

        // Postes de iluminação pública com luminárias estéticas ao longo da ponte
        for (let lp = -length / 2 + 15; lp < length / 2; lp += 35) {
            const lampGroup = new THREE.Group();
            const pole = new THREE.Mesh(
                new THREE.CylinderGeometry(0.09, 0.13, 4.4, 8).rotateX(Math.PI / 2),
                new THREE.MeshStandardMaterial({ color: 0xb0b6c6, metalness: 0.85, roughness: 0.25 })
            );
            pole.position.set(0, 0, 2.2);
            lampGroup.add(pole);

            const arm = new THREE.Mesh(
                new THREE.BoxGeometry(1.5, 0.09, 0.09),
                new THREE.MeshStandardMaterial({ color: 0xb0b6c6, metalness: 0.85 })
            );
            arm.position.set(-0.65, 0, 4.35);
            lampGroup.add(arm);

            const lamp = new THREE.Mesh(
                new THREE.BoxGeometry(0.45, 0.2, 0.08),
                new THREE.MeshBasicMaterial({ color: 0xfff0cc })
            );
            lamp.position.set(-1.25, 0, 4.32);
            lampGroup.add(lamp);

            lampGroup.position.set(rightEdgeX + 0.26, lp, 0);
            parentMesh.add(lampGroup);
        }

        // Faixas brancas limpas da rodovia
        const laneDividerX = [-2.4, 2.4];
        const dashGeo = new THREE.PlaneGeometry(0.18, 5.2);
        const dashMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

        laneDividerX.forEach(posX => {
            for (let z = -length / 2 + 3; z < length / 2; z += 9) {
                const dash = new THREE.Mesh(dashGeo, dashMat);
                dash.position.set(posX, z, 0.02);
                parentMesh.add(dash);
            }
        });

        // Pilares sobre o mar (abaixo do piso para não vazar círculos cinzas no asfalto)
        const pillarGeo = new THREE.CylinderGeometry(0.8, 0.8, 3.8, 10);
        const pillarMat = new THREE.MeshStandardMaterial({ color: 0x828796, roughness: 0.6 });
        [-width / 2 + 1, width / 2 - 1].forEach(px => {
            const pillar = new THREE.Mesh(pillarGeo, pillarMat);
            pillar.rotation.x = Math.PI / 2;
            pillar.position.set(px, 0, -2.4);
            parentMesh.add(pillar);
        });
    }



    createPalmTree() {
        const group = new THREE.Group();
        const trunkGeo = new THREE.CylinderGeometry(0.18, 0.3, 7.5, 6);
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3d271d, roughness: 0.9 });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 3.75;
        trunk.rotation.z = -0.06;
        group.add(trunk);

        const leafMat = new THREE.MeshStandardMaterial({ color: 0x1f3b23, roughness: 0.6, side: THREE.DoubleSide });
        for (let j = 0; j < 6; j++) {
            const leafGeo = new THREE.ConeGeometry(0.85, 3.8, 4);
            leafGeo.rotateX(Math.PI / 2.8);
            const leaf = new THREE.Mesh(leafGeo, leafMat);
            leaf.position.set(0, 7.4, 0);
            leaf.rotation.y = (j / 6) * Math.PI * 2;
            group.add(leaf);
        }
        return group;
    }

    // =================================================================
    // VEÍCULOS 3D CUSTOMIZADOS: CADA CARRO COM SILHUETA PRÓPRIA
    // =================================================================

    // Textura Hexagonal Colmeia 3D com Bordas Douradas e Linhas Isométricas (Idêntica à foto enviada)


    getHoneycombShieldTexture() {
        if (this._honeycombTex) return this._honeycombTex;
        const canvas = document.createElement("canvas");
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext("2d");

        ctx.clearRect(0, 0, 512, 512);

        // Fundo escuro azul-noite cibernético para conferir tom escuro e proteger a visibilidade do carro
        const bgGrad = ctx.createRadialGradient(256, 256, 40, 256, 256, 360);
        bgGrad.addColorStop(0, "rgba(6, 18, 38, 0.45)");
        bgGrad.addColorStop(0.6, "rgba(4, 12, 28, 0.40)");
        bgGrad.addColorStop(1, "rgba(2, 7, 18, 0.35)");
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 512, 512);

        const s = 44; // Raio do hexágono
        const h = s * Math.sqrt(3);
        const w = s * 1.5;

        const drawHex = (cx, cy) => {
            const pts = [];
            for (let i = 0; i < 6; i++) {
                const a = (i * Math.PI) / 3;
                pts.push({ x: cx + s * Math.cos(a), y: cy + s * Math.sin(a) });
            }

            // Preenchimento interno translúcido fumê escuro azulado
            const hexGrad = ctx.createRadialGradient(cx, cy, 3, cx, cy, s);
            hexGrad.addColorStop(0, "rgba(12, 38, 70, 0.35)");
            hexGrad.addColorStop(0.65, "rgba(6, 22, 45, 0.38)");
            hexGrad.addColorStop(1, "rgba(2, 9, 22, 0.45)");
            ctx.fillStyle = hexGrad;
            ctx.beginPath();
            ctx.moveTo(pts[0].x, pts[0].y);
            for (let i = 1; i < 6; i++) ctx.lineTo(pts[i].x, pts[i].y);
            ctx.closePath();
            ctx.fill();

            // Linhas isométricas internas do cubo 3D (conforme foto enviada pelo usuário)
            ctx.strokeStyle = "rgba(56, 189, 248, 0.65)";
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(cx, cy); ctx.lineTo(pts[0].x, pts[0].y);
            ctx.moveTo(cx, cy); ctx.lineTo(pts[2].x, pts[2].y);
            ctx.moveTo(cx, cy); ctx.lineTo(pts[4].x, pts[4].y);
            ctx.stroke();

            // Sub-linhas concêntricas hexagonais internas em ciano brilhante
            ctx.strokeStyle = "rgba(34, 211, 238, 0.4)";
            ctx.lineWidth = 1.0;
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const a = (i * Math.PI) / 3;
                const subX = cx + (s * 0.52) * Math.cos(a);
                const subY = cy + (s * 0.52) * Math.sin(a);
                if (i === 0) ctx.moveTo(subX, subY);
                else ctx.lineTo(subX, subY);
            }
            ctx.closePath();
            ctx.stroke();

            // Borda externa hexagonal dourada reluzente / ouro âmbar (exactamente como na imagem!)
            ctx.save();
            ctx.shadowColor = "#f59e0b";
            ctx.shadowBlur = 8;
            ctx.strokeStyle = "rgba(251, 191, 36, 0.95)";
            ctx.lineWidth = 3.2;
            ctx.beginPath();
            ctx.moveTo(pts[0].x, pts[0].y);
            for (let i = 1; i < 6; i++) ctx.lineTo(pts[i].x, pts[i].y);
            ctx.closePath();
            ctx.stroke();

            // Destaque branco-dourado no núcleo da linha
            ctx.strokeStyle = "rgba(254, 243, 199, 0.85)";
            ctx.lineWidth = 1.0;
            ctx.stroke();
            ctx.restore();
        };

        for (let x = -s; x < 512 + s * 2; x += w) {
            const col = Math.round(x / w);
            const yOffset = (col % 2 === 0) ? 0 : h / 2;
            for (let y = -h; y < 512 + h * 2; y += h) {
                drawHex(x, y + yOffset);
            }
        }

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(3, 2);
        this._honeycombTex = tex;
        return tex;
    }

    // Textura radial suave (usada em brilhos de faróis, chamas e fumaça)


    getSoftTexture() {
        if (this.softTexture) return this.softTexture;
        const c = document.createElement("canvas");
        c.width = c.height = 64;
        const g = c.getContext("2d");
        const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
        grad.addColorStop(0, "rgba(255,255,255,1)");
        grad.addColorStop(0.35, "rgba(255,255,255,0.6)");
        grad.addColorStop(1, "rgba(255,255,255,0)");
        g.fillStyle = grad;
        g.fillRect(0, 0, 64, 64);
        this.softTexture = new THREE.CanvasTexture(c);
        return this.softTexture;
    }

    // Brilho aditivo (bloom falso) para luzes do carro


    makeGlow(color, size, opacity = 0.9) {
        const mat = new THREE.SpriteMaterial({
            map: this.getSoftTexture(),
            color,
            transparent: true,
            opacity,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const s = new THREE.Sprite(mat);
        s.scale.set(size, size, 1);
        s.userData.base = size;
        return s;
    }

    // Metrópole Costeira: Torres e Arranha-Céus Futuristas ao Fundo na Direita


    createSkylineBuilding() {
        const group = new THREE.Group();
        const w = 7 + Math.random() * 8;
        const d = 8 + Math.random() * 10;
        const h = 32 + Math.random() * 55;

        const facadeColors = [0x1e1a2b, 0x252036, 0x181724, 0x2b233d, 0x1d2030];
        const facadeColor = facadeColors[Math.floor(Math.random() * facadeColors.length)];
        const bMat = new THREE.MeshStandardMaterial({
            color: facadeColor,
            roughness: 0.55,
            metalness: 0.35
        });

        const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), bMat);
        body.position.y = h / 2;
        group.add(body);

        // Faixas de janelas com iluminação em tom âmbar e neon
        const windowMat = new THREE.MeshBasicMaterial({
            color: Math.random() < 0.65 ? 0xffdf88 : (Math.random() < 0.5 ? 0x38bdf8 : 0xf472b6),
            transparent: true,
            opacity: 0.72
        });

        const floors = Math.floor(h / 6);
        for (let f = 1; f < floors; f++) {
            if (Math.random() < 0.28) continue;
            const band = new THREE.Mesh(new THREE.BoxGeometry(w + 0.08, 0.75, d + 0.08), windowMat);
            band.position.y = f * 6;
            group.add(band);
        }

        // Topo da torre: Antena com sinalizador de aviação ou cobertura estilizada
        if (Math.random() < 0.65) {
            const spireH = 8 + Math.random() * 10;
            const spire = new THREE.Mesh(
                new THREE.CylinderGeometry(0.08, 0.25, spireH, 6),
                new THREE.MeshStandardMaterial({ color: 0x828898, metalness: 0.9 })
            );
            spire.position.y = h + spireH / 2;
            group.add(spire);

            const beacon = this.makeGlow(0xff2233, 1.3, 0.85);
            beacon.position.y = h + spireH;
            group.add(beacon);
        } else {
            const topCap = new THREE.Mesh(
                new THREE.BoxGeometry(w * 0.7, 4.5, d * 0.7),
                bMat
            );
            topCap.position.y = h + 2.25;
            group.add(topCap);
        }

        return group;
    }

    // Carroceria a partir de um perfil lateral: [x = comprimento, y = altura]
    // A frente do perfil (x positivo) aponta para -Z (sentido da pista)


    
    buildCyberTunnel() {
        const tunnelGroup = new THREE.Group();
        const tunnelLen = 280;
        const radius = 8.5;

        // Estrutura em arco do túnel (semi-cilindro invertido)
        const archGeo = new THREE.CylinderGeometry(radius, radius, tunnelLen, 32, 1, true, Math.PI, Math.PI);
        const tunnelMat = new THREE.MeshStandardMaterial({
            color: 0x0f111a,
            roughness: 0.85,
            metalness: 0.25,
            side: THREE.BackSide
        });
        const archMesh = new THREE.Mesh(archGeo, tunnelMat);
        archMesh.rotation.z = Math.PI / 2;
        archMesh.position.y = 0.5;
        tunnelGroup.add(archMesh);

        // Arcos de Neon Futuristas ao longo do túnel (Ciano e Magenta)
        const ringGeo = new THREE.TorusGeometry(radius - 0.05, 0.14, 8, 32, Math.PI);
        this.tunnelNeons = [];
        const ringSpacing = 20;
        const numRings = Math.floor(tunnelLen / ringSpacing);

        for (let i = 0; i <= numRings; i++) {
            const zPos = -tunnelLen / 2 + (i * ringSpacing);
            const isCyan = i % 2 === 0;
            const ringColor = isCyan ? 0x00f0ff : 0xff0077;
            const ringMat = new THREE.MeshBasicMaterial({ color: ringColor });
            const ringMesh = new THREE.Mesh(ringGeo, ringMat);
            ringMesh.rotation.y = Math.PI / 2;
            ringMesh.position.set(0, 0.5, zPos);
            tunnelGroup.add(ringMesh);
            this.tunnelNeons.push(ringMesh);
        }

        // Posicionamento inicial do túnel à frente na rodovia
        tunnelGroup.position.set(0, 0, -1400);
        tunnelGroup.visible = true;
        this.scene.add(tunnelGroup);
        this.cyberTunnel = tunnelGroup;
        this.tunnelLength = tunnelLen;
        this.nextTunnelDistance = 1400;
        this.inTunnelMode = false;
    }

    updateCyberTunnel(delta) {
        if (!this.cyberTunnel) return;

        // Movimentação do túnel em relação à velocidade do jogador
        this.cyberTunnel.position.z += this.currentSpeed * delta;

        // Verifica se o jogador está dentro do túnel
        const tunnelZ = this.cyberTunnel.position.z;
        const halfLen = this.tunnelLength / 2;
        const inside = (tunnelZ > -halfLen && tunnelZ < halfLen + 50);

        if (inside && !this.inTunnelMode) {
            this.inTunnelMode = true;
            this.triggerActionPopup("🚇 ZONA DE TÚNEL CYBERPUNK - ALTA VELOCIDADE!");
            this.speakAnnouncer("Entering Tunnel Zone!", true);
            this.sound.playSpeedUp();
            // Efeito de iluminação interna: reduz luz ambiente externa
            if (this.ambientLight) this.ambientLight.intensity = 0.25;
            if (this.dirLight) this.dirLight.intensity = 0.35;
        } else if (!inside && this.inTunnelMode) {
            this.inTunnelMode = false;
            // Restaura luz ambiente pós-túnel
            if (this.ambientLight) this.ambientLight.intensity = 0.75;
            if (this.dirLight) this.dirLight.intensity = 1.1;
        }

        // Pulsação suave dos neons do túnel
        if (this.tunnelNeons) {
            const time = performance.now() * 0.005;
            this.tunnelNeons.forEach((ring, idx) => {
                const wave = Math.sin(time + idx * 0.5) * 0.5 + 0.5;
                ring.scale.set(1, 1 + wave * 0.05, 1);
            });
        }

        // Quando o túnel ficar totalmente para trás, respawna 1.600m à frente
        if (this.cyberTunnel.position.z > halfLen + 150) {
            this.cyberTunnel.position.z = -1600;
        }
    }

    updateDayNightCycle(delta) {
        if (!this.skyMaterial) return;
        // Transiciona gradualmente com base na distância (Ciclo completo a cada 3.200m)
        const cycleDist = 3200;
        const progress = (this.scoreDistance % cycleDist) / cycleDist;
        
        // 0.0 - 0.38: Pôr do sol clássico synthwave
        // 0.38 - 0.54: Crepúsculo transicionando para meia-noite
        // 0.54 - 0.84: Noite estrelada profunda com lua neon brilhante
        // 0.84 - 1.0: Alvorecer retornando ao pôr do sol
        let targetNight = 0;
        if (progress >= 0.38 && progress < 0.54) {
            targetNight = (progress - 0.38) / 0.16;
        } else if (progress >= 0.54 && progress < 0.84) {
            targetNight = 1.0;
        } else if (progress >= 0.84) {
            targetNight = 1.0 - (progress - 0.84) / 0.16;
        }

        this.currentNightFactor = THREE.MathUtils.lerp(this.currentNightFactor, targetNight, 0.04);
        const nf = this.currentNightFactor;

        // Cores do Céu
        const sunTop = new THREE.Color(0x3a2a6e);
        const sunMid = new THREE.Color(0xc76a9c);
        const sunHor = new THREE.Color(0xf2a07e);

        const nightTop = new THREE.Color(0x060214);
        const nightMid = new THREE.Color(0x190733);
        const nightHor = new THREE.Color(0x380f54);

        this.skyMaterial.uniforms.topColor.value.lerpColors(sunTop, nightTop, nf);
        this.skyMaterial.uniforms.midColor.value.lerpColors(sunMid, nightMid, nf);
        this.skyMaterial.uniforms.horizonColor.value.lerpColors(sunHor, nightHor, nf);

        // Fog e Background
        const sunFog = new THREE.Color(0xf2a07e);
        const nightFog = new THREE.Color(0x220938);
        const curFog = new THREE.Color().lerpColors(sunFog, nightFog, nf);
        this.scene.fog.color.copy(curFog);
        this.scene.background.copy(curFog);

        // Posição do Sol (desce no mar) e da Lua (sobe no horizonte)
        if (this.sunGroup) {
            this.sunGroup.position.y = THREE.MathUtils.lerp(0, -65, nf);
        }
        if (this.moonGroup) {
            this.moonGroup.position.y = THREE.MathUtils.lerp(-60, 68, nf);
            this.moonGroup.rotation.z += 0.05 * delta;
        }

        // Estrelas piscando suavemente no céu noturno
        if (this.starField) {
            const twinkle = 0.82 + Math.sin(performance.now() * 0.003) * 0.18;
            this.starField.material.opacity = nf * twinkle * 0.95;
        }

        // Iluminação ambiente e direcional ajustada
        if (this.sunLight) {
            this.sunLight.intensity = THREE.MathUtils.lerp(1.5, 0.45, nf);
            this.sunLight.color.lerpColors(new THREE.Color(0xffb98a), new THREE.Color(0x818cf8), nf);
        }
        if (this.ambientLight) {
            this.ambientLight.intensity = THREE.MathUtils.lerp(0.55, 0.38, nf);
            this.ambientLight.color.lerpColors(new THREE.Color(0xc98a9a), new THREE.Color(0x581c87), nf);
        }
    }





    spawnTrafficCar() {
        const freeLane = Math.floor(Math.random() * 3);
        const lanesToSpawn = [0, 1, 2].filter(l => l !== freeLane);
        const count = Math.random() < 0.55 ? 2 : 1;

        for (let i = 0; i < count; i++) {
            const laneIndex = lanesToSpawn[i];
            const laneX = LANES[laneIndex];
            const spawnZ = -160 - (Math.random() * 40);

            // Impede spawn de carros sobre ou dentro de rampas existentes
            const rampInLane = this.ramps.some(r => Math.abs(r.position.x - laneX) < 1.6 && Math.abs(r.position.z - spawnZ) < 32.0);
            if (rampInLane) continue;

            const carGroup = new THREE.Group();
            const colors = [0xd97736, 0xdfe3ea, 0x1e2029, 0xb83838];
            const chosenColor = colors[Math.floor(Math.random() * colors.length)];

            const bodyMat = new THREE.MeshStandardMaterial({ color: chosenColor, metalness: 0.8, roughness: 0.25 });
            const glassMat = new THREE.MeshStandardMaterial({ color: 0x111118, roughness: 0.1 });

            const b1 = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.55, 4.0), bodyMat);
            b1.position.y = 0.48;
            b1.castShadow = true;
            carGroup.add(b1);

            const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.5, 2.0), glassMat);
            cabin.position.set(0, 0.9, -0.2);
            carGroup.add(cabin);

            const hl1 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, 0.1), new THREE.MeshBasicMaterial({ color: 0xffffff }));
            hl1.position.set(-0.65, 0.52, 2.05);
            const hl2 = hl1.clone();
            hl2.position.x = 0.65;
            carGroup.add(hl1);
            carGroup.add(hl2);

            carGroup.position.set(laneX, 0, spawnZ);

            carGroup.trafficSpeed = Math.random() * 16 + 20;
            carGroup.boxHeight = 1.4;
            carGroup.obstacleType = "ground_car";

            this.scene.add(carGroup);
            this.trafficCars.push(carGroup);
        }
    }

    // =================================================================
    // RAMPAS FUTURISTAS DE SALTO ACROBÁTICO (BARREL ROLL & AIR STUNTS)
    // =================================================================


    createRamp(laneX, zPos) {
        const rampGroup = new THREE.Group();
        const width = 3.2;
        const length = 11.0;
        const height = 2.2;
        const halfW = width / 2;
        const halfL = length / 2;

        rampGroup.halfW = halfW;
        rampGroup.halfL = halfL;
        rampGroup.rampHeight = height;
        rampGroup.hasContact = false;

        // Prisma triangular preciso via BufferGeometry
        const vertices = new Float32Array([
            // Superfície de subida (Incline Slope)
            -halfW, 0.04,  halfL,
             halfW, 0.04,  halfL,
             halfW, height, -halfL,
            -halfW, 0.04,  halfL,
             halfW, height, -halfL,
            -halfW, height, -halfL,

            // Parede vertical traseira (Back Wall)
             halfW, 0, -halfL,
            -halfW, 0, -halfL,
            -halfW, height, -halfL,
             halfW, 0, -halfL,
            -halfW, height, -halfL,
             halfW, height, -halfL,

            // Lateral esquerda
            -halfW, 0, -halfL,
            -halfW, 0,  halfL,
            -halfW, height, -halfL,

            // Lateral direita
             halfW, 0,  halfL,
             halfW, 0, -halfL,
             halfW, height, -halfL
        ]);

        const rampGeo = new THREE.BufferGeometry();
        rampGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        rampGeo.computeVertexNormals();

        const rampMat = new THREE.MeshStandardMaterial({
            color: 0x1f2330,
            roughness: 0.35,
            metalness: 0.85
        });

        const rampBody = new THREE.Mesh(rampGeo, rampMat);
        rampBody.castShadow = true;
        rampBody.receiveShadow = true;
        rampGroup.add(rampBody);

        // Trilhos luminosos de Neon Laranja nas bordas
        const slopeHyp = Math.sqrt(length * length + height * height);
        const slopeAngle = -Math.atan2(height, length);
        const railMat = new THREE.MeshBasicMaterial({ color: 0xff8800 });
        const railGeo = new THREE.BoxGeometry(0.14, 0.14, slopeHyp);

        const leftRail = new THREE.Mesh(railGeo, railMat);
        leftRail.position.set(-halfW + 0.07, height / 2 + 0.05, 0);
        leftRail.rotation.x = slopeAngle;
        rampGroup.add(leftRail);

        const rightRail = new THREE.Mesh(railGeo, railMat);
        rightRail.position.set(halfW - 0.07, height / 2 + 0.05, 0);
        rightRail.rotation.x = slopeAngle;
        rampGroup.add(rightRail);

        // Lip de salto em Neon Ciano no topo
        const lipMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
        const lipMesh = new THREE.Mesh(new THREE.BoxGeometry(width, 0.14, 0.16), lipMat);
        lipMesh.position.set(0, height + 0.04, -halfL);
        rampGroup.add(lipMesh);

        // Setas indicativas de impulsão (Chevrons >>>)
        rampGroup.chevrons = [];
        const chevronGeo = new THREE.BoxGeometry(1.6, 0.04, 0.45);
        [-0.32, 0.0, 0.32].forEach((offsetFactor) => {
            const chMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.85 });
            const ch = new THREE.Mesh(chevronGeo, chMat);
            const progress = 0.5 + offsetFactor;
            const zPosLocal = halfL - progress * length;
            const yPosLocal = progress * height + 0.06;
            ch.position.set(0, yPosLocal, zPosLocal);
            ch.rotation.x = slopeAngle;
            rampGroup.add(ch);
            rampGroup.chevrons.push(ch);
        });

        // Luz guia no topo da rampa
        const beaconLight = new THREE.PointLight(0xffaa00, 1.2, 7);
        beaconLight.position.set(0, height + 0.3, -halfL);
        rampGroup.add(beaconLight);

        rampGroup.position.set(laneX, 0, zPos);
        this.scene.add(rampGroup);
        this.ramps.push(rampGroup);
        return rampGroup;
    }



    spawnRamp() {
        // Escolhe faixa desobstruída para a rampa
        let laneIndex = Math.floor(Math.random() * 3);
        let laneX = LANES[laneIndex];
        const spawnZ = -175 - (Math.random() * 25);

        const blocked = this.trafficCars.some(c => Math.abs(c.position.x - laneX) < 1.6 && Math.abs(c.position.z - spawnZ) < 30.0);
        if (blocked) {
            const clearLanes = [0, 1, 2].filter(idx => !this.trafficCars.some(c => Math.abs(c.position.x - LANES[idx]) < 1.6 && Math.abs(c.position.z - spawnZ) < 30.0));
            if (clearLanes.length > 0) {
                laneIndex = clearLanes[Math.floor(Math.random() * clearLanes.length)];
                laneX = LANES[laneIndex];
            }
        }

        this.createRamp(laneX, spawnZ);

        // Carros nunca devem ser gerados na mesma faixa da rampa para não atravessá-la
        if (Math.random() < 0.65) {
            const adjLanes = LANES.filter(lx => lx !== laneX);
            const carLaneX = adjLanes[Math.floor(Math.random() * adjLanes.length)];

            const carGroup = new THREE.Group();
            const colors = [0xd97736, 0xdfe3ea, 0xb83838];
            const chosenColor = colors[Math.floor(Math.random() * colors.length)];
            const bodyMat = new THREE.MeshStandardMaterial({ color: chosenColor, metalness: 0.8, roughness: 0.25 });
            const glassMat = new THREE.MeshStandardMaterial({ color: 0x111118, roughness: 0.1 });

            const b1 = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.55, 4.0), bodyMat);
            b1.position.y = 0.48;
            carGroup.add(b1);

            const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.5, 2.0), glassMat);
            cabin.position.set(0, 0.9, -0.2);
            carGroup.add(cabin);

            carGroup.position.set(carLaneX, 0, spawnZ - 8);
            carGroup.trafficSpeed = Math.random() * 12 + 18;
            carGroup.boxHeight = 1.4;
            carGroup.obstacleType = "ground_car";

            this.scene.add(carGroup);
            this.trafficCars.push(carGroup);
        }
    }

    // =================================================================
    // OBSTÁCULOS NO CÉU (PÁSSAROS, AVIÕES, CABOS)
    // =================================================================


    spawnSkyObstacle() {
        const laneIndex = Math.floor(Math.random() * 3);
        const laneX = LANES[laneIndex];
        const spawnZ = -170 - (Math.random() * 30);
        const randType = Math.random();

        if (randType < 0.4) {
            const flockGroup = new THREE.Group();
            flockGroup.obstacleType = "birds";
            flockGroup.wings = [];

            const birdCount = 3 + Math.floor(Math.random() * 3);
            const featherMat = new THREE.MeshStandardMaterial({ 
                color: 0xffffff, 
                emissive: 0xfff0dc, 
                emissiveIntensity: 0.35, 
                roughness: 0.35 
            });
            const wingTipMat = new THREE.MeshStandardMaterial({ color: 0x111116, roughness: 0.6 });
            const beakMat = new THREE.MeshBasicMaterial({ color: 0xff6600 });

            for (let b = 0; b < birdCount; b++) {
                const bird = new THREE.Group();
                // Corpo ampliado de gaivota costeira (alta visibilidade e contraste no céu)
                const body = new THREE.Mesh(new THREE.ConeGeometry(0.32, 1.4, 6).rotateX(Math.PI / 2), featherMat);
                bird.add(body);

                // Bico laranja vibrante
                const beak = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.45, 4).rotateX(-Math.PI / 2), beakMat);
                beak.position.set(0, 0.02, -0.85);
                bird.add(beak);

                // Asas amplas com pontas pretas e articulação para bater asas
                const wingGeo = new THREE.BoxGeometry(1.65, 0.06, 0.45);
                const leftWing = new THREE.Mesh(wingGeo, featherMat);
                leftWing.position.x = -0.85;
                const leftTip = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.07, 0.43), wingTipMat);
                leftTip.position.x = -0.65;
                leftWing.add(leftTip);

                const rightWing = new THREE.Mesh(wingGeo, featherMat);
                rightWing.position.x = 0.85;
                const rightTip = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.07, 0.43), wingTipMat);
                rightTip.position.x = 0.65;
                rightWing.add(rightTip);

                bird.add(leftWing);
                bird.add(rightWing);

                bird.leftWing = leftWing;
                bird.rightWing = rightWing;
                flockGroup.wings.push(leftWing, rightWing);

                // Formação escalonada em bando
                bird.position.set((b - 1.5) * 1.8, (b % 2) * 0.5, b * 1.4);
                flockGroup.add(bird);
            }

            flockGroup.position.set(laneX, FLIGHT_Y + (Math.random() * 0.8 - 0.4), spawnZ);
            flockGroup.flySpeed = Math.random() * 8 + 6;
            this.scene.add(flockGroup);
            this.skyObstacles.push(flockGroup);

        } else if (randType < 0.72) {
            const planeGroup = new THREE.Group();
            planeGroup.obstacleType = "plane";

            // Avião a jato em grande escala com pintura aeronáutica e luzes de navegação
            const airlinerMat = new THREE.MeshStandardMaterial({ 
                color: 0xf5f8fc, 
                metalness: 0.75, 
                roughness: 0.25,
                emissive: 0xd8e4f0,
                emissiveIntensity: 0.2
            });
            const wingMat = new THREE.MeshStandardMaterial({ 
                color: 0x1e293b, 
                metalness: 0.8, 
                roughness: 0.3 
            });
            const stripeMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
            const glassMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
            const beaconRed = new THREE.MeshBasicMaterial({ color: 0xff0033 });
            const beaconGreen = new THREE.MeshBasicMaterial({ color: 0x00ff66 });
            const strobeWhite = new THREE.MeshBasicMaterial({ color: 0xffffff });

            // Fuselagem ampla e comprida
            const fuselage = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.65, 11.5, 12).rotateX(Math.PI / 2), airlinerMat);
            planeGroup.add(fuselage);

            // Faixa decorativa vermelha ao longo da fuselagem
            const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.22, 9.8), stripeMat);
            planeGroup.add(stripe);

            // Janelas do Cockpit na dianteira
            const cockpit = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.35, 1.2), glassMat);
            cockpit.position.set(0, 0.55, -4.5);
            planeGroup.add(cockpit);

            // Asas amplas com grande envergadura
            const wings = new THREE.Mesh(new THREE.BoxGeometry(12.5, 0.18, 2.2), wingMat);
            wings.position.set(0, 0.1, 0.2);
            planeGroup.add(wings);

            // Luzes de Navegação nas Pontas das Asas
            const navLeft = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), beaconRed);
            navLeft.position.set(-6.2, 0.12, 0.2);
            planeGroup.add(navLeft);
            const flareLeft = this.makeGlow(0xff0033, 1.2, 0.8);
            flareLeft.position.copy(navLeft.position);
            planeGroup.add(flareLeft);

            const navRight = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), beaconGreen);
            navRight.position.set(6.2, 0.12, 0.2);
            planeGroup.add(navRight);
            const flareRight = this.makeGlow(0x00ff66, 1.2, 0.8);
            flareRight.position.copy(navRight.position);
            planeGroup.add(flareRight);

            // Cauda (Estabilizador Vertical e Horizontal)
            const vFin = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.6, 2.0), stripeMat);
            vFin.position.set(0, 1.6, 4.6);
            planeGroup.add(vFin);

            const hFin = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.12, 1.2), wingMat);
            hFin.position.set(0, 0.7, 4.6);
            planeGroup.add(hFin);

            // Strobe branco na cauda
            const tailLight = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), strobeWhite);
            tailLight.position.set(0, 2.9, 4.2);
            planeGroup.add(tailLight);

            // Turbinas a Jato duplas sob as asas com labaredas azuis
            [-2.6, 2.6].forEach(tx => {
                const turbine = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 1.8, 10).rotateX(Math.PI / 2), airlinerMat);
                turbine.position.set(tx, -0.42, 0.4);
                planeGroup.add(turbine);

                const thrusterFlame = this.makeGlow(0x38bdf8, 1.4, 0.9);
                thrusterFlame.position.set(tx, -0.42, 1.6);
                planeGroup.add(thrusterFlame);
            });

            planeGroup.position.set(laneX, FLIGHT_Y + 0.4, spawnZ);
            planeGroup.flySpeed = Math.random() * 20 + 25;
            this.scene.add(planeGroup);
            this.skyObstacles.push(planeGroup);

        } else {
            const cableGroup = new THREE.Group();
            cableGroup.obstacleType = "powerlines";

            const poleMat = new THREE.MeshStandardMaterial({ color: 0x6e7587, metalness: 0.8 });
            const cableMat = new THREE.MeshBasicMaterial({ color: 0x222222 });

            [-7.2, 7.2].forEach(px => {
                const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 8.5, 8), poleMat);
                pole.position.set(px, 4.2, 0);
                cableGroup.add(pole);
            });

            [-0.5, 0, 0.5].forEach(dy => {
                const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 14.8, 6).rotateZ(Math.PI / 2), cableMat);
                wire.position.set(0, FLIGHT_Y + dy, 0);
                cableGroup.add(wire);
            });

            cableGroup.position.set(0, 0, spawnZ);
            cableGroup.flySpeed = 0;
            this.scene.add(cableGroup);
            this.skyObstacles.push(cableGroup);
        }
    }

    // =================================================================
    // COLETÁVEIS (MOEDAS, ESCUDOS, ÍMÃ MAGNÉTICO E MEGA BOOST)
    // =================================================================


    spawnCollectible() {
        const laneIndex = Math.floor(Math.random() * 3);
        const laneX = LANES[laneIndex];
        const spawnZ = -150 - (Math.random() * 20);

        // Determina a altura: cerca de 50% dos poderes spawnam "em cima" (altura de voo FLIGHT_Y)
        // para incentivar saltos de rampa e voos com o tanque de ar!
        const spawnInAir = (Math.random() < 0.52) || this.isFlying;
        const powerY = spawnInAir ? FLIGHT_Y : 1.35;

        const rand = Math.random();

        if (rand < 0.06 && this.lives < this.maxLives) {
            const heartGroup = new THREE.Group();
            const heartShape = new THREE.Shape();
            const x = 0, y = 0;
            heartShape.moveTo(x + 0.25, y + 0.25);
            heartShape.bezierCurveTo(x + 0.25, y + 0.25, x + 0.2, y, x, y);
            heartShape.bezierCurveTo(x - 0.3, y, x - 0.3, y + 0.35, x - 0.3, y + 0.35);
            heartShape.bezierCurveTo(x - 0.3, y + 0.55, x - 0.1, y + 0.77, x + 0.25, y + 0.95);
            heartShape.bezierCurveTo(x + 0.6, y + 0.77, x + 0.8, y + 0.55, x + 0.8, y + 0.35);
            heartShape.bezierCurveTo(x + 0.8, y + 0.35, x + 0.8, y, x + 0.5, y);
            heartShape.bezierCurveTo(x + 0.35, y, x + 0.25, y + 0.25, x + 0.25, y + 0.25);

            const heartGeo = new THREE.ExtrudeGeometry(heartShape, { steps: 1, depth: 0.22, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05 });
            heartGeo.center();
            const heartMat = new THREE.MeshStandardMaterial({ color: 0xff2a5a, emissive: 0xff1744, emissiveIntensity: 0.6 });
            const heartMesh = new THREE.Mesh(heartGeo, heartMat);
            heartMesh.rotation.z = Math.PI;
            heartMesh.scale.set(1.4, 1.4, 1.4);
            heartGroup.add(heartMesh);

            heartGroup.position.set(laneX, powerY, spawnZ);
            heartGroup.itemType = "heart";
            this.scene.add(heartGroup);
            this.collectibles.push(heartGroup);

        } else if (rand >= 0.06 && rand < 0.25 && this.shieldTimer <= 0) {
            // Escudo Protetor Hexagonal Colmeia 3D (Spawna com alta frequência no chão e em cima!)
            const shieldGroup = new THREE.Group();
            const shieldTex = this.getHoneycombShieldTexture();
            
            const shieldOrbGeo = new THREE.DodecahedronGeometry(0.72, 1);
            const shieldOrbMat = new THREE.MeshStandardMaterial({
                map: shieldTex,
                emissiveMap: shieldTex,
                emissive: 0xffffff,
                emissiveIntensity: 0.9,
                color: 0xffffff,
                roughness: 0.2,
                metalness: 0.8,
                transparent: true,
                opacity: 0.92
            });
            const orb = new THREE.Mesh(shieldOrbGeo, shieldOrbMat);
            shieldGroup.add(orb);

            // Anel orbital de proteção hexagonal dourado
            const ringGeo = new THREE.TorusGeometry(0.95, 0.05, 8, 32);
            const ringMat = new THREE.MeshStandardMaterial({
                color: 0xfbbf24,
                emissive: 0xf59e0b,
                emissiveIntensity: 0.85,
                metalness: 0.9,
                roughness: 0.2
            });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = Math.PI / 3;
            shieldGroup.add(ring);
            shieldGroup.ring = ring;

            // Halo de brilho âmbar/ciano
            const glow = this.makeGlow(0xf59e0b, 1.4, 0.35);
            shieldGroup.add(glow);

            shieldGroup.position.set(laneX, powerY, spawnZ);
            shieldGroup.itemType = "shield";
            this.scene.add(shieldGroup);
            this.collectibles.push(shieldGroup);

        } else if (rand >= 0.25 && rand < 0.44 && this.magnetTimer <= 0) {
            // Poder Magnético: Ímã de Moedas 3D (Atrai moedas em raio gigante de 18m!)
            const magnetGroup = new THREE.Group();

            const magnetShape = new THREE.Shape();
            magnetShape.absarc(0, 0, 0.52, 0, Math.PI, false);
            magnetShape.lineTo(-0.52, -0.55);
            magnetShape.lineTo(-0.24, -0.55);
            magnetShape.lineTo(-0.24, 0);
            magnetShape.absarc(0, 0, 0.24, Math.PI, 0, true);
            magnetShape.lineTo(0.24, -0.55);
            magnetShape.lineTo(0.52, -0.55);
            magnetShape.closePath();

            const magnetGeo = new THREE.ExtrudeGeometry(magnetShape, { depth: 0.2, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.03 });
            magnetGeo.center();
            const redMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xb91c1c, emissiveIntensity: 0.5, metalness: 0.8, roughness: 0.2 });
            const magnetMesh = new THREE.Mesh(magnetGeo, redMat);
            magnetGroup.add(magnetMesh);

            // Polos prateados das pontas
            const tipGeo = new THREE.BoxGeometry(0.3, 0.22, 0.24);
            const tipMat = new THREE.MeshStandardMaterial({ color: 0xdce2ec, metalness: 0.95, roughness: 0.1 });
            const tipL = new THREE.Mesh(tipGeo, tipMat);
            tipL.position.set(-0.38, -0.42, 0);
            magnetGroup.add(tipL);

            const tipR = new THREE.Mesh(tipGeo, tipMat);
            tipR.position.set(0.38, -0.42, 0);
            magnetGroup.add(tipR);

            // Anéis de fluxo magnético rotativo
            const fluxGeo = new THREE.TorusGeometry(0.82, 0.035, 8, 24);
            const fluxMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
            const fluxRing = new THREE.Mesh(fluxGeo, fluxMat);
            fluxRing.rotation.x = Math.PI / 2;
            magnetGroup.add(fluxRing);
            magnetGroup.fluxRing = fluxRing;

            const magGlow = this.makeGlow(0xfbbf24, 1.5, 0.45);
            magnetGroup.add(magGlow);

            magnetGroup.position.set(laneX, powerY, spawnZ);
            magnetGroup.itemType = "magnet";
            this.scene.add(magnetGroup);
            this.collectibles.push(magnetGroup);

        } else if (rand >= 0.44 && rand < 0.56 && this.megaBoostTimer <= 0) {
            // Item Raro: Mega Boost / Ar Infinito (Cápsula de Plasma de Fusão)
            const boostGroup = new THREE.Group();
            const capsuleGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.85, 16);
            const capsuleMat = new THREE.MeshStandardMaterial({
                color: 0x10b981,
                emissive: 0x34d399,
                emissiveIntensity: 0.95,
                metalness: 0.85,
                roughness: 0.15
            });
            const capsule = new THREE.Mesh(capsuleGeo, capsuleMat);
            capsule.rotation.z = Math.PI / 4;
            boostGroup.add(capsule);

            // Núcleo de fusão ciano hiper-luminoso
            const coreGeo = new THREE.SphereGeometry(0.32, 14, 14);
            const coreMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
            const core = new THREE.Mesh(coreGeo, coreMat);
            boostGroup.add(core);

            // Anéis de plasma em rotação cruzada
            const rGeo = new THREE.TorusGeometry(0.65, 0.045, 6, 24);
            const rMat = new THREE.MeshBasicMaterial({ color: 0x6ee7b7 });
            const ring1 = new THREE.Mesh(rGeo, rMat);
            ring1.rotation.x = Math.PI / 2;
            boostGroup.add(ring1);
            boostGroup.ring1 = ring1;

            const ring2 = new THREE.Mesh(rGeo, rMat);
            ring2.rotation.y = Math.PI / 2;
            boostGroup.add(ring2);
            boostGroup.ring2 = ring2;

            const glow = this.makeGlow(0x10b981, 1.5, 0.42);
            boostGroup.add(glow);

            boostGroup.position.set(laneX, powerY, spawnZ);
            boostGroup.itemType = "megaboost";
            this.scene.add(boostGroup);
            this.collectibles.push(boostGroup);

        } else {
            const count = 4;
            const coinY = spawnInAir ? FLIGHT_Y : 1.25;

            // Aro externo dourado metálico nítido (sem ofuscar)
            const rimGeo = new THREE.CylinderGeometry(0.44, 0.44, 0.09, 24).rotateX(Math.PI / 2);
            const rimMat = new THREE.MeshStandardMaterial({
                color: 0xed9a0c,
                emissive: 0x78350f,
                emissiveIntensity: 0.12,
                metalness: 0.88,
                roughness: 0.28
            });

            // Centro dourado polido com relevo elegante
            const coreGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.11, 18).rotateX(Math.PI / 2);
            const coreMat = new THREE.MeshStandardMaterial({
                color: 0xf5b731,
                emissive: 0x451a03,
                emissiveIntensity: 0.08,
                metalness: 0.85,
                roughness: 0.32
            });

            // Emblema central contrastante (losango dourado escurecido, não branco estourado)
            const emblemGeo = new THREE.BoxGeometry(0.16, 0.16, 0.13);
            const emblemMat = new THREE.MeshStandardMaterial({
                color: 0xa16207,
                metalness: 0.6,
                roughness: 0.4
            });

            for (let c = 0; c < count; c++) {
                const coinGroup = new THREE.Group();

                const rim = new THREE.Mesh(rimGeo, rimMat);
                coinGroup.add(rim);

                const core = new THREE.Mesh(coreGeo, coreMat);
                coinGroup.add(core);

                const emblem = new THREE.Mesh(emblemGeo, emblemMat);
                emblem.rotation.z = Math.PI / 4;
                coinGroup.add(emblem);

                // Halo de brilho suave e discreto (sem ofuscar a visão)
                const glow = this.makeGlow(0xfbbf24, 0.85, 0.18);
                coinGroup.add(glow);
                coinGroup.glowSprite = glow;

                // Posição e orientação voltada para a câmera
                coinGroup.position.set(laneX, coinY, spawnZ - (c * 4.5));
                coinGroup.rotation.x = -0.15; // leve inclinação para a visão do piloto
                coinGroup.baseY = coinY;
                coinGroup.itemType = "coin";

                this.scene.add(coinGroup);
                this.collectibles.push(coinGroup);
            }
        }
    }

    // =================================================================
    // CONTROLES RESPONSIVOS (TECLADO, TOUCH BUTTONS E SWIPE)
    // =================================================================


    smashTrafficCar(car) {
        car.isSmashed = true;
        const side = (car.position.x - this.truckGroup.position.x) >= 0 ? 1 : -1;
        car.smashVelocity = new THREE.Vector3(
            side * (16.0 + Math.random() * 8.0),
            14.0 + Math.random() * 8.0,
            -12.0 - Math.random() * 14.0
        );
        car.smashRot = new THREE.Vector3(
            Math.random() * 12 - 6,
            Math.random() * 14 - 7,
            Math.random() * 10 - 5
        );
        const pts = (this.activePilotPerks && this.activePilotPerks.smashBonus) || 300;
        this.addScoreEvent("SHIELD SMASH!", pts, true);
        this.sound.playShieldSmash();
        this.sound.playCrash();
        this.speakAnnouncer("Shield Smash!");
        this.triggerHaptic("hit");
        this.trackMissionProgress('shield_smash', 1);
    }





    initControls() {
        // Teclado
        window.addEventListener("keydown", (e) => {
            // Tecla [R] dedicada para reiniciar o jogo (apenas quando não estiver digitando em inputs)
            if ((e.key === "r" || e.key === "R") && !e.target.matches("input, textarea")) {
                if (!this.isRunning || (this.gameOverScreen && this.gameOverScreen.classList.contains("active"))) {
                    this.sound.init();
                    this.startGame();
                    return;
                }
            }

            // Desativa completamente a tecla [Enter] de reiniciar ou interferir na corrida
            if (e.key === "Enter" && !e.target.matches("input, textarea")) {
                e.preventDefault();
            }

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


    
    initTouchCustomizer() {
        // Carrega layout personalizado salvo no LocalStorage
        try {
            const savedLayout = JSON.parse(localStorage.getItem("roadster_touch_layout") || "null");
            if (savedLayout) {
                const btnMap = {
                    left: this.btnLeft,
                    right: this.btnRight,
                    slam: this.btnSlam,
                    boost: this.boostTouchBtn
                };
                Object.keys(savedLayout).forEach(k => {
                    const btn = btnMap[k];
                    if (btn && savedLayout[k]) {
                        btn.style.position = "fixed";
                        btn.style.left = savedLayout[k].left + "px";
                        btn.style.top = savedLayout[k].top + "px";
                        btn.style.bottom = "auto";
                        btn.style.right = "auto";
                        btn.style.zIndex = "99";
                    }
                });
            }
        } catch(e) {}

        // Cria o Banner de Controle de Edição de HUD caso não exista
        let banner = document.getElementById("touch-edit-banner");
        if (!banner) {
            banner = document.createElement("div");
            banner.id = "touch-edit-banner";
            banner.className = "touch-edit-banner";
            banner.innerHTML = `
                <span style="color: #f59e0b; font-weight: bold; font-size: 0.95rem;">🎮 MODO DE EDIÇÃO: Arraste os botões para onde quiser!</span>
                <div class="touch-edit-btn-row">
                    <button id="save-touch-layout-btn" class="primary-btn" style="padding: 6px 14px; font-size: 0.85rem;">✅ Salvar Posições</button>
                    <button id="reset-touch-layout-btn" class="secondary-btn" style="padding: 6px 14px; font-size: 0.85rem;">🔄 Redefinir Padrão</button>
                </div>
            `;
            document.body.appendChild(banner);

            document.getElementById("save-touch-layout-btn").addEventListener("click", () => {
                this.toggleTouchEditMode(false);
            });

            document.getElementById("reset-touch-layout-btn").addEventListener("click", () => {
                localStorage.removeItem("roadster_touch_layout");
                [this.btnLeft, this.btnRight, this.btnSlam, this.boostTouchBtn].forEach(btn => {
                    if (btn) {
                        btn.style.position = "";
                        btn.style.left = "";
                        btn.style.top = "";
                        btn.style.bottom = "";
                        btn.style.right = "";
                    }
                });
                this.toggleTouchEditMode(false);
                this.triggerActionPopup("🔄 Controles Redefinidos para o Padrão!");
            });
        }

        // Suporte a Arrastar (Drag and Drop Touch) em cada botão
        const setupDraggableBtn = (btn, key) => {
            if (!btn) return;
            let isDragging = false;
            let offsetLeft = 0;
            let offsetTop = 0;

            btn.addEventListener("touchstart", (e) => {
                if (!document.body.classList.contains("touch-edit-active")) return;
                isDragging = true;
                const touch = e.touches[0];
                const rect = btn.getBoundingClientRect();
                offsetLeft = touch.clientX - rect.left;
                offsetTop = touch.clientY - rect.top;
                btn.style.position = "fixed";
                btn.style.zIndex = "101";
                e.preventDefault();
            }, { passive: false });

            btn.addEventListener("touchmove", (e) => {
                if (!isDragging || !document.body.classList.contains("touch-edit-active")) return;
                const touch = e.touches[0];
                const newX = Math.max(10, Math.min(window.innerWidth - 70, touch.clientX - offsetLeft));
                const newY = Math.max(50, Math.min(window.innerHeight - 70, touch.clientY - offsetTop));
                btn.style.left = newX + "px";
                btn.style.top = newY + "px";
                btn.style.bottom = "auto";
                btn.style.right = "auto";
                e.preventDefault();
            }, { passive: false });

            btn.addEventListener("touchend", () => {
                if (isDragging) {
                    isDragging = false;
                    // Salva posição individual
                    try {
                        const saved = JSON.parse(localStorage.getItem("roadster_touch_layout") || "{}");
                        const rect = btn.getBoundingClientRect();
                        saved[key] = { left: Math.round(rect.left), top: Math.round(rect.top) };
                        localStorage.setItem("roadster_touch_layout", JSON.stringify(saved));
                    } catch(e) {}
                }
            });
        };

        setupDraggableBtn(this.btnLeft, "left");
        setupDraggableBtn(this.btnRight, "right");
        setupDraggableBtn(this.btnSlam, "slam");
        setupDraggableBtn(this.boostTouchBtn, "boost");
    }

    toggleTouchEditMode(forceState) {
        const body = document.body;
        const banner = document.getElementById("touch-edit-banner");
        const active = forceState !== undefined ? forceState : !body.classList.contains("touch-edit-active");

        if (active) {
            body.classList.add("touch-edit-active");
            if (banner) banner.classList.add("active");
            this.triggerActionPopup("🎮 Arraste os botões para onde preferir na tela!");
        } else {
            body.classList.remove("touch-edit-active");
            if (banner) banner.classList.remove("active");
            this.triggerActionPopup("✅ Layout de Controles Salvo!");
        }
    }

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
        this.p2.lives = (this.lives || 1);
        this.p2.crashed = false;
        this.p2.invulnTimer = 0;
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

                // Temporizador de invulnerabilidade do P2
                if (this.p2.invulnTimer > 0) this.p2.invulnTimer -= delta;

                // Colisão responsiva e instantânea do P2 com tráfego
                for (let i = 0; i < this.trafficCars.length; i++) {
                    const car = this.trafficCars[i];
                    if (car.isSmashed) continue;
                    const dX = Math.abs(this.p2.x - car.position.x);
                    const dZ = Math.abs(relativeZ - car.position.z);
                    const carHeight = car.boxHeight || 1.6;
                    if (dX < 1.85 && dZ < 4.85 && this.p2.y < carHeight) {
                        if (this.p2.invulnTimer <= 0) {
                            this.p2.lives--;
                            this.sound.playCrash();
                            this.p2.invulnTimer = 1.5;
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
            } else {
                // P2 BATEU: carro fica fixado na distância de batida e recua na pista conforme P1 segue
                const relativeZ = this.truckGroup.position.z + (this.p2.finalDist - this.scoreDistance);
                this.mpRivalVehicle.position.set(this.p2.x, GROUND_Y, relativeZ);
                this.mpRivalVehicle.rotation.z = 0.85; // Tomba lataria para o lado
                this.mpRivalVehicle.rotation.y = 0.35;
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

        // Botões de Perfil / Nickname
        const openUserModal = () => {
            this.sound.init();
            this.usernameInput.value = this.currentUser === "Piloto" ? "" : this.currentUser;
            this.usernameStatus.textContent = "";
            this.renderSavedAccounts();
            this.userModal.classList.add("active");
            setTimeout(() => this.usernameInput.focus(), 200);
        };
        if (this.hudUserBadge) this.hudUserBadge.addEventListener("click", openUserModal);
        if (this.menuUserBadge) this.menuUserBadge.addEventListener("click", openUserModal);
        if (this.closeUserModalBtn) this.closeUserModalBtn.addEventListener("click", () => {
            this.userModal.classList.remove("active");
        });

        if (this.loginUsernameBtn) {
            this.loginUsernameBtn.addEventListener("click", () => {
                this.loginUser(this.usernameInput.value.trim());
            });
        }

        if (this.usernameInput) {
            this.usernameInput.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    this.loginUser(this.usernameInput.value.trim());
                }
            });
        }

        if (this.saveUsernameBtn) {
            this.saveUsernameBtn.addEventListener("click", () => {
                const val = this.usernameInput.value.trim();
                if (val.length < 3) {
                    this.usernameStatus.className = "status-msg error";
                    this.usernameStatus.textContent = "O nome precisa ter pelo menos 3 letras!";
                    return;
                }
                this.registerUser(val);
            });
        }

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
                this.switchUser(acc);
                this.userModal.classList.remove("active");
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

        COIN_PACKAGES.forEach(pkg => {
            const card = document.createElement("div");
            card.className = "coin-package-card";
            card.innerHTML = `
                ${pkg.badge ? `<div class="pkg-badge">${pkg.badge}</div>` : ""}
                <div class="pkg-icon">${pkg.icon}</div>
                <div class="pkg-coins">${pkg.coins.toLocaleString()} MOEDAS</div>
                <div class="pkg-tag">${pkg.tag}</div>
                <button class="pkg-price-btn" data-pkg="${pkg.id}">
                    💳 R$ ${pkg.priceBRL.toFixed(2).replace('.', ',')}
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
        const pkg = COIN_PACKAGES.find(p => p.id === packageId);
        if (!pkg) return;

        this.selectedCheckoutPackage = pkg;

        if (this.mpPkgName) this.mpPkgName.textContent = `${pkg.coins.toLocaleString()} Moedas (${pkg.tag})`;
        if (this.mpPkgPrice) this.mpPkgPrice.textContent = `R$ ${pkg.priceBRL.toFixed(2).replace('.', ',')}`;
        if (this.mpPaymentStatus) {
            this.mpPaymentStatus.className = "status-msg";
            this.mpPaymentStatus.textContent = "Conectando ao gateway Mercado Pago...";
        }

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
                if (this.mpCheckoutLink) {
                    this.mpCheckoutLink.href = data.init_point || "#";
                    this.mpCheckoutLink.target = "_blank";
                    this.mpCheckoutLink.style.display = "block";
                }
                if (this.mpPixCode) {
                    this.mpPixCode.textContent = data.pixCode || "00020126580014br.gov.bcb.pix0136pix-mercadopago-roadsterdash-coins5204000053039865802BR5916ROADSTER DASH6009SAO PAULO";
                }
                if (this.mpPaymentStatus) {
                    this.mpPaymentStatus.className = "status-msg success";
                    this.mpPaymentStatus.textContent = data.mode === "live" 
                        ? "Link de pagamento seguro gerado com sucesso!" 
                        : "Modo Demonstração / Teste Ativo! Use o simulador abaixo para aprovar:";
                }
            } else {
                throw new Error(data.error || "Falha ao gerar preferência");
            }
        } catch(err) {
            // Fallback offline / sem conexão backend
            if (this.mpPixCode) {
                this.mpPixCode.textContent = `00020126580014br.gov.bcb.pix0136pix-roadsterdash-${pkg.id}520400005303986540${pkg.priceBRL.toFixed(2)}5802BR5916ROADSTER DASH`;
            }
            if (this.mpCheckoutLink) {
                this.mpCheckoutLink.href = "https://www.mercadopago.com.br";
            }
            if (this.mpPaymentStatus) {
                this.mpPaymentStatus.className = "status-msg";
                this.mpPaymentStatus.textContent = "Ambiente offline. Você pode testar e aprovar instantaneamente clicando em SIMULAR APROVAÇÃO!";
            }
        }
    }

    async simulatePaymentApproval() {
        if (!this.selectedCheckoutPackage) return;
        const pkg = this.selectedCheckoutPackage;

        if (this.mpPaymentStatus) {
            this.mpPaymentStatus.className = "status-msg";
            this.mpPaymentStatus.textContent = "Processando confirmação Pix / Cartão...";
        }

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
            if (data.success && data.newBalance !== undefined) {
                this.totalCoins = data.newBalance;
            } else {
                this.totalCoins += pkg.coins;
            }
        } catch(e) {
            this.totalCoins += pkg.coins;
        }

        localStorage.setItem("roadster_coins", this.totalCoins.toString());
        this.updateUserCoinsEverywhere();

        if (this.mpPaymentStatus) {
            this.mpPaymentStatus.className = "status-msg success";
            this.mpPaymentStatus.textContent = `🎉 Pagamento Aprovado! +${pkg.coins.toLocaleString()} Moedas creditadas na sua conta!`;
        }

        this.sound.playMissionComplete();
        this.speakAnnouncer("Payment Approved! Coins Added!", true);
        this.triggerActionPopup(`+${pkg.coins.toLocaleString()} MOEDAS VIP!`);

        setTimeout(() => {
            if (this.mpPaymentModal) this.mpPaymentModal.classList.remove("active");
            if (this.shopUserBalance) this.shopUserBalance.textContent = this.totalCoins.toLocaleString();
        }, 1800);
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



    }

    window.RoadsterDashGame = RoadsterDashGame;
    window.addEventListener("DOMContentLoaded", () => {
        window.game = new RoadsterDashGame();
    });
})();
