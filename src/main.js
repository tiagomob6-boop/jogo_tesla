import { RoadsterDashGame } from './core/RoadsterDashGame.js';

if (typeof window !== 'undefined') {
    window.RoadsterDashGame = RoadsterDashGame;
    window.addEventListener('DOMContentLoaded', () => {
        window.game = new RoadsterDashGame();
    });
}
