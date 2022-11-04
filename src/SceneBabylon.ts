/* eslint-disable import/no-extraneous-dependencies */
import '@babylonjs/core/Debug/debugLayer';
import '@babylonjs/inspector';
import '@babylonjs/loaders/glTF';

import * as cannon from "./lib/cannon";

import {
    Engine, Scene, Vector3, HemisphericLight, CubeTexture, Color4, UniversalCamera, Camera, CannonJSPlugin, Color3
} from '@babylonjs/core';
import { Game } from './Game';

export default class SceneBabylon {
    scene: Scene;
    engine: Engine;
    mainCamera: Camera;

    protected static _instance: SceneBabylon;

    public canvas: HTMLCanvasElement;

    constructor() {
        this.createScene();
        this.createDebugTool();
        this.createSceneObjects();
        new Game(this.scene, this.engine, this.mainCamera);
    }

    public static instance(): SceneBabylon {
        if (!SceneBabylon._instance) {
            SceneBabylon._instance = new SceneBabylon();
        }
        return SceneBabylon._instance;
    }

    createSceneObjects(): void {
        const camera = new UniversalCamera("Camera", new Vector3(0, 0, -10), this.scene);
        camera.setTarget(Vector3.Zero());

        this.scene.onBeforeRenderObservable.add(function () {
            camera.rotation.x = 0;
        });

        camera.attachControl(this.canvas, true);

        this.mainCamera = camera;
    }

    createScene(): void {
        // this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        const root = document.getElementById('root');
        this.canvas = document.createElement('canvas') as HTMLCanvasElement;
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        root.prepend(this.canvas);
        // initialize babylon scene and engine
        const engine = new Engine(this.canvas, true);

        window.addEventListener('resize', () => {
            engine.resize();
        });

        const backgroundColor: Color3 = new Color3(0.9, 0.9, 0.85);

        const scene = new Scene(engine);
        scene.clearColor = new Color4(backgroundColor.r, backgroundColor.g, backgroundColor.b, 1);

        const gravityVector = new Vector3(0, -9.81, 0);
        window.CANNON = cannon;
        scene.enablePhysics(gravityVector, new CannonJSPlugin());

        const hdrTexture = CubeTexture.CreateFromPrefilteredData('assets/environment.env', scene);
        scene.environmentTexture = hdrTexture;

        scene.fogMode = Scene.FOGMODE_LINEAR;
        scene.fogDensity = 0.05;

        scene.fogStart = 20.0;
        scene.fogEnd = 60.0;

        scene.fogColor = backgroundColor;

        // const ground = Mesh.CreateGround("ground1", 20 * 6, 20 * 6, 2, scene);
        // ground.physicsImpostor = new PhysicsImpostor(ground, PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, scene);

        new HemisphericLight('light1', new Vector3(1, 1, 0), scene);

        this.engine = engine;
        this.scene = scene;

        engine.runRenderLoop(function () {
            scene.render();
        });
    }

    createDebugTool(): void {
        // DEBUGING CONF
        if (process.env.NODE_ENV === 'development') {
            require('@babylonjs/core/Debug/debugLayer');
            require('@babylonjs/inspector');

            // hide/show the Inspector
            window.addEventListener('keydown', (ev) => {
                // Alt+I
                if (ev.altKey && ev.keyCode === 73) {
                    if (this.scene.debugLayer.isVisible()) {
                        this.scene.debugLayer.hide();
                    } else {
                        this.scene.debugLayer.show();
                    }
                }
            });
        }
    }
}