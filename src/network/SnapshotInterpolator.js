/**
 * SnapshotInterpolator - Gerenciador de interpolação de snapshots e Dead Reckoning
 * Elimina stutter, jitter e saltos de teletransporte em redes com variação de latência.
 */
export class SnapshotInterpolator {
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
