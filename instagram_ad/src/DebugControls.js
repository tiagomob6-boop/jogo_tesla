/**
 * DebugControls.js
 * Painel Interativo de Ajustes em Tempo Real para Câmera e Iluminação no Project IDX.
 * Permite encontrar os melhores ângulos cinematográficos para o anúncio do Instagram.
 */

export class DebugControls {
    constructor(camera, environment, gamePlay) {
        this.camera = camera;
        this.environment = environment;
        this.gamePlay = gamePlay;

        // Parâmetros padrão calibrados para formato Instagram Stories (9:16 Vertical)
        this.params = {
            // Câmera
            fov: 68,
            camHeight: 5.6,
            camDistance: 8.8,
            camLookY: 1.6,
            camLag: 9.5,

            // Iluminação
            sunIntensity: 2.2,
            sunColor: '#ffbe85',
            sunPosX: -35,
            sunPosY: 26,
            sunPosZ: -130,
            ambientIntensity: 0.85,
            ambientColor: '#d18ca7',
            fogDensity: 0.0055,

            // Gameplay / Tráfego
            speed: 48
        };

        this.container = null;
        this.buildUI();
        this.apply();
    }

    buildUI() {
        // Criação de painel flutuante retrátil estilizado
        const panel = document.createElement('div');
        panel.id = 'idx-tweak-panel';
        panel.innerHTML = `
            <div class="idx-panel-header">
                <span>⚙️ AJUSTES DE CÂMERA & LUZ (PROJECT IDX)</span>
                <button id="idx-toggle-btn" title="Minimizar / Expandir">▼</button>
            </div>
            <div class="idx-panel-content" id="idx-panel-body">
                <!-- Seção Câmera -->
                <div class="idx-section-title">🎥 CÂMERA (VERTICAL 9:16)</div>
                <div class="idx-row">
                    <label>FOV:</label>
                    <input type="range" id="param-fov" min="40" max="95" step="1" value="${this.params.fov}">
                    <span id="val-fov">${this.params.fov}°</span>
                </div>
                <div class="idx-row">
                    <label>Altura Y:</label>
                    <input type="range" id="param-height" min="2.0" max="12.0" step="0.2" value="${this.params.camHeight}">
                    <span id="val-height">${this.params.camHeight}m</span>
                </div>
                <div class="idx-row">
                    <label>Distância Z:</label>
                    <input type="range" id="param-dist" min="4.0" max="18.0" step="0.2" value="${this.params.camDistance}">
                    <span id="val-dist">${this.params.camDistance}m</span>
                </div>
                <div class="idx-row">
                    <label>Ponto Look Y:</label>
                    <input type="range" id="param-looky" min="0.2" max="4.0" step="0.1" value="${this.params.camLookY}">
                    <span id="val-looky">${this.params.camLookY}m</span>
                </div>

                <!-- Seção Iluminação -->
                <div class="idx-section-title">☀️ ILUMINAÇÃO & SOL</div>
                <div class="idx-row">
                    <label>Luz do Sol:</label>
                    <input type="range" id="param-sun-int" min="0.5" max="4.5" step="0.1" value="${this.params.sunIntensity}">
                    <span id="val-sun-int">${this.params.sunIntensity}</span>
                </div>
                <div class="idx-row">
                    <label>Cor do Sol:</label>
                    <input type="color" id="param-sun-col" value="${this.params.sunColor}">
                </div>
                <div class="idx-row">
                    <label>Luz Ambiente:</label>
                    <input type="range" id="param-amb-int" min="0.1" max="2.5" step="0.1" value="${this.params.ambientIntensity}">
                    <span id="val-amb-int">${this.params.ambientIntensity}</span>
                </div>
                <div class="idx-row">
                    <label>Névoa / Fog:</label>
                    <input type="range" id="param-fog" min="0.001" max="0.018" step="0.0005" value="${this.params.fogDensity}">
                    <span id="val-fog">${this.params.fogDensity}</span>
                </div>

                <!-- Presets Rápidos -->
                <div class="idx-section-title">⚡ PRESETS DE VISUAL</div>
                <div class="idx-btn-grid">
                    <button class="idx-preset-btn" id="btn-preset-subway">Subway Surfers</button>
                    <button class="idx-preset-btn" id="btn-preset-cinema">Cinemático Baixo</button>
                    <button class="idx-preset-btn" id="btn-preset-neon">Noite Cyberpunk</button>
                    <button class="idx-preset-btn" id="btn-preset-sunset">Sunset Dourado</button>
                </div>
            </div>
        `;
        document.body.appendChild(panel);
        this.container = panel;

        // Toggle Minimizar / Maximizar
        const toggleBtn = panel.querySelector('#idx-toggle-btn');
        const body = panel.querySelector('#idx-panel-body');
        toggleBtn.addEventListener('click', () => {
            const isHidden = body.style.display === 'none';
            body.style.display = isHidden ? 'block' : 'none';
            toggleBtn.textContent = isHidden ? '▼' : '▲';
        });

        // Listeners para os sliders
        this.bindSlider('param-fov', 'val-fov', 'fov', '°', (v) => {
            this.camera.fov = v;
            this.camera.updateProjectionMatrix();
        });
        this.bindSlider('param-height', 'val-height', 'camHeight', 'm');
        this.bindSlider('param-dist', 'val-dist', 'camDistance', 'm');
        this.bindSlider('param-looky', 'val-looky', 'camLookY', 'm');

        this.bindSlider('param-sun-int', 'val-sun-int', 'sunIntensity', '', (v) => {
            this.environment.setSunIntensity(v);
        });
        this.bindSlider('param-amb-int', 'val-amb-int', 'ambientIntensity', '', (v) => {
            this.environment.setAmbientIntensity(v);
        });
        this.bindSlider('param-fog', 'val-fog', 'fogDensity', '', (v) => {
            this.environment.setFogDensity(v);
        });

        panel.querySelector('#param-sun-col').addEventListener('input', (e) => {
            this.params.sunColor = e.target.value;
            this.environment.setSunColor(e.target.value);
        });

        // Eventos dos Presets
        panel.querySelector('#btn-preset-subway').addEventListener('click', () => {
            this.setParams({ fov: 68, camHeight: 5.6, camDistance: 8.8, camLookY: 1.6, sunIntensity: 2.2, sunColor: '#ffbe85' });
        });
        panel.querySelector('#btn-preset-cinema').addEventListener('click', () => {
            this.setParams({ fov: 78, camHeight: 2.8, camDistance: 6.2, camLookY: 1.2, sunIntensity: 2.5, sunColor: '#ff9a40' });
        });
        panel.querySelector('#btn-preset-neon').addEventListener('click', () => {
            this.setParams({ fov: 65, camHeight: 5.2, camDistance: 8.5, camLookY: 1.5, sunIntensity: 1.1, sunColor: '#00e5ff', ambientIntensity: 1.2, ambientColor: '#2b1055' });
        });
        panel.querySelector('#btn-preset-sunset').addEventListener('click', () => {
            this.setParams({ fov: 70, camHeight: 5.8, camDistance: 9.2, camLookY: 1.8, sunIntensity: 2.8, sunColor: '#ffaa33', ambientIntensity: 0.9, ambientColor: '#d18ca7' });
        });
    }

    bindSlider(sliderId, labelId, paramKey, unit = '', onChange = null) {
        const slider = this.container.querySelector(`#${sliderId}`);
        const label = this.container.querySelector(`#${labelId}`);
        slider.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            this.params[paramKey] = val;
            label.textContent = val + unit;
            if (onChange) onChange(val);
        });
    }

    setParams(newVals) {
        Object.assign(this.params, newVals);
        // Atualiza campos no DOM
        if (newVals.fov !== undefined) {
            this.container.querySelector('#param-fov').value = newVals.fov;
            this.container.querySelector('#val-fov').textContent = newVals.fov + '°';
            this.camera.fov = newVals.fov;
            this.camera.updateProjectionMatrix();
        }
        if (newVals.camHeight !== undefined) {
            this.container.querySelector('#param-height').value = newVals.camHeight;
            this.container.querySelector('#val-height').textContent = newVals.camHeight + 'm';
        }
        if (newVals.camDistance !== undefined) {
            this.container.querySelector('#param-dist').value = newVals.camDistance;
            this.container.querySelector('#val-dist').textContent = newVals.camDistance + 'm';
        }
        if (newVals.camLookY !== undefined) {
            this.container.querySelector('#param-looky').value = newVals.camLookY;
            this.container.querySelector('#val-looky').textContent = newVals.camLookY + 'm';
        }
        if (newVals.sunIntensity !== undefined) {
            this.container.querySelector('#param-sun-int').value = newVals.sunIntensity;
            this.container.querySelector('#val-sun-int').textContent = newVals.sunIntensity;
            this.environment.setSunIntensity(newVals.sunIntensity);
        }
        if (newVals.sunColor !== undefined) {
            this.container.querySelector('#param-sun-col').value = newVals.sunColor;
            this.environment.setSunColor(newVals.sunColor);
        }
        if (newVals.ambientIntensity !== undefined) {
            this.container.querySelector('#param-amb-int').value = newVals.ambientIntensity;
            this.container.querySelector('#val-amb-int').textContent = newVals.ambientIntensity;
            this.environment.setAmbientIntensity(newVals.ambientIntensity);
        }
        if (newVals.ambientColor !== undefined) {
            this.environment.setAmbientColor(newVals.ambientColor);
        }
    }

    apply() {
        this.camera.fov = this.params.fov;
        this.camera.updateProjectionMatrix();
        this.environment.setSunIntensity(this.params.sunIntensity);
        this.environment.setSunColor(this.params.sunColor);
        this.environment.setAmbientIntensity(this.params.ambientIntensity);
        this.environment.setFogDensity(this.params.fogDensity);
    }

    updateCamera(playerX, playerY, delta) {
        // Câmera dinâmica de perseguição estilo Subway Surfers
        const targetX = playerX * 0.42;
        const targetY = playerY + this.params.camHeight;
        const targetZ = this.params.camDistance;

        // Interpolação suave de posição
        this.camera.position.x += (targetX - this.camera.position.x) * (this.params.camLag * delta);
        this.camera.position.y += (targetY - this.camera.position.y) * (8.0 * delta);
        this.camera.position.z += (targetZ - this.camera.position.z) * (10.0 * delta);

        // Ponto focal olhando ligeiramente à frente do carro
        this.camera.lookAt(playerX * 0.15, playerY + this.params.camLookY, -12);
    }
}
