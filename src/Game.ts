/* eslint-disable import/no-extraneous-dependencies */

import { Camera, Engine, Scene, Tools, TransformNode, Vector3 } from "@babylonjs/core";
import { Enemy } from "./Enemy";
import { SceneObject } from "./SceneObject";
import { Tank } from "./Tank";
import _ from "lodash";

function waitFor(conditionFunction): Promise<any> {
    const poll = resolve => {
        if (conditionFunction()) resolve();
        else setTimeout(_ => poll(resolve), 400);
    }

    return new Promise(poll);
}

const maxSecondsPerEnemy = 5;
const minSecondsPerEnemy = 1;
const timeToMaxDifficulty = 15;

const maxEnemies = 10;

export class Game {

    engine: Engine;
    scene: Scene;
    camera: Camera;

    tank: Tank;
    enemies: Array<Enemy> = new Array<Enemy>()
    secondsPerEnemy: number = maxSecondsPerEnemy;

    gameOver: boolean = false;

    private static time: number = 0;
    private static survivalTime: number = 0;

    private static score: number = 0;
    private static _instance: Game;

    static get EnemiesKilled() {
        return this.score;
    }

    public static get SurvivalTime() {
        return this.survivalTime;
    }

    public static get Time() {
        return this.time;
    }

    static unixTimestamp(): string {
        return Math.floor(Date.now() / 1000).toString();
    }

    static get instance() {
        return this._instance;
    }

    get gameIsRunning() {
        return !this.gameOver;
    }

    static get deltaTime() {
        return 1 / this.instance.engine.getFps();
    }

    static get isReady(): boolean {
        return this.instance.tank !== null;
    }

    static async waitUntilReady() {
        await waitFor(_ => this.isReady);
    }

    constructor(scene: Scene, engine: Engine, camera: Camera) {
        this.scene = scene;
        this.engine = engine;
        this.camera = camera;

        this.createEnvironment();
        this.createPlayer();

        Game._instance = this;
        this.spawnEnemiesRoutine();

        this.scene.onBeforeRenderObservable.add(() => {
            if (this.secondsPerEnemy > minSecondsPerEnemy) {
                this.secondsPerEnemy -= Game.deltaTime / timeToMaxDifficulty / (maxSecondsPerEnemy - minSecondsPerEnemy);
                // console.log(this.secondsPerEnemy);
            }
        });

        this.scene.onBeforeRenderObservable.add(() => {
            Game.time += Game.deltaTime;
            if (!this.gameOver) Game.survivalTime = Game.time;
        });
    }

    spawnEnemiesRoutine = async () => {
        // console.log("enemyPrefab wait to be loaded");

        await waitFor(_ => this.tank && this.tank.isReady); // wait until tank spawned
        await Tools.DelayAsync(1000); // wait one second

        // console.log("enemyPrefab loaded");

        do {
            if (this.enemies.length < maxEnemies) await this.spawnEnemy();
            await Tools.DelayAsync(this.secondsPerEnemy * 1000);
        } while (this.gameIsRunning);
    };

    triggerGameOver() {
        console.log("GameOver: Player DEAD");
        this.gameOver = true;
        this.camera.detachControl();
    }

    increaseScore() {
        Game.score++;
    }

    createEnvironment() {
        const environment = new SceneObject("environment", this.scene, this.engine);
        environment.load()
    }

    private createPlayer() {
        this.tank = new Tank("tank", this.scene, this.engine);

        this.tank.load().then(
            () => {
                const mesh = this.tank.findMesh("tank");

                mesh.setParent(this.camera);
                mesh.position = new Vector3(0, -0.37, 0.6);

                this.tank.init(mesh);
            }
        );
    }

    private async spawnEnemy(): Promise<any> {
        // console.log("spawnEnemy")
        const enemy: Enemy = new Enemy("enemy", this.scene, this.engine);

        await waitFor(_ => this.tank); // wait until tank spawned

        const poll = async resolve => {
            await enemy.load().then(() => {
                enemy.mesh = enemy.findMesh("enemyMesh");
                enemy.root = enemy.mesh.parent as TransformNode;

                const parent = enemy.root.parent;
                enemy.root.parent = null;

                parent.dispose();

                enemy.root.name = `enemy-${Game.unixTimestamp()}`;
                this.enemies.push(enemy);
                enemy.root.position = this.randomPos();
                enemy.root.parent = null;
                enemy.init();

                resolve();
            });
        };

        return new Promise(poll);

    }

    private randomPos(): Vector3 {
        const pos: Vector3 = this.tank.position;
        const offset: Vector3 = new Vector3(randomScalar(), 0, randomScalar());

        function randomScalar(): number {
            const minDist = 10;
            const maxDist = 15;

            return randomSign() * randomInterval(minDist, maxDist);
        }

        function randomInterval(min: number, max: number): number {
            return Math.random() * (max - min) + min;
        }

        function randomSign(): number {
            return Math.random() > 0.5 ? 1 : -1;
        }

        return pos.add(offset);
    }

}