import _ from "lodash";
import { AbstractMesh, Color3, Engine, Mesh, MeshBuilder, PBRMaterial, PhysicsImpostor, Quaternion, Scene, Vector3 } from "@babylonjs/core";
import { Game } from "./Game";
import { SceneObject } from "./SceneObject"
import { multiplyVectorWithScalar } from "./Utils";

const power = 50

class Bullet {
    static readonly MaxLife = 200;

    readonly mesh: Mesh;
    life: number = 0;
    step: any;
    physicsImpostor: PhysicsImpostor;

    constructor(mesh: Mesh) {
        this.mesh = mesh;
    }

    dispose() {
        this.mesh.dispose();
    }
}

export class Tank extends SceneObject {
    mesh: AbstractMesh;
    bulletMat: PBRMaterial;

    private lastShotTime: number = 0;
    static readonly shotDelay: number = 1;
    isReady: boolean = false;

    get position(): Vector3 {
        return this.mesh.getAbsolutePosition();
    }

    get shootOrigin(): Vector3 {
        return this.mesh.getAbsolutePosition().add(multiplyVectorWithScalar(this.mesh.forward, 4));
    }

    constructor(id: string, scene: Scene, engine: Engine) {
        super(id, scene, engine);
    }

    init(mesh: AbstractMesh): void {
        this.mesh = mesh;

        this.bulletMat = new PBRMaterial("bulletMat", Game.instance.scene);
        this.bulletMat.albedoColor = Color3.FromHexString("BD7A15");
        this.bulletMat.emissiveColor = Color3.Black();
        this.bulletMat.metallic = 0;
        this.bulletMat.roughness = 1;

        window.addEventListener("keydown", (evt) => {
            if (evt.keyCode === 32 && (Game.Time - this.lastShotTime) > Tank.shotDelay) {//space
                this.fireBullet();
            }
        });

        this.isReady = true;
    }

    fireBullet(): void {
        this.lastShotTime = Game.Time;

        const dir = this.mesh.forward;

        const bullet: Bullet = new Bullet(MeshBuilder.CreateCapsule("bullet" + Game.unixTimestamp(), { radius: 0.25, orientation: Vector3.Forward() }, this.scene));
        bullet.mesh.position = this.shootOrigin;
        bullet.mesh.rotation = Quaternion.FromLookDirectionLH(dir, Vector3.Up()).toEulerAngles();
        bullet.mesh.material = this.bulletMat;

        bullet.physicsImpostor = new PhysicsImpostor(bullet.mesh, PhysicsImpostor.SphereImpostor, { mass: 1, friction: 0.5, restitution: 0.3 }, this.scene);

        bullet.physicsImpostor.applyImpulse(dir.scale(power), this.shootOrigin);
        bullet.life = 0

        bullet.step = () => {
            bullet.life++
            if (bullet.life > Bullet.MaxLife && bullet.physicsImpostor) {
                bullet.physicsImpostor.dispose()
                bullet.dispose()
            }
        }

        bullet.physicsImpostor.onCollideEvent = (e, t) => {
            const enemy = _.find(Game.instance.enemies, (x) => t === x.impostor);
            enemy?.kill();
            bullet.dispose();
            Game.instance.increaseScore();
        }

        this.scene.onBeforeRenderObservable.add(bullet.step)
    }

}