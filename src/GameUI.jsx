import "./App.css"

import React from 'react';
import SceneBabylon from './SceneBabylon.ts';
import { Game } from "./Game";

export class GameUI extends React.Component {

    componentDidMount() {
        SceneBabylon.instance();
    }

    renderScore() {
        return < div className="enemiesKilled" > {this.props.enemiesKilled.toFixed()}</div >
    }

    renderUI() {
        if (Game.instance?.gameOver) {
            return (
                <div className="deathPanel">
                    <div className="deathText">You died</div>
                    {this.renderScore()}
                </div>
            );
        }
        else {
            return (
                <div>
                    < div className="scoreText" > {this.props.survivalTime.toFixed()}</div >
                    {this.renderScore()}
                </div>
            );
        }
    }

    render() {
        return this.renderUI();
    }
}