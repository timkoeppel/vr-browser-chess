import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import * as BABYLON from "@babylonjs/core";
import {Avatar} from "./Avatar";
import {ChessBoard} from "./ChessBoard";
import {GazeController} from "./GazeController";
import {VoiceController} from "./VoiceController";
import {Controller} from "./Controller";
import {DOM} from "./DOM";
import {App} from "./App";
import {IPlayerData} from "./IPlayerData";

/**
 * Game manages all modules necessary for a chess game
 */
export default class Game {
    get app(): App {
        return this._app;
    }

    set app(value: App) {
        this._app = value;
    }
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
    private _app: App;
    private _controller: Controller;
    // ************************************************************************
    /**
     * Creates the whole Game environment
     * @constructor
     */
    constructor(app: App){
        this.app = app;
    }

    /**
     * Parametrizes the game
     */
    public async initiate(data: Array<IPlayerData>) {
        const own_player_data: IPlayerData = data[0];
        const other_player_data: IPlayerData = data[1];

        this.initiateHTMLCanvas();
        this.initiateEngine();
        this.initiateBabylonScene();
        this.initiateLights();
        this.initiateCamera(/* TODO */);
        await this.initiateMeshes(own_player_data.color, other_player_data.name, own_player_data.ai);
        await this.initiateAvatars(own_player_data.color, own_player_data.avatar, other_player_data.avatar);
        await this.initiateXR();
        await this.initiateController(own_player_data.controller);
        await this.startGameWithAIMove();
    }

    /**
     * Initiates the HTML Canvas, which BABYLON uses to render everything in
     */
    public initiateHTMLCanvas(){
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
    public async initiateMeshes(own_color: "white" | "black", other_name: string, ai: "easy" | "intermediate" | "expert") {
        await BABYLON.SceneLoader.AppendAsync("./meshes/", "scene.glb",  this.scene).then(scene => {
            this.scene = scene;
            const is_white_human = own_color === "white" || other_name !== "AI";
            const is_black_human = own_color === "black" || other_name !== "AI";
            this.chessboard = new ChessBoard(scene.meshes, own_color, is_white_human, is_black_human, ai, this);
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
    public async initiateAvatars(own_color: "white" | "black", own_avatar_name: string, other_avatar_name: string){
        const avatar_white = own_color === "white" ? new Avatar("white", own_avatar_name) : new Avatar("white", other_avatar_name);
        const avatar_black = own_color === "black" ? new Avatar("black", own_avatar_name) : new Avatar("black", other_avatar_name);
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

        this.xr.input.xrCamera.position = this.camera.position;

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
    public async startGameWithAIMove(): Promise<void> {
        if (this.chessboard.state.current_player.color === "white" && !this.chessboard.state.current_player.human) {
            this.chessboard.state.makeAIMove();
        }
    }

    /**
     * Handles the Rendering of the scene
     * @constructor
     */

    public DoRender(show_fps: boolean): void {
        // Fps management
        let fps_element = document.getElementById("fps");
        if(show_fps) {
            this.app.dom.showElement(fps_element)
        }

        // run the main render loop
        this.engine.runRenderLoop(() => {
            fps_element.innerHTML = this.engine.getFps().toFixed() + " fps";
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
