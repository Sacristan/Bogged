import { AbstractAssetTask, AbstractMesh, AssetsManager, Engine, MeshAssetTask, Scene } from "@babylonjs/core";

export class SceneObject {
    id: string;
    scene: Scene;
    engine: Engine;
    meshes: Array<AbstractMesh>

    get glbFile(): string {
        return this.id + ".glb";
    }

    constructor(id: string, scene: Scene, engine: Engine) {
        this.id = id;
        this.scene = scene;
        this.engine = engine;
    }

    async load(): Promise<void> {
        return new Promise(async (resolve) => {

            const assetsManager = new AssetsManager(this.scene);
            const meshTask = assetsManager.addMeshTask("task", "", "assets/", this.glbFile);

            meshTask.onSuccess = function (task: MeshAssetTask) {
                this.meshes = task.loadedMeshes;
            }.bind(this);

            await assetsManager.loadAsync().then(() => {
                resolve();
            })
        });
    }

    findMesh(meshName: string): AbstractMesh {
        if (this.meshes == null || this.meshes.length < 1) return null;

        for (let i = 0; i < this.meshes.length; i++) {
            let mesh = this.meshes[i];

            if (mesh?.name === meshName) return mesh;
        }

        return null;
    }

    clone() {
    }

    dispose() {
        // for(let i=0; i < this.meshes.length; i++){
        //     this.meshes[i]?.dispose();
        // }
    }
}