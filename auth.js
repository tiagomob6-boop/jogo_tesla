/**
 * auth.js - Mini-Sistema de Autenticação e Perfil de Jogador
 * Gerencia credenciais, moedas, garagem, mapas desbloqueados e persistência segura.
 */

const STORAGE_USERS_KEY = "roadster_accounts_registry";
const STORAGE_CURRENT_USER = "roadster_current_username";

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
