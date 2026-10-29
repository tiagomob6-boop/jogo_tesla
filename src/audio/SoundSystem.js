export class SoundSystem {
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

