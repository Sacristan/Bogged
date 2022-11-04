import React from 'react';
import ReactDOM from 'react-dom/client';

import { GameUI, GameUII } from "./GameUI"
import { Game } from "./Game"

const root = ReactDOM.createRoot(document.getElementById('root'));

function tick() {
    const element = (
        <React.StrictMode>
            <GameUI survivalTime={Game.SurvivalTime} enemiesKilled={Game.EnemiesKilled} />
        </React.StrictMode>
    );
    root.render(element);
}

setInterval(tick, 1000);