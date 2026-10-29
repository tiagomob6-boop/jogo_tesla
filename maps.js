/**
 * maps.js - Sistema de Mapas, Circuitos e Progressão Data-Driven
 * Gerencia os 5 mapas oficiais do Roadster Dash, seus custos e multiplicadores de gameplay.
 */

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
export function getAllMaps() {
    return Object.values(MAPS_CATALOG);
}

/**
 * Retorna os dados do mapa a partir do seu identificador (com fallback para rodovia_dupla)
 */
export function getMapById(mapId) {
    return MAPS_CATALOG[mapId] || MAPS_CATALOG.rodovia_dupla;
}

/**
 * Verifica se o mapa especificado está desbloqueado para o usuário
 */
export function isMapUnlocked(mapId, unlockedMapsArray = []) {
    if (mapId === 'rodovia_dupla') return true;
    return Array.isArray(unlockedMapsArray) && unlockedMapsArray.includes(mapId);
}

/**
 * Aplica os bônus do mapa no ganho de moedas
 */
export function calculateMapCoinBonus(baseCoins, activeMap) {
    const mult = (activeMap && activeMap.coinMultiplier) ? activeMap.coinMultiplier : 1.0;
    return Math.round(baseCoins * mult);
}

/**
 * Aplica os bônus do mapa na pontuação da corrida
 */
export function calculateMapScoreBonus(baseDeltaScore, activeMap) {
    const mult = (activeMap && activeMap.scoreMultiplier) ? activeMap.scoreMultiplier : 1.0;
    return baseDeltaScore * mult;
}
