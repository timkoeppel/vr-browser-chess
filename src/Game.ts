import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import * as BABYLON from "@babylonjs/core";
import {Avatar} from "./Avatar";
import {ChessBoard} from "./ChessBoard";

/**
 * Game manages all modules necessary for a chess game
 */
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
        await this.initiateHTMLScene();
        await this.initiateEngine();
        await this.initiateBabylonScene();
        await this.initiateLights();
        await this.initiateMeshes();
        await this.initiateCamera();
        await this.initiateAvatars();
        await this.initiateXR();
    }

    /**
     * Initiates the HTML Canvas, which BABYLON uses to render everything in
     */
    public async initiateHTMLScene(): Promise<void> {
        this.canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
    }

    /**
     * Initiates the BABYLON Engine
     */
    public async initiateEngine(): Promise<void> {
        this.engine = new BABYLON.Engine(this.canvas, true);
    }

    /**
     * Initiates the BABYLON Scene environment
     */
    public async initiateBabylonScene(): Promise<void> {
        this.scene = new BABYLON.Scene(this.engine);
    }

    /**
     * Initiates the Lights over the table
     */
    public async initiateLights(): Promise<void> {
        this.light = new BABYLON.HemisphericLight(
            "main_light",
            new BABYLON.Vector3(0, 40, 0),
            this.scene
        );
        this.light.intensity = 0.8;
    }

    /**
     * Initiates all meshes and imports the whole 3D scene from Blender into the BABYLON Scene
     */
    public async initiateMeshes(): Promise<void> {
        BABYLON.SceneLoader.AppendAsync( "./meshes/", "scene.glb",  this.scene).then(scene => {
            this.scene = scene;
            this.chessboard = new ChessBoard(scene.meshes);

            // Initiate field
            this.initiateFieldInteractions();
        }).catch(error => {
            console.log(error);
        });
    }

    /**
     * Initiates the camera which is used
     */
    public async initiateCamera(): Promise<void> {
        this.camera = new BABYLON.FreeCamera(
            "camera_white",
            new BABYLON.Vector3(0, 51.5, 20), // general eye position
            this.scene
        );
        this.scene.activeCamera = this.camera;
        this.camera.setTarget(BABYLON.Vector3.Zero());
        this.camera.attachControl(this.canvas, true);
        this.camera.angularSensibility = 10000;
    }

    /**
     * Initiates the Avatars by importing and positioning them
     */
    public async initiateAvatars(): Promise<void> {
        // TODO Parametrize in game menu selection
        const avatar_white = new Avatar("white", "male", 1);
        const avatar_black = new Avatar("black", "female", 1);
        this.LoadAvatar(avatar_white);
        this.LoadAvatar(avatar_black);
    }


    /**
     * Initiates the Babylon XR Experience for mobile devices
     */
    public async initiateXR(): Promise<void> {
        this.xr = await this.scene.createDefaultXRExperienceAsync({
            uiOptions: {
                sessionMode: "immersive-vr",
            },
        });

        this.xr.baseExperience.onInitialXRPoseSetObservable.add(xrCamera => {
            xrCamera.position = this.camera.position;
        });

        this.xr.baseExperience.onStateChangedObservable.add((xrs, xre) => {
            if (xrs === 2) {
                this.xr.pointerSelection.displayLaserPointer = true;
                this.xr.pointerSelection.displaySelectionMesh = true;
                this.xr.pointerSelection.disableSelectionMeshLighting = true;
            }
        })
    }

    /**
     * Starts the game chain by making the first move for white
     * (necessary if white is AI)
     */
    public startGame(): void {
        if (this.chessboard.state.current_player.color === "w") {
            this.chessboard.state.makeAIMove();
        }
    }

    /**
     * Handles the Rendering of the scene
     * @constructor
     */
    private divFps = document.getElementById("fps");

    public DoRender(): void {
        // run the main render loop
        this.engine.runRenderLoop(() => {
            this.divFps.innerHTML = this.engine.getFps().toFixed() + " fps";
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
     * Enables the interaction with the chess fields
     * - Hover over/out
     * - Click (selection)
     */
    private initiateFieldInteractions(): void {
        // Gaze through figures
        this.chessboard.makeFiguresUnpickable();


        this.chessboard.fields.forEach(field => {
            field.mesh.actionManager = new BABYLON.ActionManager(this.scene);

            // Interactions
            field.setupHoverOn();
            field.setupHoverOut();
            field.setupSelection(this.scene);
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
