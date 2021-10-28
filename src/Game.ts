import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import * as BABYLON from "@babylonjs/core";
import {Avatar} from "./Avatar";
import {ChessBoard} from "./ChessBoard";
import {ChessField} from "./ChessField";
import {Chess} from "chess.ts";

export default class Game {
    get chessboard(): ChessBoard {
        return this._chessboard;
    }

    set chessboard(value: ChessBoard) {
        this._chessboard = value;
    }

    get xr(): BABYLON.WebXRDefaultExperience {
        return this._xr;
    }

    set xr(value: BABYLON.WebXRDefaultExperience) {
        this._xr = value;
    }

    get light(): BABYLON.Light {
        return this._light;
    }

    set light(value: BABYLON.Light) {
        this._light = value;
    }

    get camera(): BABYLON.FreeCamera {
        return this._camera;
    }

    set camera(value: BABYLON.FreeCamera) {
        this._camera = value;
    }

    get scene(): BABYLON.Scene {
        return this._scene;
    }

    set scene(value: BABYLON.Scene) {
        this._scene = value;
    }

    get engine(): BABYLON.Engine {
        return this._engine;
    }

    set engine(value: BABYLON.Engine) {
        this._engine = value;
    }

    get canvas(): HTMLCanvasElement {
        return this._canvas;
    }

    set canvas(value: HTMLCanvasElement) {
        this._canvas = value;
    }

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
        this.canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
    }

    /**
     * Initiates the BABYLON Engine
     */
    public initiateEngine(): void {
        this.engine = new BABYLON.Engine(this.canvas, true);
    }

    /**
     * Initiates the BABYLON Scene envitonment
     */
    public initiateBabylonScene(): void {
        this.scene = new BABYLON.Scene(this.engine);
    }

    /**
     * Initiates the Lights over the table
     */
    public initiateLights(): void {
        this.light = new BABYLON.HemisphericLight(
            "main_light",
            new BABYLON.Vector3(0, 50, 0),
            this.scene
        );
        this.light.intensity = 1.2;
    }

    /**
     * Initiates the camera which is used
     */
    public initiateCamera(): void {
        this.camera = new BABYLON.FreeCamera(
            "camera_white",
            new BABYLON.Vector3(0, 51.5, 20), // general eye position
            this.scene
        );
        this.scene.activeCamera = this.camera;
        this.camera.setTarget(BABYLON.Vector3.Zero());
        this.camera.attachControl(this.canvas, true);
        this.camera.angularSensibility = 10000
    }

    /**
     * Initiates all meshes and imports the whole 3D scene from Blender into the BABYLON Scene
     */
    public initiateMeshes(): void {
        BABYLON.SceneLoader.ImportMeshAsync("", "/meshes/", "scene.glb", this.scene).then(result => {
            this.chessboard = new ChessBoard(result.meshes);

            // Initiate field
            this.initiateFieldInteractions(this.chessboard, this.scene);
        }).catch(error => {
            console.log(error);
        });
    }


    /**
     * Initiates the Babylon XR Experience for mobile devices
     */
    public async initiateXR() {
        this.xr = await this.scene.createDefaultXRExperienceAsync({});

        this.xr.baseExperience.onInitialXRPoseSetObservable.add(xrCamera => {
            xrCamera.position = this.camera.position;
            xrCamera.setTarget(this.scene.getMeshByID("board").position);
        });

        this.xr.pointerSelection = <BABYLON.WebXRControllerPointerSelection>this.xr.baseExperience.featuresManager.enableFeature(BABYLON.WebXRControllerPointerSelection, 'latest', {
            gazeCamera: this.xr.baseExperience.camera,
            xrInput: this.xr.input
        });
    }

    /**
     * Initiates the Avatars by importing and positioning them
     */
    public initiateAvatars(): void {
        // TODO Parametrize in game menu selection
        const avatar_white = new Avatar("white", "male", 1);
        const avatar_black = new Avatar("black", "female", 1);
        this.LoadAvatar(avatar_white);
        this.LoadAvatar(avatar_black);
    }

    /**
     * Handles the Rendering of the scene
     * @constructor
     */
    public DoRender(): void {
        // run the main render loop
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });

        // The canvas/window resize event handler.
        window.addEventListener("resize", () => {
            this.engine.resize();
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
    private initiateFieldInteractions(chessboard: ChessBoard, scene: BABYLON.Scene): void {
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
    private LoadAvatar(avatar: Avatar): void {
        BABYLON.SceneLoader.ImportMeshAsync("", avatar.rootURL, avatar.filename, this.scene).then(result => {
            avatar.scene = result;
            avatar.stopAnimations();
            avatar.placeAvatar();
            avatar.seatAvatar();
        });
    }


}
