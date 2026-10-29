/**
 * auth.js - Mini-Sistema de Autenticação e Perfil de Jogador com Usuário e Senha
 * Gerencia cadastro seguro, login, verificação de credenciais, persistência e sincronização de progresso.
 */

const STORAGE_USERS_KEY = "roadster_accounts_registry";
const STORAGE_CURRENT_USER = "roadster_current_username";

/**
 * Função utilitária de hash para verificação segura em armazenamento local/offline
 */
function hashString(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) + str.charCodeAt(i);
        hash = hash & hash;
    }
    return "h_" + Math.abs(hash).toString(16) + "_" + str.length;
}

export class AuthSystem {
    constructor(apiUrl = "") {
        this.apiUrl = apiUrl;
        this.currentUser = null;
        this.profile = null;
        this.init();
    }

    init() {
        const savedUsername = localStorage.getItem(STORAGE_CURRENT_USER);
        if (savedUsername) {
            const registry = this.getAccountsRegistry();
            if (registry[savedUsername]) {
                this.currentUser = savedUsername;
                this.profile = registry[savedUsername];
                this.ensureDefaultData();
            } else {
                this.currentUser = savedUsername;
                this.profile = this.createDefaultProfile(savedUsername);
            }
        } else {
            // Piloto inicial convidado
            this.currentUser = "Piloto_Cyber";
            const registry = this.getAccountsRegistry();
            if (!registry["Piloto_Cyber"]) {
                registry["Piloto_Cyber"] = this.createDefaultProfile("Piloto_Cyber");
                this.saveAccountsRegistry(registry);
            }
            this.profile = registry["Piloto_Cyber"];
            localStorage.setItem(STORAGE_CURRENT_USER, "Piloto_Cyber");
        }
    }

    createDefaultProfile(username, passwordHash = "") {
        return {
            username: username,
            passwordHash: passwordHash,
            coins: parseInt(localStorage.getItem("roadster_coins") || "150", 10),
            selectedCar: "roadster",
            selectedPilot: "aria",
            selectedMap: "rodovia_dupla",
            unlockedCars: ["roadster"],
            unlockedPilots: ["aria"],
            unlockedMaps: ["rodovia_dupla"], // Mapa 1 grátis por padrão
            upgrades: { phantom_air: 0, cybertruck_armor: 0 },
            createdAt: Date.now()
        };
    }

    ensureDefaultData() {
        if (!this.profile) return;
        if (!Array.isArray(this.profile.unlockedMaps) || this.profile.unlockedMaps.length === 0) {
            this.profile.unlockedMaps = ["rodovia_dupla"];
        }
        if (!this.profile.unlockedMaps.includes("rodovia_dupla")) {
            this.profile.unlockedMaps.push("rodovia_dupla");
        }
        if (!this.profile.selectedMap) {
            this.profile.selectedMap = "rodovia_dupla";
        }
        if (!this.profile.unlockedCars) {
            this.profile.unlockedCars = ["roadster"];
        }
        if (!this.profile.upgrades) {
            this.profile.upgrades = { phantom_air: 0, cybertruck_armor: 0 };
        }
    }

    /**
     * Cadastro de Novo Piloto com Nome de Usuário e Senha
     */
    async register(username, password) {
        const cleanName = (username || "").trim().replace(/[^a-zA-Z0-9_-]/g, "");
        if (!cleanName || cleanName.length < 3) {
            throw new Error("O nome de usuário deve ter pelo menos 3 caracteres (letras, números, - ou _).");
        }
        if (!password || password.length < 4) {
            throw new Error("A senha deve ter no mínimo 4 caracteres.");
        }

        // 1. Tenta registrar na API do Backend (Neon DB / Servidor)
        if (this.apiUrl) {
            try {
                const res = await fetch(`${this.apiUrl}/api/user/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username: cleanName, password: password })
                });
                const data = await res.json();
                if (!data.success) {
                    throw new Error(data.error || "Erro ao registrar usuário.");
                }
                
                // Salva no registro local sincronizado
                const localHash = hashString(password);
                const registry = this.getAccountsRegistry();
                registry[cleanName] = {
                    username: cleanName,
                    passwordHash: localHash,
                    coins: data.user.coins || 150,
                    selectedCar: data.user.selected_car || "roadster",
                    selectedPilot: "aria",
                    selectedMap: data.user.selected_map || "rodovia_dupla",
                    unlockedCars: data.user.unlocked_cars || ["roadster"],
                    unlockedPilots: ["aria"],
                    unlockedMaps: data.user.unlocked_maps || ["rodovia_dupla"],
                    upgrades: data.user.upgrades || {},
                    createdAt: Date.now()
                };
                this.saveAccountsRegistry(registry);

                this.currentUser = cleanName;
                this.profile = registry[cleanName];
                localStorage.setItem(STORAGE_CURRENT_USER, cleanName);
                this.saveProfile();
                return { success: true, isNew: true, user: this.profile };
            } catch (err) {
                // Se a API retornou erro de conflito (usuário existente), propaga o erro
                if (err.message && err.message.includes("já está cadastrado")) {
                    throw err;
                }
                console.warn("[Auth] Backend offline ou indisponível, registrando localmente:", err.message);
            }
        }

        // 2. Fallback de Registro Local (Offline / file:///)
        const registry = this.getAccountsRegistry();
        if (registry[cleanName]) {
            throw new Error("Este nome de usuário já está cadastrado neste dispositivo. Faça login.");
        }

        const localHash = hashString(password);
        registry[cleanName] = this.createDefaultProfile(cleanName, localHash);
        this.saveAccountsRegistry(registry);

        this.currentUser = cleanName;
        this.profile = registry[cleanName];
        localStorage.setItem(STORAGE_CURRENT_USER, cleanName);
        this.saveProfile();
        return { success: true, isNew: true, user: this.profile };
    }

    /**
     * Login com Nome de Usuário e Senha
     */
    async login(username, password) {
        const cleanName = (username || "").trim();
        if (!cleanName) {
            throw new Error("Informe seu nome de usuário.");
        }
        if (!password) {
            throw new Error("Informe sua senha.");
        }

        // 1. Tenta autenticar na API do Backend (Neon DB / Servidor)
        if (this.apiUrl) {
            try {
                const res = await fetch(`${this.apiUrl}/api/user/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username: cleanName, password: password })
                });
                const data = await res.json();
                if (!data.success) {
                    throw new Error(data.error || "Credenciais inválidas.");
                }

                const localHash = hashString(password);
                const registry = this.getAccountsRegistry();
                registry[cleanName] = {
                    username: cleanName,
                    passwordHash: localHash,
                    coins: data.user.coins,
                    selectedCar: data.user.selected_car || "roadster",
                    selectedPilot: (registry[cleanName] && registry[cleanName].selectedPilot) || "aria",
                    selectedMap: data.user.selected_map || "rodovia_dupla",
                    unlockedCars: data.user.unlocked_cars || ["roadster"],
                    unlockedPilots: (registry[cleanName] && registry[cleanName].unlockedPilots) || ["aria"],
                    unlockedMaps: data.user.unlocked_maps || ["rodovia_dupla"],
                    upgrades: data.user.upgrades || {},
                    createdAt: (registry[cleanName] && registry[cleanName].createdAt) || Date.now()
                };
                this.saveAccountsRegistry(registry);

                this.currentUser = cleanName;
                this.profile = registry[cleanName];
                this.ensureDefaultData();
                localStorage.setItem(STORAGE_CURRENT_USER, cleanName);
                this.saveProfile();
                return { success: true, user: this.profile };
            } catch (err) {
                if (err.message && (err.message.includes("Senha incorreta") || err.message.includes("não encontrado"))) {
                    throw err;
                }
                console.warn("[Auth] Backend offline, verificando autenticação local:", err.message);
            }
        }

        // 2. Fallback de Autenticação Local (Offline / file:///)
        const registry = this.getAccountsRegistry();
        const localUser = registry[cleanName];
        if (!localUser) {
            throw new Error("Piloto não encontrado. Se for sua primeira vez, clique em 'CRIAR CONTA'.");
        }

        // Se houver hash salvo localmente, verifica
        if (localUser.passwordHash) {
            const testHash = hashString(password);
            if (testHash !== localUser.passwordHash) {
                throw new Error("Senha incorreta! Verifique sua senha e tente novamente.");
            }
        } else {
            // Conta antiga sem senha, associa agora
            localUser.passwordHash = hashString(password);
            this.saveAccountsRegistry(registry);
        }

        this.currentUser = cleanName;
        this.profile = localUser;
        this.ensureDefaultData();
        localStorage.setItem(STORAGE_CURRENT_USER, cleanName);
        this.saveProfile();
        return { success: true, user: this.profile };
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
        this.syncWithBackend();
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
            await fetch(`${this.apiUrl}/api/user/save`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: this.profile.username,
                    coins: this.profile.coins,
                    selectedCar: this.profile.selectedCar,
                    unlockedCars: this.profile.unlockedCars,
                    unlockedMaps: this.profile.unlockedMaps,
                    selectedMap: this.profile.selectedMap,
                    upgrades: this.profile.upgrades
                })
            });
        } catch (e) {
            // Fallback silencioso para funcionamento offline
        }
    }
}
