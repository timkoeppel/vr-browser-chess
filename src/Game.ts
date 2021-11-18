import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import * as BABYLON from "@babylonjs/core";
import {Avatar} from "./Avatar";
import {ChessBoard} from "./ChessBoard";
import {GazeController} from "./GazeController";
import {VoiceController} from "./VoiceController";
import {Controller} from "./Controller";

/**
 * Game manages all modules necessary for a chess game
 */
export default class Game {
    get controller() : Controller{
        return this._controller;
    }

    set controller(value: Controller) {
        this._controller = value;
    }
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
    private _camera: BABYLON.FreeCamera;
    private _light: BABYLON.Light;
    private _xr: BABYLON.WebXRDefaultExperience;
    private _chessboard: ChessBoard;

    private _controller: Controller;
    // ************************************************************************
    /**
     * Creates the whole Game environment
     * @constructor
     */
    constructor(){
        this.initiateHTMLScene();
        this.initiateEngine();
        this.initiateBabylonScene();
        this.initiateLights();
        this.initiateCamera();
    }

    /**
     * Parametrizes the game
     */
    public async initiate() {
        await this.initiateMeshes();
        await this.initiateAvatars("male", 1, "female", 1);
        await this.initiateXR();
        await this.initiateController("voice");
    }

    /**
     * Initiates the HTML Canvas, which BABYLON uses to render everything in
     */
    public initiateHTMLScene(){
        this.canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;

    }

    /**
     * Initiates the BABYLON Engine
     */
    public initiateEngine() {
        this.engine = new BABYLON.Engine(this.canvas, true);
    }

    /**
     * Initiates the BABYLON Scene environment
     */
    public initiateBabylonScene() {
        this.scene = new BABYLON.Scene(this.engine);
    }

    /**
     * Initiates the Lights over the table
     */
    public initiateLights() {
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
    public async initiateMeshes() {
        await BABYLON.SceneLoader.AppendAsync( "./meshes/", "scene.glb",  this.scene).then(scene => {
            this.scene = scene;
            this.chessboard = new ChessBoard(scene.meshes, this);
        }).catch(error => {
            console.log(error);
        });
    }

    /**
     * Initiates the camera which is used
     */
    public initiateCamera() {
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
    public async initiateAvatars(white_gender: "male" | "female", white_ava_no: number, black_gender: "male" | "female", black_ava_no: number){
        // TODO Parametrize in game menu selection
        const avatar_white = new Avatar("white", white_gender, white_ava_no);
        const avatar_black = new Avatar("black", black_gender, black_ava_no);
        this.LoadAvatar(avatar_white);
        this.LoadAvatar(avatar_black);
    }


    /**
     * Initiates the Babylon XR Experience for mobile devices
     */
    public async initiateXR() {
        this.xr = await this.scene.createDefaultXRExperienceAsync({
            uiOptions: {
                sessionMode: "immersive-vr",
            },
        });

        await this.xr.baseExperience.onInitialXRPoseSetObservable.add(xrCamera => {
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

    public async initiateController(type: "gaze" | "voice"){
        if(type === "gaze"){
            const controller = new GazeController(this);
            controller.initiateGazeInteractions();
            this.controller = controller;
        }else{
            const controller = new VoiceController(this);
            controller.initiate();
            this.controller = controller;
        }
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
