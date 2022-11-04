import React from 'react';
import ReactDOM from 'react-dom/client';

import { GameUI } from "./GameUI" //JSX -> TS cant read defaults
import { Game } from "./Game" //JSX -> TS cant read defaults

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