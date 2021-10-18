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

        // Load Scene
        BABYLON.SceneLoader.ImportMeshAsync("", "/meshes/", "scene.glb", this._scene).then(result => {

        }).catch(error => {
            console.log(error);
        });

        // Camera
        this._camera = new BABYLON.FreeCamera(
            "camera_white",
            new BABYLON.Vector3(0, 40, 15),
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
    public async initiateXR(scene: BABYLON.Scene, xr: BABYLON.WebXRDefaultExperience, cameraPos: BABYLON.Vector3){
        xr = await scene.createDefaultXRExperienceAsync({});
        // XR puts camera on floor automatically
        // -> Reset to original cam position
        xr.baseExperience.onInitialXRPoseSetObservable.add(xrCamera => {
            xrCamera.position = cameraPos;
            xrCamera.setTarget(scene.getMeshByID("board").position);
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
