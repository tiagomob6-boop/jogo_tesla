        // =====================================================================
        // CATÁLOGO DE PACOTES DE MOEDAS (LOJA DE MOEDAS & MERCADO PAGO)
        // =====================================================================
export const COIN_PACKAGES = {
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
export const CAR_CATALOG = {
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
export const PILOT_CATALOG = {
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
            }
        };

        // =====================================================================
        // MISSÕES DIÁRIAS / DESAFIOS CYBERPUNK
        // =====================================================================
export const DAILY_MISSION_DEFS = [
            { id: 'coins_50', type: 'coins', target: 50, reward: 75, icon: '🪙', title: 'Caçador de Moedas', desc: 'Colete 50 moedas em corridas hoje' },
            { id: 'smash_3', type: 'shield_smash', target: 3, reward: 100, icon: '🛡️', title: 'Demolição com Escudo', desc: 'Destrua 3 carros de trânsito usando o escudo' },
            { id: 'near_miss_5', type: 'near_miss', target: 5, reward: 60, icon: '⚡', title: 'Reflexos Cyberpunk', desc: 'Faça 5 raspões (Near Miss) no tráfego' },
            { id: 'stunts_3', type: 'stunt', target: 3, reward: 80, icon: '🛹', title: 'Acrobata dos Céus', desc: 'Realize 3 manobras acrobáticas em rampas' },
            { id: 'speed_3', type: 'speed_level', target: 3, reward: 90, icon: '⏱️', title: 'Velocidade Extrema', desc: 'Sobreviva até alcançar o Nível 3 de velocidade' }
        ];

        // Rota base da API REST (compatível com Render e Local)
const isBrowser = typeof window !== 'undefined';
const isLocalHost = isBrowser && (window.location.hostname === "localhost" || window.location.port === "3000" || window.location.hostname.includes("onrender.com"));
export const API_URL = isLocalHost
    ? ""
    : (isBrowser && window.localStorage && window.localStorage.getItem("roadster_api_url") || "https://jogo-tesla.onrender.com");

        // =====================================================================
        // CONSTANTES DA RODOVIA
        // =====================================================================
export const LANES = [-3.8, 0.0, 3.8];
export const GROUND_Y = 0.52;
export const FLIGHT_Y = 5.0;
export const GRAVITY = -36.0;
export const SLAM_FORCE = -34.0;

