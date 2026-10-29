import re, os

with open('index.monolith.backup.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Extract method spans
method_spans = []
cur_name = None
cur_start = None

for i in range(2655, 7848):
    line = lines[i]
    m = re.match(r'^\s{10,14}([a-zA-Z0-9_]+)\s*\((.*?)\)\s*\{', line)
    if m:
        if cur_name is not None:
            method_spans.append((cur_name, cur_start, i))
        cur_name = m.group(1)
        cur_start = i

if cur_name:
    method_spans.append((cur_name, cur_start, 7848))

method_map = {name: (start, end) for name, start, end in method_spans}

def get_method_code(name):
    start, end = method_map[name]
    m_lines = lines[start:end]
    # Keep 4-space indentation for class methods
    res = []
    for l in m_lines:
        if l.startswith('            '):
            res.append('    ' + l[12:])
        elif l.startswith('        '):
            res.append(l[4:])
        else:
            res.append(l)
    return ''.join(res) + '\n\n'

def make_mixin_file(name, methods, imports, out_path):
    code = imports + f"\n\nexport const {name} = (Base) => class extends Base {{\n"
    for m in methods:
        code += get_method_code(m)
    code += "};\n"
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(code)
    print(f"Wrote {out_path} ({len(methods)} methods)")

common_imports = "import { LANES, GROUND_Y, FLIGHT_Y, GRAVITY, SLAM_FORCE, CAR_CATALOG, PILOT_CATALOG, COIN_PACKAGES, DAILY_MISSION_DEFS, API_URL } from '../core/Config.js';"

# 1. CarModelBuilder
make_mixin_file(
    "CarModelBuilder",
    ["makeProfile", "makeBox", "addWheels", "buildPlayerVehicle", "buildRivalVehicle", "emitRearSmokeCloud", "createLateralAirPuff"],
    common_imports,
    "src/entities/CarModelBuilder.js"
)

# 2. EnvironmentBuilder
make_mixin_file(
    "EnvironmentBuilder",
    ["initThree", "updateCameraLayout", "buildAtmosphericWorld", "addBridgeArchitecture", "createPalmTree", "getHoneycombShieldTexture", "getSoftTexture", "makeGlow", "createSkylineBuilding", "updateDayNightCycle"],
    common_imports,
    "src/entities/EnvironmentBuilder.js"
)

# 3. TrafficManager
make_mixin_file(
    "TrafficManager",
    ["spawnTrafficCar", "createRamp", "spawnRamp", "spawnSkyObstacle", "spawnCollectible", "smashTrafficCar"],
    common_imports,
    "src/entities/TrafficManager.js"
)

# 4. ControlsManager
make_mixin_file(
    "ControlsManager",
    ["initControls", "changeLane", "toggleFlight", "slamDown", "triggerActionPopup", "addScoreEvent", "updateStreakUI", "resetStreak", "triggerHaptic", "speakAnnouncer"],
    common_imports,
    "src/systems/ControlsManager.js"
)

# 5. MultiplayerManager (with SnapshotInterpolator integration)
mp_imports = common_imports + "\nimport { SnapshotInterpolator } from './SnapshotInterpolator.js';"
mp_methods = ["initMultiplayer", "connectMultiplayerWebSocket", "handleMultiplayerMessage", "createMultiplayerRoom", "joinMultiplayerRoom", "quickMatchMultiplayer", "createNameTagSprite", "startMultiplayerRace", "changeP2Lane", "toggleP2Flight", "slamP2Down", "updateMultiplayer", "finishDuel"]

mp_code = mp_imports + "\n\nexport const MultiplayerManager = (Base) => class extends Base {\n"
for m in mp_methods:
    m_body = get_method_code(m)
    # Apply snapshot interpolation to rival_update and updateMultiplayer
    if m == 'initMultiplayer':
        m_body = m_body.replace(
            "initMultiplayer() {\n",
            "initMultiplayer() {\n        this.mpInterpolator = new SnapshotInterpolator(100);\n        this.mpLastRivalX = 0;\n"
        )
    elif m == 'startMultiplayerRace':
        m_body = m_body.replace(
            "startMultiplayerRace(mode, rivalInfo) {\n",
            "startMultiplayerRace(mode, rivalInfo) {\n        if (this.mpInterpolator) this.mpInterpolator.reset();\n        this.mpLastRivalX = 0;\n"
        )
    elif m == 'handleMultiplayerMessage':
        old_ru = """            case "rival_update":
                this.mpRivalData = {
                    x: data.x,
                    y: data.y,
                    lane: data.lane,
                    dist: data.dist,
                    speed: data.speed,
                    isFlying: data.isFlying,
                    shield: data.shield,
                    name: data.username || "Rival"
                };
                break;"""
        new_ru = """            case "rival_update":
                this.mpRivalData = {
                    x: data.x,
                    y: data.y,
                    lane: data.lane,
                    dist: data.dist,
                    speed: data.speed,
                    isFlying: data.isFlying,
                    shield: data.shield,
                    name: data.username || "Rival"
                };
                if (this.mpInterpolator) {
                    this.mpInterpolator.addSnapshot(data);
                }
                break;"""
        m_body = m_body.replace(old_ru, new_ru)
    elif m == 'updateMultiplayer':
        # Replace the online lerp with snapshot interpolation
        old_online = """        else if (this.mpMode === 'online') {
            // Interpolação suave das coordenadas recebidas
            this.mpRivalVehicle.position.x += (this.mpRivalData.x - this.mpRivalVehicle.position.x) * 12.0 * delta;
            this.mpRivalVehicle.position.y += (this.mpRivalData.y - this.mpRivalVehicle.position.y) * 12.0 * delta;
            const relativeZ = this.truckGroup.position.z + (this.mpRivalData.dist - this.scoreDistance);
            this.mpRivalVehicle.position.z = relativeZ;
            // Envio de telemetria local via WebSocket (~25Hz)
            if (this.mpWs && this.mpWs.readyState === WebSocket.OPEN && !this.p1Crashed) {
                this.mpTelemetryTimer += delta;
                if (this.mpTelemetryTimer >= 0.04) {
                    this.mpTelemetryTimer = 0;
                    this.mpWs.send(JSON.stringify({
                        type: 'player_state',
                        username: this.currentUser,
                        selectedCar: this.selectedCar,
                        x: this.playerX,
                        y: this.playerY,
                        lane: this.currentLane,
                        dist: Math.floor(this.scoreDistance),
                        speed: Math.floor(this.currentSpeed),
                        isFlying: this.isFlying,
                        shield: this.shieldTimer > 0,
                        score: Math.floor(this.scorePoints)
                    }));
                }
            }
            rivalDist = this.rivalCrashed ? this.rivalFinalDist : this.mpRivalData.dist;
        }"""
        new_online = """        else if (this.mpMode === 'online') {
            // Interpolação precisa de snapshots com buffer de 100ms (Zero Stutter)
            const state = this.mpInterpolator ? this.mpInterpolator.getInterpolatedState() : this.mpRivalData;

            this.mpRivalVehicle.position.x = state.x;
            this.mpRivalVehicle.position.y = state.y;

            // Sincronização contínua do Z relativo baseado na distância real do rival
            const relativeZ = this.truckGroup.position.z + (state.dist - this.scoreDistance);
            this.mpRivalVehicle.position.z = relativeZ;

            // Rotação suave da lataria em desvios laterais
            const deltaX = state.x - (this.mpLastRivalX || state.x);
            const targetRotY = Math.max(-0.25, Math.min(0.25, -deltaX * 1.5));
            this.mpRivalVehicle.rotation.y += (targetRotY - this.mpRivalVehicle.rotation.y) * 12 * delta;
            this.mpLastRivalX = state.x;

            // Ajuste de inclinação se estiver voando
            this.mpRivalVehicle.rotation.x += ((state.isFlying ? -0.06 : 0) - this.mpRivalVehicle.rotation.x) * 10 * delta;

            // Envio de telemetria local via WebSocket com tickrate fixo de 20Hz (0.05s)
            if (this.mpWs && this.mpWs.readyState === WebSocket.OPEN && !this.p1Crashed) {
                this.mpTelemetryTimer += delta;
                if (this.mpTelemetryTimer >= 0.05) {
                    this.mpTelemetryTimer = 0;
                    this.mpWs.send(JSON.stringify({
                        type: 'player_state',
                        clientTime: performance.now(),
                        username: this.currentUser,
                        selectedCar: this.selectedCar,
                        x: this.playerX,
                        y: this.playerY,
                        lane: this.currentLane,
                        dist: this.scoreDistance,
                        speed: this.currentSpeed,
                        isFlying: this.isFlying,
                        shield: this.shieldTimer > 0,
                        score: Math.floor(this.scorePoints)
                    }));
                }
            }
            rivalDist = this.rivalCrashed ? this.rivalFinalDist : state.dist;
        }"""
        m_body = m_body.replace(old_online, new_online)
    mp_code += m_body
mp_code += "};\n"
with open("src/network/MultiplayerManager.js", "w", encoding="utf-8") as f:
    f.write(mp_code)
print(f"Wrote src/network/MultiplayerManager.js ({len(mp_methods)} methods)")

# 6. UIManager
make_mixin_file(
    "UIManager",
    ["initEventListeners", "togglePause", "loadAccountData", "saveAccountData", "switchUser", "renderSavedAccounts", "updateUserUI", "renderLeaderboard", "renderGarageCards", "buyUpgrade", "buyCar", "selectCar", "renderPilotCards", "buyPilot", "selectPilot", "initDailyMissions", "saveMissionsState", "trackMissionProgress", "renderMissions", "claimMissionReward", "initCoinShop", "openCoinShop", "renderCoinShopCards", "updateUserCoinsEverywhere"],
    common_imports,
    "src/ui/UIManager.js"
)

# 7. RoadsterDashGame.js
core_methods = ["constructor", "startGame", "gameOver", "flashDamage", "addHeart", "activateShield", "activateMegaBoost", "activateMagnet", "takeDamage", "updateHeartsUI", "gameLoop", "update", "updateHUD"]

game_header = """import { SoundSystem } from '../audio/SoundSystem.js';
import { LANES, GROUND_Y, FLIGHT_Y, GRAVITY, SLAM_FORCE, CAR_CATALOG, PILOT_CATALOG, COIN_PACKAGES, DAILY_MISSION_DEFS, API_URL } from './Config.js';
import { CarModelBuilder } from '../entities/CarModelBuilder.js';
import { EnvironmentBuilder } from '../entities/EnvironmentBuilder.js';
import { TrafficManager } from '../entities/TrafficManager.js';
import { ControlsManager } from '../systems/ControlsManager.js';
import { MultiplayerManager } from '../network/MultiplayerManager.js';
import { UIManager } from '../ui/UIManager.js';

class CoreGame {
"""

game_body = ""
for m in core_methods:
    game_body += get_method_code(m)
game_body += "}\n\n"

game_footer = """// Composição de Classes Mixin
export class RoadsterDashGame extends UIManager(
    MultiplayerManager(
        ControlsManager(
            TrafficManager(
                EnvironmentBuilder(
                    CarModelBuilder(CoreGame)
                )
            )
        )
    )
) {}
"""

with open("src/core/RoadsterDashGame.js", "w", encoding="utf-8") as f:
    f.write(game_header + game_body + game_footer)
print("Wrote src/core/RoadsterDashGame.js")

# 8. src/main.js
main_code = """import { RoadsterDashGame } from './core/RoadsterDashGame.js';

window.addEventListener('DOMContentLoaded', () => {
    window.game = new RoadsterDashGame();
});
"""
with open("src/main.js", "w", encoding="utf-8") as f:
    f.write(main_code)
print("Wrote src/main.js")

print("All modules generated successfully!")
