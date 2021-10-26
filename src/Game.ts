import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import * as BABYLON from "@babylonjs/core";
import {Avatar} from "./Avatar";
import {ChessBoard} from "./ChessBoard";
import {ChessField} from "./ChessField";
import {Chess} from "chess.ts";

export default class Game {
    private _canvas: HTMLCanvasElement;
    private _engine: BABYLON.Engine;
    private _scene: BABYLON.Scene;
    //private _camera: BABYLON.DeviceOrientationCamera;
    private _camera: BABYLON.FreeCamera;
    private _light: BABYLON.Light;
    private _xr: BABYLON.WebXRDefaultExperience;
    private _chessboard: ChessBoard;

    // ************************************************************************
    // MAIN METHODS
    // ************************************************************************
    /**
     * Creates the whole Game environment
     * @constructor
     */
    public async initiate(): Promise<void> {
        this.initiateHTMLScene();
        this.initiateEngine();
        this.initiateBabylonScene()
        this.initiateLights();
        this.initiateMeshes();
        this.initiateCamera();
        await this.initiateXR();
        this.initiateAvatars();
    }

    /**
     * Initiates the HTML Canvas, which BABYLON uses to render everything in
     */
    public initiateHTMLScene(): void {
        this._canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
    }

    /**
     * Initiates the BABYLON Engine
     */
    public initiateEngine(): void {
        this._engine = new BABYLON.Engine(this._canvas, true);
    }

    /**
     * Initiates the BABYLON Scene envitonment
     */
    public initiateBabylonScene(): void {
        this._scene = new BABYLON.Scene(this._engine);
    }

    /**
     * Initiates the Lights
     */
    public initiateLights(): void {
        this._light = new BABYLON.HemisphericLight(
            "main_light",
            new BABYLON.Vector3(0, 50, 0),
            this._scene
        );
        this._light.intensity = 1.2;
    }

    /**
     * Initiates the camera which is used
     */
    public initiateCamera(): void {
        this._camera = new BABYLON.FreeCamera(
            "camera_white",
            new BABYLON.Vector3(0, 51.5, 20), // general eye position
            this._scene
        );
        this._scene.activeCamera = this._camera;
        this._camera.setTarget(BABYLON.Vector3.Zero());
        this._camera.attachControl(this._canvas, true);
        this._camera.angularSensibility = 10000
    }

    /**
     * Initiates all meshes and imports the whole 3D scene from Blender into the BABYLON Scene
     */
    public initiateMeshes(): void {
        BABYLON.SceneLoader.ImportMeshAsync("", "/meshes/", "scene.glb", this._scene).then(result => {
            this._chessboard = new ChessBoard(result.meshes, this._scene);

            // Initiate field
            this._initiateFieldInteractions(this._chessboard, this._scene);
        }).catch(error => {
            console.log(error);
        });
    }


    /**
     * Initiates the Babylon XR Experience for mobile devices
     */
    public async initiateXR() {
        this._xr = await this._scene.createDefaultXRExperienceAsync({});

        this._xr.baseExperience.onInitialXRPoseSetObservable.add(xrCamera => {
            xrCamera.position = this._camera.position;
            xrCamera.setTarget(this._scene.getMeshByID("board").position);
        });

        this._xr.pointerSelection = <BABYLON.WebXRControllerPointerSelection>this._xr.baseExperience.featuresManager.enableFeature(BABYLON.WebXRControllerPointerSelection, 'latest', {
            gazeCamera: this._xr.baseExperience.camera,
            xrInput: this._xr.input
        });
    }

    /**
     * Initiates the Avatars by importing and positioning them
     */
    public initiateAvatars(): void {
        // TODO Parametrize in game menu selection
        const avatar_white = new Avatar("white", "male", 1);
        const avatar_black = new Avatar("black", "female", 1);
        this._LoadAvatar(avatar_white);
        this._LoadAvatar(avatar_black);
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

    // ************************************************************************
    // HELPER METHODS
    // ************************************************************************
    /**
     * Enables
     * @param chessboard
     * @param scene
     */
    private _initiateFieldInteractions(chessboard: ChessBoard, scene: BABYLON.Scene): void {
        // Gaze through figures
        chessboard.makeFiguresUnpickable();


        chessboard.fields.forEach(field => {
            field.mesh.actionManager = new BABYLON.ActionManager(scene);

            // Interactions
            field.setupHoverOn();
            field.setupHoverOut();
            field.setupSelection(chessboard, scene);
        });
    }

    /**
     * Loads the specified avatar
     * @param avatar
     * @constructor
     */
    private _LoadAvatar(avatar: Avatar): void {
        BABYLON.SceneLoader.ImportMeshAsync("", avatar.rootURL, avatar.filename, this._scene).then(result => {
            avatar.scene = result;
            avatar.stopAnimations();
            avatar.placeAvatar();
            avatar.seatAvatar();
        });
    }




}
