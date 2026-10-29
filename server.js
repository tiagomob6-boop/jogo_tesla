const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = process.env.PORT || 3000;

// Configuração do Mercado Pago
const mpAccessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN || '';
let mpClient = null;
if (mpAccessToken) {
    try {
        mpClient = new MercadoPagoConfig({ accessToken: mpAccessToken });
        console.log('💳 Mercado Pago inicializado com sucesso.');
    } catch (e) {
        console.warn('⚠️ Falha ao inicializar SDK do Mercado Pago:', e.message);
    }
} else {
    console.log('ℹ️ MERCADO_PAGO_ACCESS_TOKEN não definido. Modo demonstração/teste ativado para a loja.');
}

app.use(cors());
app.use(express.json());

// =============================================================================
// CATÁLOGO DE PACOTES DE MOEDAS (LOJA DE MOEDAS COM MERCADO PAGO)
// =============================================================================
const COIN_PACKAGES = {
    pacote_500: {
        id: 'pacote_500',
        name: 'Pacote Básico de Moedas',
        coins: 500,
        price: 4.90,
        desc: '500 Moedas para upgrades e novos pilotos'
    },
    pacote_1500: {
        id: 'pacote_1500',
        name: 'Pacote Neon Popular',
        coins: 1500,
        price: 9.90,
        tag: 'Mais Vendido ⭐',
        desc: '1.500 Moedas para desbloquear carros da garagem'
    },
    pacote_4000: {
        id: 'pacote_4000',
        name: 'Pacote Piloto Pro',
        coins: 4000,
        price: 19.90,
        tag: '+25% Bônus 🔥',
        desc: '4.000 Moedas para equipar os veículos mais rápidos'
    },
    pacote_10000: {
        id: 'pacote_10000',
        name: 'Cofre Hiperdrive Cyberpunk',
        coins: 10000,
        price: 39.90,
        tag: '+50% Bônus 💎',
        desc: '10.000 Moedas - Melhor custo-benefício de Sunset Highway!'
    },
    map_cyber_premium: {
        id: 'map_cyber_premium',
        name: 'Pista Premium Cyber Super-Speedway',
        type: 'map',
        price: 10.90,
        tag: 'Exclusivo VIP ⚡',
        desc: 'Desbloqueio Permanente do Mapa 5: +50% Pontuação Global E Moedas em Dobro (2x Moedas)!'
    }
};

// =============================================================================
// CATÁLOGO DE CARROS OFICIAIS (VALIDAÇÃO DE PREÇOS NO BACKEND)
// =============================================================================
const CAR_CATALOG = {
    roadster: { name: 'Roadster 2077', price: 0, bonus: 'Balanceado' },
    rusty: { name: 'Rusty Rod 1984', price: 50, bonus: 'Lataria de Ferro' },
    cybertruck: { name: 'Cybertruck Apex', price: 250, bonus: '+1 Vida Inicial' },
    phantom: { name: 'Neon Phantom', price: 600, bonus: '+25% Tanque de Ar' },
    solaris: { name: 'Solaris Hypercar', price: 1200, bonus: '+15% Velocidade & Score' }
};

// =============================================================================
// BANCO DE DADOS: NEON POSTGRESQL COM FALLBACK EM MEMÓRIA
// =============================================================================
let pool = null;
let useDb = false;

// Armazenamento em memória (usado para testes locais antes de configurar o Neon)
const memoryStore = {
    users: new Map(),
    scores: []
};

// Usuários demonstrativos iniciais no ranking
memoryStore.users.set('CyberRacer', {
    username: 'CyberRacer',
    coins: 1450,
    best_score: 18450,
    selected_car: 'solaris',
    unlocked_cars: ['roadster', 'cybertruck', 'solaris']
});
memoryStore.users.set('NeonGhost', {
    username: 'NeonGhost',
    coins: 820,
    best_score: 14200,
    selected_car: 'phantom',
    unlocked_cars: ['roadster', 'phantom']
});
memoryStore.users.set('TeslaPilot', {
    username: 'TeslaPilot',
    coins: 340,
    best_score: 9800,
    selected_car: 'cybertruck',
    unlocked_cars: ['roadster', 'cybertruck']
});

if (process.env.DATABASE_URL) {
    try {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
        });
        useDb = true;
        console.log('⚡ Conectando ao Neon PostgreSQL Serverless...');
    } catch (err) {
        console.warn('⚠️ Falha ao configurar Pool do PostgreSQL. Usando fallback em memória:', err.message);
        useDb = false;
    }
} else {
    console.log('ℹ️ Nenhuma DATABASE_URL fornecida. Servidor rodando em modo Local Memory Fallback.');
    console.log('💡 Para conectar ao Neon, crie um banco em https://neon.tech e configure DATABASE_URL no .env ou no Render.');
}

async function initDatabase() {
    if (!useDb || !pool) return;
    try {
        const client = await pool.connect();
        try {
            await client.query(`
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(50) UNIQUE NOT NULL,
                    coins INTEGER DEFAULT 0,
                    best_score INTEGER DEFAULT 0,
                    selected_car VARCHAR(50) DEFAULT 'roadster',
                    unlocked_cars TEXT[] DEFAULT ARRAY['roadster'],
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS scores (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(50) NOT NULL,
                    score INTEGER NOT NULL,
                    distance INTEGER NOT NULL,
                    car_used VARCHAR(50) DEFAULT 'roadster',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );

                CREATE INDEX IF NOT EXISTS idx_users_best_score ON users(best_score DESC);
                CREATE INDEX IF NOT EXISTS idx_scores_score ON scores(score DESC);

                ALTER TABLE users ADD COLUMN IF NOT EXISTS upgrades JSONB DEFAULT '{}'::jsonb;
            `);
            console.log('✅ Banco de Dados Neon Postgres inicializado com sucesso (tabelas users e scores prontas).');
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('❌ Erro ao conectar ao Neon PostgreSQL:', err.message);
        console.log('⚠️ Revertendo automaticamente para o modo Local Memory Fallback.');
        useDb = false;
    }
}

initDatabase();

// =============================================================================
// ROTAS DA API REST
// =============================================================================

// 1. Healthcheck
app.get('/api/health', (req, res) => {
    res.json({
        status: 'online',
        database: useDb ? 'Neon PostgreSQL' : 'Local Memory Fallback',
        timestamp: new Date().toISOString()
    });
});

// 2. Registro ou Login por Nickname Único
app.post('/api/user/login', async (req, res) => {
    const rawUsername = (req.body.username || '').trim();
    if (!rawUsername) {
        return res.status(400).json({ error: 'Informe seu Nickname para entrar.' });
    }

    if (useDb && pool) {
        try {
            const findRes = await pool.query('SELECT username, coins, best_score, selected_car, unlocked_cars, COALESCE(upgrades, \'{}\'::jsonb) as upgrades FROM users WHERE LOWER(username) = LOWER($1)', [rawUsername]);
            if (findRes.rows.length === 0) {
                return res.status(404).json({ error: 'Piloto não encontrado. Verifique o nome ou cadastre um novo piloto.' });
            }
            const user = findRes.rows[0];
            await pool.query('UPDATE users SET last_seen = CURRENT_TIMESTAMP WHERE LOWER(username) = LOWER($1)', [rawUsername]);
            return res.json({ success: true, user });
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    } else {
        for (const [_, u] of memoryStore.users.entries()) {
            if (u.username.toLowerCase() === rawUsername.toLowerCase()) {
                return res.json({ success: true, user: u });
            }
        }
        return res.status(404).json({ error: 'Piloto não encontrado.' });
    }
});

// 2. Registro ou Login por Nickname Único
app.post('/api/user/register', async (req, res) => {
    const rawUsername = (req.body.username || '').trim();
    if (!rawUsername || rawUsername.length < 3 || rawUsername.length > 20) {
        return res.status(400).json({ error: 'O nome precisa ter entre 3 e 20 caracteres.' });
    }

    const cleanUsername = rawUsername.replace(/[^a-zA-Z0-9_-]/g, '');
    if (!cleanUsername) {
        return res.status(400).json({ error: 'Nome contém caracteres inválidos.' });
    }

    if (useDb && pool) {
        try {
            const findRes = await pool.query('SELECT * FROM users WHERE LOWER(username) = LOWER($1)', [cleanUsername]);
            if (findRes.rows.length > 0) {
                const user = findRes.rows[0];
                await pool.query('UPDATE users SET last_seen = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);
                return res.json({
                    success: true,
                    isNew: false,
                    user: {
                        username: user.username,
                        coins: user.coins,
                        best_score: user.best_score,
                        selected_car: user.selected_car,
                        unlocked_cars: user.unlocked_cars,
                        upgrades: user.upgrades || {}
                    }
                });
            }

            const insertRes = await pool.query(`
                INSERT INTO users (username, coins, best_score, selected_car, unlocked_cars, upgrades)
                VALUES ($1, 0, 0, 'roadster', ARRAY['roadster'], '{}'::jsonb)
                RETURNING *
            `, [cleanUsername]);

            const newUser = insertRes.rows[0];
            return res.json({
                success: true,
                isNew: true,
                user: {
                    username: newUser.username,
                    coins: newUser.coins,
                    best_score: newUser.best_score,
                    selected_car: newUser.selected_car,
                    unlocked_cars: newUser.unlocked_cars,
                    upgrades: newUser.upgrades || {}
                }
            });
        } catch (err) {
            console.error('Erro ao registrar usuário no DB:', err);
            return res.status(500).json({ error: 'Erro interno ao registrar usuário.' });
        }
    } else {
        let user = null;
        for (const [_, u] of memoryStore.users.entries()) {
            if (u.username.toLowerCase() === cleanUsername.toLowerCase()) {
                user = u;
                break;
            }
        }

        if (user) {
            return res.json({ success: true, isNew: false, user });
        }

        const newUser = {
            username: cleanUsername,
            coins: 0,
            best_score: 0,
            selected_car: 'roadster',
            unlocked_cars: ['roadster']
        };
        memoryStore.users.set(cleanUsername, newUser);
        return res.json({ success: true, isNew: true, user: newUser });
    }
});

// 3. Consultar dados do usuário
app.get('/api/user/:username', async (req, res) => {
    const username = req.params.username;
    if (useDb && pool) {
        try {
            const result = await pool.query('SELECT username, coins, best_score, selected_car, unlocked_cars, COALESCE(upgrades, \'{}\'::jsonb) as upgrades FROM users WHERE LOWER(username) = LOWER($1)', [username]);
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Usuário não encontrado.' });
            }
            return res.json({ success: true, user: result.rows[0] });
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    } else {
        const user = memoryStore.users.get(username);
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }
        return res.json({ success: true, user });
    }
});

// 4. Compra de Novo Carro na Garagem
app.post('/api/user/buy-car', async (req, res) => {
    const { username, carId } = req.body;
    const carInfo = CAR_CATALOG[carId];

    if (!carInfo) {
        return res.status(400).json({ error: 'Carro inválido.' });
    }

    if (useDb && pool) {
        try {
            const findRes = await pool.query('SELECT * FROM users WHERE LOWER(username) = LOWER($1)', [username]);
            if (findRes.rows.length === 0) return res.status(404).json({ error: 'Usuário não encontrado.' });

            const user = findRes.rows[0];
            if (user.unlocked_cars.includes(carId)) {
                return res.status(400).json({ error: 'Você já possui este carro.' });
            }

            if (user.coins < carInfo.price) {
                return res.status(400).json({ error: 'Moedas insuficientes para comprar este carro.' });
            }

            const updatedCoins = user.coins - carInfo.price;
            const updatedCars = [...user.unlocked_cars, carId];

            const updateRes = await pool.query(`
                UPDATE users
                SET coins = $1, unlocked_cars = $2, selected_car = $3
                WHERE id = $4
                RETURNING username, coins, best_score, selected_car, unlocked_cars
            `, [updatedCoins, updatedCars, carId, user.id]);

            return res.json({ success: true, user: updateRes.rows[0], message: `Parabéns! Você desbloqueou o ${carInfo.name}!` });
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    } else {
        const user = memoryStore.users.get(username);
        if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

        if (user.unlocked_cars.includes(carId)) {
            return res.status(400).json({ error: 'Você já possui este carro.' });
        }
        if (user.coins < carInfo.price) {
            return res.status(400).json({ error: 'Moedas insuficientes.' });
        }

        user.coins -= carInfo.price;
        user.unlocked_cars.push(carId);
        user.selected_car = carId;
        return res.json({ success: true, user, message: `Parabéns! Você desbloqueou o ${carInfo.name}!` });
    }
});

// 5. Equipar Carro
app.post('/api/user/select-car', async (req, res) => {
    const { username, carId } = req.body;
    if (!CAR_CATALOG[carId]) return res.status(400).json({ error: 'Carro inválido.' });

    if (useDb && pool) {
        try {
            const findRes = await pool.query('SELECT * FROM users WHERE LOWER(username) = LOWER($1)', [username]);
            if (findRes.rows.length === 0) return res.status(404).json({ error: 'Usuário não encontrado.' });

            const user = findRes.rows[0];
            if (!user.unlocked_cars.includes(carId)) {
                return res.status(400).json({ error: 'Você ainda não possui este carro.' });
            }

            await pool.query('UPDATE users SET selected_car = $1 WHERE id = $2', [carId, user.id]);
            return res.json({ success: true, selected_car: carId });
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    } else {
        const user = memoryStore.users.get(username);
        if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
        if (!user.unlocked_cars.includes(carId)) {
            return res.status(400).json({ error: 'Você ainda não possui este carro.' });
        }
        user.selected_car = carId;
        return res.json({ success: true, selected_car: carId });
    }
});

// 5.1 Comprar Upgrade de Veículo (Tanque de Ar ou Blindagem de Vida)
app.post('/api/user/upgrade', async (req, res) => {
    const { username, upgradeType } = req.body;
    const UPGRADE_COSTS = {
        phantom_air: 100,
        cybertruck_armor: 150
    };

    const cost = UPGRADE_COSTS[upgradeType];
    if (!cost) return res.status(400).json({ error: 'Tipo de upgrade inválido.' });

    if (useDb && pool) {
        try {
            const findRes = await pool.query('SELECT * FROM users WHERE LOWER(username) = LOWER($1)', [username]);
            if (findRes.rows.length === 0) return res.status(404).json({ error: 'Usuário não encontrado.' });

            const user = findRes.rows[0];
            if (user.coins < cost) return res.status(400).json({ error: 'Moedas insuficientes para este upgrade.' });

            const currentUpgrades = user.upgrades || {};
            const currentLevel = parseInt(currentUpgrades[upgradeType] || 0, 10);
            const newUpgrades = { ...currentUpgrades, [upgradeType]: currentLevel + 1 };
            const updatedCoins = user.coins - cost;

            const updateRes = await pool.query(`
                UPDATE users
                SET coins = $1, upgrades = $2
                WHERE id = $3
                RETURNING username, coins, best_score, selected_car, unlocked_cars, upgrades
            `, [updatedCoins, newUpgrades, user.id]);

            return res.json({ success: true, user: updateRes.rows[0], message: 'Upgrade realizado com sucesso!' });
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    } else {
        const user = memoryStore.users.get(username);
        if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
        if (user.coins < cost) return res.status(400).json({ error: 'Moedas insuficientes.' });

        user.upgrades = user.upgrades || {};
        user.upgrades[upgradeType] = (user.upgrades[upgradeType] || 0) + 1;
        user.coins -= cost;
        return res.json({ success: true, user, message: 'Upgrade realizado com sucesso!' });
    }
});

// 6. Enviar Pontuação e Moedas Ganhas na Corrida
app.post('/api/score/submit', async (req, res) => {
    const { username, score, distance, coinsEarned, carUsed } = req.body;

    const safeScore = Math.max(0, parseInt(score, 10) || 0);
    const safeDistance = Math.max(0, parseInt(distance, 10) || 0);
    const safeCoins = Math.max(0, parseInt(coinsEarned, 10) || 0);
    const safeCar = CAR_CATALOG[carUsed] ? carUsed : 'roadster';

    if (!username) return res.status(400).json({ error: 'Usuário não informado.' });

    if (useDb && pool) {
        try {
            const findRes = await pool.query('SELECT * FROM users WHERE LOWER(username) = LOWER($1)', [username]);
            if (findRes.rows.length === 0) return res.status(404).json({ error: 'Usuário não encontrado.' });

            const user = findRes.rows[0];
            const isNewRecord = safeScore > user.best_score;
            const newBestScore = isNewRecord ? safeScore : user.best_score;
            const updatedCoins = user.coins + safeCoins;

            await pool.query(`
                UPDATE users
                SET coins = $1, best_score = $2, last_seen = CURRENT_TIMESTAMP
                WHERE id = $3
            `, [updatedCoins, newBestScore, user.id]);

            await pool.query(`
                INSERT INTO scores (username, score, distance, car_used)
                VALUES ($1, $2, $3, $4)
            `, [user.username, safeScore, safeDistance, safeCar]);

            return res.json({
                success: true,
                isNewRecord,
                coins: updatedCoins,
                best_score: newBestScore
            });
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    } else {
        const user = memoryStore.users.get(username);
        if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

        const isNewRecord = safeScore > user.best_score;
        if (isNewRecord) user.best_score = safeScore;
        user.coins += safeCoins;

        memoryStore.scores.push({
            username: user.username,
            score: safeScore,
            distance: safeDistance,
            car_used: safeCar,
            created_at: new Date()
        });

        return res.json({
            success: true,
            isNewRecord,
            coins: user.coins,
            best_score: user.best_score
        });
    }
});

// 7. Obter Ranking Global (Top 15 Melhores Usuários)
app.get('/api/leaderboard', async (req, res) => {
    if (useDb && pool) {
        try {
            const result = await pool.query(`
                SELECT username, best_score, selected_car, last_seen
                FROM users
                WHERE best_score > 0
                ORDER BY best_score DESC
                LIMIT 15
            `);
            return res.json({ success: true, leaderboard: result.rows });
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    } else {
        const usersArray = Array.from(memoryStore.users.values())
            .filter(u => u.best_score > 0)
            .sort((a, b) => b.best_score - a.best_score)
            .slice(0, 15)
            .map(u => ({
                username: u.username,
                best_score: u.best_score,
                selected_car: u.selected_car,
                last_seen: new Date()
            }));
        return res.json({ success: true, leaderboard: usersArray });
    }
});

// =============================================================================
// SERVIDOR MULTIPLAYER REAL-TIME VIA WEBSOCKET (SALAS & MATCHMAKING)
// =============================================================================
const mpRooms = new Map(); // roomCode -> { code, hostId, state: 'waiting'|'racing', players: Map }

function generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

function getRoomSummary(room) {
    const list = [];
    for (const [id, p] of room.players.entries()) {
        list.push({
            id,
            username: p.username,
            selectedCar: p.selectedCar,
            isHost: id === room.hostId,
            isReady: !!p.isReady
        });
    }
    return list;
}

function broadcastToRoom(room, msgObj, excludeId = null) {
    const raw = JSON.stringify(msgObj);
    for (const [id, p] of room.players.entries()) {
        if (id !== excludeId && p.ws && p.ws.readyState === WebSocket.OPEN) {
            p.ws.send(raw);
        }
    }
}

wss.on('connection', (ws) => {
    let currentRoomCode = null;
    let playerId = 'p_' + Math.random().toString(36).substring(2, 9);

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            // 1. Criar Nova Sala Privada
            if (data.type === 'create_room') {
                let code = generateRoomCode();
                while (mpRooms.has(code)) code = generateRoomCode();

                const room = {
                    code,
                    hostId: playerId,
                    createdAt: Date.now(),
                    state: 'waiting',
                    players: new Map()
                };
                room.players.set(playerId, {
                    ws,
                    id: playerId,
                    username: data.username || 'Piloto',
                    selectedCar: data.selectedCar || 'roadster',
                    isReady: false
                });
                mpRooms.set(code, room);
                currentRoomCode = code;

                ws.send(JSON.stringify({
                    type: 'room_created',
                    roomCode: code,
                    playerId,
                    players: getRoomSummary(room)
                }));
            }

            // 2. Entrar em Sala Existente com Código
            else if (data.type === 'join_room') {
                const code = (data.roomCode || '').trim().toUpperCase();
                const room = mpRooms.get(code);
                if (!room) {
                    return ws.send(JSON.stringify({ type: 'error', message: 'Sala não encontrada. Verifique o código.' }));
                }
                if (room.players.size >= 4) {
                    return ws.send(JSON.stringify({ type: 'error', message: 'Esta sala já está cheia (máximo 4 pilotos).' }));
                }

                currentRoomCode = code;
                room.players.set(playerId, {
                    ws,
                    id: playerId,
                    username: data.username || 'Piloto',
                    selectedCar: data.selectedCar || 'roadster',
                    isReady: true
                });

                ws.send(JSON.stringify({
                    type: 'room_joined',
                    roomCode: code,
                    playerId,
                    players: getRoomSummary(room)
                }));

                broadcastToRoom(room, {
                    type: 'player_joined',
                    playerId,
                    username: data.username || 'Piloto',
                    selectedCar: data.selectedCar || 'roadster',
                    players: getRoomSummary(room)
                }, playerId);
            }

            // 3. Partida Rápida (Matchmaking Automático)
            else if (data.type === 'quick_match') {
                let foundRoom = null;
                for (const [c, r] of mpRooms.entries()) {
                    if (r.state === 'waiting' && r.players.size === 1) {
                        foundRoom = r;
                        break;
                    }
                }

                if (foundRoom) {
                    currentRoomCode = foundRoom.code;
                    foundRoom.players.set(playerId, {
                        ws,
                        id: playerId,
                        username: data.username || 'Piloto',
                        selectedCar: data.selectedCar || 'roadster',
                        isReady: true
                    });

                    ws.send(JSON.stringify({
                        type: 'match_found',
                        roomCode: foundRoom.code,
                        playerId,
                        players: getRoomSummary(foundRoom)
                    }));

                    broadcastToRoom(foundRoom, {
                        type: 'match_found',
                        roomCode: foundRoom.code,
                        players: getRoomSummary(foundRoom)
                    }, playerId);

                    // Dispara a largada da corrida
                    foundRoom.state = 'racing';
                    setTimeout(() => {
                        broadcastToRoom(foundRoom, {
                            type: 'race_start',
                            countdown: 3
                        });
                    }, 500);
                } else {
                    let code = generateRoomCode();
                    const room = {
                        code,
                        hostId: playerId,
                        createdAt: Date.now(),
                        state: 'waiting',
                        players: new Map()
                    };
                    room.players.set(playerId, {
                        ws,
                        id: playerId,
                        username: data.username || 'Piloto',
                        selectedCar: data.selectedCar || 'roadster',
                        isReady: true
                    });
                    mpRooms.set(code, room);
                    currentRoomCode = code;

                    ws.send(JSON.stringify({
                        type: 'waiting_match',
                        roomCode: code,
                        playerId
                    }));
                }
            }

            // 4. Iniciar Corrida Manual (Host da Sala)
            else if (data.type === 'start_race') {
                const room = mpRooms.get(currentRoomCode);
                if (room && room.hostId === playerId) {
                    room.state = 'racing';
                    broadcastToRoom(room, {
                        type: 'race_start',
                        countdown: 3
                    });
                }
            }

            // 5. Telemetria em Tempo Real (Posição, Distância, Pulo, Escudo)
            else if (data.type === 'player_state') {
                const room = mpRooms.get(currentRoomCode);
                if (room && room.players.has(playerId)) {
                    broadcastToRoom(room, {
                        type: 'rival_update',
                        playerId,
                        clientTime: data.clientTime || Date.now(),
                        serverTime: Date.now(),
                        username: data.username,
                        selectedCar: data.selectedCar,
                        x: data.x,
                        y: data.y,
                        lane: data.lane,
                        dist: data.dist,
                        speed: data.speed,
                        isFlying: data.isFlying,
                        shield: data.shield,
                        score: data.score
                    }, playerId);
                }
            }

            // 6. Eliminação de Piloto / Batida
            else if (data.type === 'player_crashed') {
                const room = mpRooms.get(currentRoomCode);
                if (room && room.players.has(playerId)) {
                    broadcastToRoom(room, {
                        type: 'rival_crashed',
                        playerId,
                        dist: data.dist || 0,
                        reason: data.reason || 'Bateu no tráfego'
                    }, playerId);
                }
            }
        } catch(e) {}
    });

    ws.on('close', () => {
        if (currentRoomCode && mpRooms.has(currentRoomCode)) {
            const room = mpRooms.get(currentRoomCode);
            room.players.delete(playerId);
            if (room.players.size === 0) {
                mpRooms.delete(currentRoomCode);
            } else {
                broadcastToRoom(room, {
                    type: 'player_left',
                    playerId,
                    players: getRoomSummary(room)
                });
            }
        }
    });
});

// Endpoint de estatísticas multiplayer
app.get('/api/multiplayer/stats', (req, res) => {
    let totalPlayers = 0;
    for (const r of mpRooms.values()) totalPlayers += r.players.size;
    res.json({
        success: true,
        activeRooms: mpRooms.size,
        activePlayers: totalPlayers
    });
});

// Catálogo de carros para o frontend consultar
app.get('/api/cars', (req, res) => {
    res.json({ success: true, catalog: CAR_CATALOG });
});

// =============================================================================
// ENDPOINTS DE PAGAMENTO & COMPRA DE MOEDAS (MERCADO PAGO)
// =============================================================================
async function creditUserCoins(username, amount) {
    const coinsToAdd = Math.max(0, parseInt(amount, 10) || 0);
    if (!username || coinsToAdd <= 0) return null;

    if (useDb && pool) {
        try {
            const res = await pool.query(`
                UPDATE users
                SET coins = coins + $1
                WHERE LOWER(username) = LOWER($2)
                RETURNING username, coins
            `, [coinsToAdd, username]);
            if (res.rows.length > 0) return res.rows[0];
        } catch (e) {
            console.error('Erro ao creditar moedas no DB:', e);
        }
    }

    const user = memoryStore.users.get(username);
    if (user) {
        user.coins = (user.coins || 0) + coinsToAdd;
        return { username, coins: user.coins };
    }
    return { username, coins: coinsToAdd };
}

// 1. Listar pacotes de moedas disponíveis
app.get('/api/payment/packages', (req, res) => {
    res.json({ success: true, packages: COIN_PACKAGES });
});

// 2. Criar Preferência de Pagamento Mercado Pago
app.post('/api/payment/create-preference', async (req, res) => {
    try {
        const { packageId, username } = req.body;
        const pkg = COIN_PACKAGES[packageId];
        if (!pkg) {
            return res.status(400).json({ success: false, error: 'Pacote de moedas inválido.' });
        }

        const safeUser = (username || 'Piloto').trim();
        const orderId = 'mp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

        // Se o token real do Mercado Pago estiver configurado:
        if (mpClient) {
            const preference = new Preference(mpClient);
            const clientOrigin = req.headers.origin || 'https://tiagomob6-boop.github.io/jogo_tesla';
            
            const prefResponse = await preference.create({
                body: {
                    items: [
                        {
                            id: pkg.id,
                            title: `Roadster Dash - ${pkg.name} (${pkg.coins} Moedas)`,
                            description: pkg.desc,
                            quantity: 1,
                            currency_id: 'BRL',
                            unit_price: Number(pkg.price)
                        }
                    ],
                    payer: {
                        name: safeUser
                    },
                    back_urls: {
                        success: `${clientOrigin}?mp_status=approved&order_id=${orderId}&pkg=${pkg.id}`,
                        pending: `${clientOrigin}?mp_status=pending&order_id=${orderId}`,
                        failure: `${clientOrigin}?mp_status=failure&order_id=${orderId}`
                    },
                    auto_return: 'approved',
                    external_reference: JSON.stringify({
                        orderId,
                        username: safeUser,
                        packageId: pkg.id,
                        coins: pkg.coins
                    }),
                    notification_url: `${req.protocol}://${req.get('host')}/api/payment/webhook`
                }
            });

            return res.json({
                success: true,
                orderId,
                mode: 'production',
                init_point: prefResponse.init_point,
                sandbox_init_point: prefResponse.sandbox_init_point,
                package: pkg
            });
        }

        // Modo Demonstração / Sandbox caso o usuário ainda não tenha configurado MERCADO_PAGO_ACCESS_TOKEN
        const demoPix = `00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-426614174000520400005303986540${pkg.price.toFixed(2)}5802BR5913Roadster Dash6009SAO PAULO62070503***6304ABCD`;
        return res.json({
            success: true,
            orderId,
            mode: 'demo',
            pixCode: demoPix,
            package: pkg,
            message: 'Mercado Pago pronto para integração. Configure MERCADO_PAGO_ACCESS_TOKEN no .env para gerar cobranças reais.'
        });
    } catch (err) {
        console.error('Erro ao criar preferência Mercado Pago:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

// 3. Simulação ou Confirmação Direta de Pagamento (útil para testes imediatos)
// Endpoint de verificação de status para polling de pagamento
app.get('/api/payment/check-status', (req, res) => {
    const { orderId, username } = req.query;
    const isApproved = orderId && processedPayments.has(String(orderId));
    res.json({ success: true, approved: !!isApproved, orderId });
});

app.post('/api/payment/simulate', async (req, res) => {
    try {
        const { packageId, username } = req.body;
        const pkg = COIN_PACKAGES[packageId];
        if (!pkg) return res.status(400).json({ success: false, error: 'Pacote inválido.' });

        const safeUser = (username || 'Piloto').trim();
        const updated = await creditUserCoins(safeUser, pkg.coins);

        return res.json({
            success: true,
            message: `Pagamento aprovado! +${pkg.coins} moedas creditadas.`,
            coinsAdded: pkg.coins,
            totalCoins: updated ? updated.coins : pkg.coins
        });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

// Cache de pagamentos processados para controle de idempotência (evita crédito duplicado)
const processedPayments = new Set();

// 4. Webhook do Mercado Pago para Confirmação Automática de Pagamento (com Idempotência e Auditoria)
app.post('/api/payment/webhook', async (req, res) => {
    try {
        const { type, data } = req.body;
        const paymentId = data && data.id ? String(data.id) : (req.query && req.query['data.id'] ? String(req.query['data.id']) : null);

        if ((type === 'payment' || req.query.topic === 'payment') && paymentId && mpClient) {
            // Verificação de idempotência contra retries do webhook
            if (processedPayments.has(paymentId)) {
                console.log(`ℹ️ [Webhook MP] Pagamento ${paymentId} já processado anteriormente. Ignorando retry.`);
                return res.sendStatus(200);
            }

            const payment = new Payment(mpClient);
            const pInfo = await payment.get({ id: paymentId });

            if (pInfo && pInfo.status === 'approved' && pInfo.external_reference) {
                try {
                    const extRef = JSON.parse(pInfo.external_reference);
                    if (extRef.username && extRef.coins) {
                        // Registra no controle de idempotência
                        processedPayments.add(paymentId);
                        await creditUserCoins(extRef.username, extRef.coins);
                        console.log(`💰 [Webhook MP] Moedas creditadas com sucesso via Mercado Pago: +${extRef.coins} para ${extRef.username} (ID: ${paymentId})`);
                    }
                } catch (e) {
                    console.error('Erro ao processar external_reference do pagamento:', e);
                }
            }
        }
        res.sendStatus(200);
    } catch (err) {
        console.error('Erro no webhook do Mercado Pago:', err);
        res.sendStatus(200);
    }
});

// Servir arquivos estáticos (Frontend do jogo)
app.use(express.static(path.join(__dirname, '.')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚗 Roadster Dash Server + WebSocket Multiplayer rodando na porta ${PORT}`);
    console.log(`👉 Acesse localmente: http://localhost:${PORT}`);
});

