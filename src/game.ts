import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import * as BABYLON from "@babylonjs/core";


export default class Game {
    private _canvas: HTMLCanvasElement;
    private _engine: BABYLON.Engine;
    private _scene: BABYLON.Scene;
    private _camera: BABYLON.ArcRotateCamera;
    private _light: BABYLON.Light;
    private _vr: BABYLON.VRExperienceHelper;

    public CreateScene(): void {
        // Initializations
        this._canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
        this._engine = new BABYLON.Engine(this._canvas, true);
        this._scene = new BABYLON.Scene(this._engine);

        // Lights
        this._light = new BABYLON.HemisphericLight(
            "main_light", 
            new BABYLON.Vector3(0, 0, 0), 
            this._scene
        );

        // Camera
        this._camera = new BABYLON.ArcRotateCamera(
            "camera_white",
            0,1,1,
            new BABYLON.Vector3(0, 5, -10), 
            this._scene
        );
        this._camera.setTarget(BABYLON.Vector3.Zero());
        this._camera.attachControl(this._canvas, false);

        // Load Scene
        BABYLON.SceneLoader.AppendAsync("", "scene.babylon", this._scene).then(result => {
            //camera.setTarget(scene.getMeshByName("king_b"));

        });

        // Enable VR
        this._vr = this._scene.createDefaultVRExperience({
            createDeviceOrientationCamera: false,
            useXR: true
        });
    }

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