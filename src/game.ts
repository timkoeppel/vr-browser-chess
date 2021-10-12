import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import * as BABYLON from "@babylonjs/core";


export default class Game {
    private _canvas: HTMLCanvasElement;
    private _engine: BABYLON.Engine;
    private _scene: BABYLON.Scene;
    private _camera: BABYLON.DeviceOrientationCamera;
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
            new BABYLON.Vector3(0, 50, 0), 
            this._scene
        );

        // Load Scene
        BABYLON.SceneLoader.ImportMeshAsync("", "", "scene.babylon", this._scene).then(result => {
            // Board adjustment due to import error
            result.meshes[1].position = new BABYLON.Vector3(0,25,0);
            result.meshes[2].position = new BABYLON.Vector3(0,25,0);
        });

        // Enable VR
        this._vr = this._scene.createDefaultVRExperience({
            createDeviceOrientationCamera: false,
            useXR: false,
        });

        // Camera
        this._camera = new BABYLON.DeviceOrientationCamera(
            "camera_white",
            new BABYLON.Vector3(0, 40, 15), 
            this._scene
        );
        this._scene.activeCamera = this._camera;
        this._camera.setTarget(BABYLON.Vector3.Zero());
        this._camera.attachControl(this._canvas, true);
        //this._camera.angularSensibility = 10000;
        //this._camera.disablePointerInputWhenUsingDeviceOrientation = true;
        
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