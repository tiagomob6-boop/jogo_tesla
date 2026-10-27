const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// =============================================================================
// CATÁLOGO DE CARROS OFICIAIS (VALIDAÇÃO DE PREÇOS NO BACKEND)
// =============================================================================
const CAR_CATALOG = {
    roadster: { name: 'Roadster 2077', price: 0, bonus: 'Balanceado' },
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
                        unlocked_cars: user.unlocked_cars
                    }
                });
            }

            const insertRes = await pool.query(`
                INSERT INTO users (username, coins, best_score, selected_car, unlocked_cars)
                VALUES ($1, 0, 0, 'roadster', ARRAY['roadster'])
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
                    unlocked_cars: newUser.unlocked_cars
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
            const result = await pool.query('SELECT username, coins, best_score, selected_car, unlocked_cars FROM users WHERE LOWER(username) = LOWER($1)', [username]);
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

// Catálogo de carros para o frontend consultar
app.get('/api/cars', (req, res) => {
    res.json({ success: true, catalog: CAR_CATALOG });
});

// Servir arquivos estáticos (Frontend do jogo)
app.use(express.static(path.join(__dirname, '.')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚗 Roadster Dash Server rodando na porta ${PORT}`);
    console.log(`👉 Acesse localmente: http://localhost:${PORT}`);
});
