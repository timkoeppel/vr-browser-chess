import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import * as BABYLON from "@babylonjs/core";
import {Avatar} from "./Avatar";

export default class Game {
    private _canvas: HTMLCanvasElement;
    private _engine: BABYLON.Engine;
    private _scene: BABYLON.Scene;
    //private _camera: BABYLON.DeviceOrientationCamera;
    private _camera: BABYLON.FreeCamera;
    private _light: BABYLON.Light;
    private _xr: BABYLON.WebXRDefaultExperience;
    private _fields: Array<BABYLON.AbstractMesh>;
    private _figures: Array<BABYLON.AbstractMesh>;

    public async CreateScene(): Promise<void> {
        // Initializations
        this._canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
        this._engine = new BABYLON.Engine(this._canvas, true);
        this._scene = new BABYLON.Scene(this._engine);

        // Lights
        this._light = new BABYLON.HemisphericLight(
            "main_light",
            new BABYLON.Vector3(0, 50, 0),
            this._scene
        );
        this._light.intensity = 1.2;

        // Load Scene
        BABYLON.SceneLoader.ImportMeshAsync("", "/meshes/", "scene.glb", this._scene).then(result => {
            // TODO: Classify figures
            this._figures = result.meshes.filter(m => m.id.includes("fig"));
            this._figures.forEach(fig => {
                fig.isPickable = false;
            })
            this._fields = result.meshes.filter(m => m.id.length == 2);
            this.initiateFieldInteractions(this._fields, this._scene);
        }).catch(error => {
            console.log(error);
        });

        // Camera
        this._camera = new BABYLON.FreeCamera(
            "camera_white",
            new BABYLON.Vector3(0, 51.5, 20), // general eye position
            this._scene
        );
        this._scene.activeCamera = this._camera;
        this._camera.setTarget(BABYLON.Vector3.Zero());
        this._camera.attachControl(this._canvas, true);
        this._camera.angularSensibility = 10000;

        // XR
        await this.initiateXR(this._scene, this._xr, this._camera.position);

        // Load Avatars
        // TODO Parametrize in game menu selection
        const avatar_white = new Avatar("white", "male", 1);
        const avatar_black = new Avatar("black", "female", 1);
        this.LoadAvatar(avatar_white);
        this.LoadAvatar(avatar_black);


    }

    /**
     * Loads the specified avatar
     * @param avatar
     * @constructor
     */
    public LoadAvatar(avatar: Avatar): void {
        BABYLON.SceneLoader.ImportMeshAsync("", avatar.rootURL, avatar.filename, this._scene).then(result => {
            avatar.scene = result;
            avatar.stopAnimations();
            avatar.placeAvatar();
            avatar.seatAvatar();
        });
    }

    /**
     * Initiates the Babylon JS Experience for mobile devices
     * @param scene
     * @param xr
     * @param cameraPos
     */
    public async initiateXR(scene: BABYLON.Scene, xr: BABYLON.WebXRDefaultExperience, cameraPos: BABYLON.Vector3) {
        xr = await scene.createDefaultXRExperienceAsync({});

        xr.baseExperience.onInitialXRPoseSetObservable.add(xrCamera => {
            xrCamera.position = cameraPos;
            xrCamera.setTarget(scene.getMeshByID("board").position);
        });

        xr.pointerSelection = <BABYLON.WebXRControllerPointerSelection>xr.baseExperience.featuresManager.enableFeature(BABYLON.WebXRControllerPointerSelection, 'latest', {
            gazeCamera: xr.baseExperience.camera,
            xrInput: xr.input
        });
        //xr.pointerSelection.laserPointerDefaultColor = new BABYLON.Color3(255, 0, 80);
        //let mesh = xr.pointerSelection.getMeshUnderPointer(BABYLON.WebXRControllerPointerSelection.name);
        //console.log(mesh.id);

        /*const vr_possible = await xr.baseExperience.sessionManager.isSessionSupportedAsync("immersive-vr");
        if (vr_possible) {
            this._scene.registerBeforeRender(() => {
                let mesh = this._scene.getPointerOverMesh();
                console.log(mesh.id);
            });
        }*/
    }

    public initiateFieldInteractions(fields: Array<BABYLON.AbstractMesh>, scene: BABYLON.Scene): void{
        fields.forEach(mesh => {
            mesh.actionManager = new BABYLON.ActionManager(scene);
            const myMat = mesh.material;
            const selectMat = new BABYLON.StandardMaterial("myMat", scene);
            selectMat.diffuseColor = new BABYLON.Color3(0.2, 0.2, 1);

            // Hover over -> set field to color
            mesh.actionManager.registerAction(
                new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger,
                    function (evt) {
                        mesh.material = selectMat;
                        console.log(mesh.id);
                    }));

            // Hover out -> reset field to original
            mesh.actionManager.registerAction(
                new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger,
                    function (evt) {
                        mesh.material = myMat;
                    }));
        });
    }

    /**
     * Handles the Rendering of the scene
     * @constructor
     */
    public DoRender(): void {
        // run the main render loop
        this._engine.runRenderLoop(() => {
            this._scene.render();
        });

        // The canvas/window resize event handler.
        window.addEventListener("resize", () => {
            this._engine.resize();
        });
    }
}
