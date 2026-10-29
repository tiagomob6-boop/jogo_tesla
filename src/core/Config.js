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

// =====================================================================
// CATÁLOGO OFICIAL DOS 5 MAPAS E CIRCUITOS
// =====================================================================
export const MAPS_CATALOG = {
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

