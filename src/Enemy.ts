import _ from "lodash";
import { AbstractMesh, Engine, MeshBuilder, PhysicsImpostor, Quaternion, Scene, Space, Tools, TransformNode, Vector3 } from "@babylonjs/core";
import { Game } from "./Game";
import { multiplyVectorWithScalar } from "./Utils";
import { SceneObject } from "./SceneObject";

// const speed = 0.4;
const speed = 1;

const closeEnoughDist = 2;

export class Enemy extends SceneObject {
    root: TransformNode;
    mesh: AbstractMesh
    impostor: PhysicsImpostor;
    private collider: AbstractMesh;
    isAlive: boolean = true;

    get target() {
        return Game.instance.tank;
    }

    constructor(id: string, scene: Scene, engine: Engine) {
        super(id, scene, engine);
    }

    init(): void {
        this.collider = MeshBuilder.CreateBox(this.root.id + "_col", { size: 2 }, Game.instance.scene);
        this.impostor = this.collider.physicsImpostor = new PhysicsImpostor(this.collider, PhysicsImpostor.SphereImpostor, { mass: 0, restitution: 0.9 }, Game.instance.scene);

        this.collider.parent = this.root;
        this.collider.isVisible = false;
        this.moveRoutine();
    }

    moveRoutine = async () => {
        await Game.waitUntilReady();

        do {
            await Tools.DelayAsync(Game.deltaTime);
            this.move()
        } while (Game.instance.gameIsRunning && this.isAlive);
    }

    kill() {
        this.isAlive = false;
        this.impostor.dispose();
        this.collider.dispose();
        this.mesh.dispose();
        this.root.dispose();
        _.remove(Game.instance.enemies, (x) => x === this);
    }

    move() {
        const distanceToTarget: number = Vector3.Distance(this.root.getAbsolutePosition(), this.target.position);

        if (distanceToTarget < closeEnoughDist) {
            Game.instance.triggerGameOver();

            console.log(this.mesh.name + " trigger kill player");
            this.kill();
        }
        else {
            const dir: Vector3 = this.target.position.subtract(this.root.getAbsolutePosition()).normalize();
            dir.y = 0;
            const delta: Vector3 = multiplyVectorWithScalar(dir, Game.deltaTime * speed);
            this.root.position.addInPlace(delta)
            this.root.lookAt(dir);
        }
    }
}