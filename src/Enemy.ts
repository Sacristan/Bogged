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
        // this.root.addChild(this.collider);

        this.collider.parent = this.root;
        this.collider.isVisible = false;
        this.moveRoutine();
    }


    // constructor(root: TransformNode, meshName: string) {
    //     this.root = root;
    //     this.mesh = this.findMesh(meshName)

    //     this.collider = MeshBuilder.CreateBox(this.root.id + "_col", { size: 2 }, Game.instance.scene);
    //     this.impostor = this.collider.physicsImpostor = new PhysicsImpostor(this.collider, PhysicsImpostor.SphereImpostor, { mass: 0, restitution: 0.9 }, Game.instance.scene);
    //     // this.root.addChild(this.collider);

    //     this.collider.parent = this.root;
    //     this.collider.isVisible = false;
    //     this.moveRoutine();
    // }

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

            // this.mesh.rotate(Vector3.Right(), Math.PI);

            // this.mesh.rotate(Vector3.Left(), 20000, Space.WORLD);
            // this.root.rotation = Quaternion.FromLookDirectionLH(dir, Vector3.Up()).toEulerAngles();
        }
    }

    // private findMesh(name: string): AbstractMesh {
    //     var meshes = this.root.getChildMeshes(true);

    //     for (let i = 0; i < meshes.length; i++) {
    //         if (meshes[i]?.name.includes(name)) return meshes[i];
    //     }

    //     return null;
    // }
}