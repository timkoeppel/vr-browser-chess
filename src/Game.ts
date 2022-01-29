import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import * as BABYLON from "@babylonjs/core";
import {WebXRState} from "@babylonjs/core";
import {Avatar} from "./Avatar";
import {ChessBoard} from "./ChessBoard";
import {GazeController} from "./GazeController";
import {VoiceController} from "./VoiceController";
import {Controller} from "./Controller";
import {VRGUI} from "./VRGUI";
import {App} from "./App";
import {IPlayerData} from "./PlayerData";
import {Pose} from "./Pose";
import {ChessState} from "./ChessState";

/**
 * Game manages all modules necessary for a chess game
 */
export default class Game {
    get chessstate(): ChessState {
        return this._chessstate;
    }

    set chessstate(value: ChessState) {
        this._chessstate = value;
    }
    get other_avatar(): Avatar {
        return this._other_avatar;
    }

    set other_avatar(value: Avatar) {
        this._other_avatar = value;
    }

    get own_avatar(): Avatar {
        return this._own_avatar;
    }

    set own_avatar(value: Avatar) {
        this._own_avatar = value;
    }

    get own_color(): "white" | "black" {
        return this._own_color;
    }

    set own_color(value: "white" | "black") {
        this._own_color = value;
    }

    get gui(): VRGUI {
        return this._gui;
    }

    set gui(value: VRGUI) {
        this._gui = value;
    }

    get app(): App {
        return this._app;
    }

    set app(value: App) {
        this._app = value;
    }

    get controller(): Controller {
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
    private _chessstate: ChessState;
    private _app: App;
    private _controller: Controller;
    private _gui: VRGUI;
    private _own_color: "white" | "black";
    private _own_avatar: Avatar;
    private _other_avatar: Avatar;

    /**
     * Creates the whole Game environment
     * @constructor
     */
    constructor(own_color: "white" | "black", app: App) {
        this.app = app;
        this.initiateBabylon();
        this.own_color = own_color;

        this.initiateLights();
        this.initiateMenuCamera();
        this.initiateScene();
        this.initiateXR();
        this.gui = new VRGUI(own_color, this, this.scene);
        this.DoRender(true);
    }

    // ************************************************************************
    // MAIN METHODS
    // ************************************************************************
    /**
     * Initiates the own player avatar, controller and changes to the camera
     * @param data
     */
    public async prepareOwnPlayer(data: IPlayerData) {
        await this.initiateAvatar(data.color, data.avatar);

        // Despite the asynchronous design it does not have the avatar initialized
        // when wanting to change the camera --> unprofessional timeout
        setTimeout(async () => {
           await this.changeToPlayerCamera();
            if(this.other_avatar === undefined){
                this.gui.displayMessage("Waiting for the other player ...", "important");
            }
        }, 1000);
        console.log(`Player ${data.color} ready!`)
    }

    /**
     * Prepares the chess game by initiating the other players avatar
     * @param other_player
     */
    public async prepareOtherPlayer(other_player: IPlayerData) {
        await this.initiateAvatar(other_player.color, other_player.avatar);
    }

    /**
     * Starts the chess game by starting the logic engine and initiating controller
     * @param own_player
     * @param other_player
     */
    public async startChessGame(own_player: IPlayerData, other_player: IPlayerData){
        const own_color = own_player.color;
        const black_player = (own_player.color === "white") ? other_player.player_type : own_player.player_type;

        this.chessstate = new ChessState(this, own_color, black_player, this.own_avatar, this.other_avatar);
        await this.initiateController(own_player.controller);
        console.log("Chess game started.")
    }


    /**
     * Initiates the canvas, engine and the scene (Babylon stuff)
     */
    public initiateBabylon() {
        console.log(`Initiating Babylon JS ...`);
        // Babylon necessities
        this.canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
        this.engine = new BABYLON.Engine(this.canvas, true);
        this.scene = new BABYLON.Scene(this.engine);

        // Loading Screen
        BABYLON.DefaultLoadingScreen.DefaultLogoUrl = "./img/vr-browser-chess.png";
        BABYLON.DefaultLoadingScreen.DefaultSpinnerUrl = "./img/favicon-16x16.png";
        console.log(`Babylon JS initiated.`);
    }

    /**
     * Initiates the Lights over the table
     */
    public initiateLights() {
        console.log(`Initiating Lights ...`);
        this.light = new BABYLON.HemisphericLight(
            "main_light",
            new BABYLON.Vector3(0, 100, 0),
            this.scene
        );
        this.light.intensity = 1;
        console.log(`Lights initiated.`);
    }

    /**
     * Initiates all meshes and imports the whole 3D scene from Blender into the BABYLON Scene
     */
    public async initiateScene() {
        console.log(`Initiating all meshes ...`);
        const t1 = performance.now();
        await BABYLON.SceneLoader.AppendAsync("./meshes/", "scene.glb", this.scene, (evt) => {
            this.gui.displaySceneProgress(evt.loaded, evt.total)
        }).then(scene => {
            this.scene = scene;
            this.chessboard = new ChessBoard(scene.meshes, this);
            const t2 = performance.now();
            const t = ((t2 - t1)/1000).toFixed(2);
            console.log(`Meshes initiated in ${t} s.`);
        }).catch(error => {
            console.log(error);
        });

        // Prepare GUI
        VRGUI.hideHTMLElement(document.getElementById("scene-progress"));
        const supported = await this.xr.baseExperience.sessionManager.isSessionSupportedAsync('immersive-vr');
        if(supported){
            VRGUI.showEnterVRDisplay(this.xr.enterExitUI.overlay);
        }
    }

    /**
     * Initiates the camera which looks at the chess scene with the game menu in the foreground
     */
    public initiateMenuCamera(): void {
        console.log(`Initiating initial camera ...`);
        this.camera = new BABYLON.FreeCamera(
            "camera",
            new BABYLON.Vector3(100, 50, 0),
            this.scene
        );
        this.camera.setTarget(new BABYLON.Vector3(0, 50, 0));
        this.camera.attachControl(this.canvas, true);
        this.camera.angularSensibility = 10000;
        console.log(`Initial camera initiated.`);
    }

    /**
     * Changes to the correlating camera of the player
     */
    public async changeToPlayerCamera(): Promise<void> {
        console.log(`Initiating player camera ...`);
        // get new positions
        const z_pos = this.own_avatar.pose.nose.absolutePosition.z;
        const y_pos = this.own_avatar.pose.eye_l.absolutePosition.y;
        const eye_position = new BABYLON.Vector3(0, y_pos, z_pos);

        // adjust camera (XR case as well as non-XR case)
        this.camera.position.set(eye_position.x, eye_position.y, eye_position.z);
        this.xr.baseExperience.camera.position.set(eye_position.x, eye_position.y, eye_position.z);
        this.camera.setTarget(new BABYLON.Vector3(0, 25, 0));
        this.camera.applyGravity = false;

        console.log(`Player camera initiated.`);
    }

    /**
     * Initiates the Avatars by importing and positioning them
     */
    public async initiateAvatar(color: "white" | "black", file_name: string): Promise<void> {
        console.log(`Initiating ${color} avatar ...`);
        // Assignment in game
        if (color === this.own_color) {
            this.own_avatar = new Avatar(color, file_name);
            this.own_avatar = await this.LoadAvatar(this.own_avatar, color);
        } else {
            this.other_avatar = new Avatar(color, file_name);
            this.other_avatar = await this.LoadAvatar(this.other_avatar, color);
        }
    }


    /**
     * Initiates the Babylon XR Experience for mobile devices
     */
    public async initiateXR(): Promise<void> {
        console.log(`Initiating XR ...`);

        // instantiate
        this.xr = await this.scene.createDefaultXRExperienceAsync({
            uiOptions: {
                sessionMode: "immersive-vr"
            },
        });

        // support check
        const supported = this.xr.baseExperience.sessionManager.isSessionSupportedAsync('immersive-vr');
        if (!supported) {
            console.log(`XR not supported on this device. XR not initiated.`);
            return;
        }

        // configure gaze pointer
        this.xr.pointerSelection = <BABYLON.WebXRControllerPointerSelection>this.xr.baseExperience.featuresManager.enableFeature(BABYLON.WebXRControllerPointerSelection, 'latest', {
            gazeCamera: this.xr.baseExperience.camera,
            forceGazeMode: true,
            xrInput: this.xr.input,
            timeToSelect: 1500,
        });

        // set XR-camera position to non-XR camera position
        this.xr.baseExperience.onInitialXRPoseSetObservable.add((cam) => {
            cam.position = new BABYLON.Vector3(this.camera.position.x, this.camera.position.y, this.camera.position.z);
        });

        // Make selector cross visible in XR mode
        this.xr.baseExperience.onStateChangedObservable.add( (xrs, xre) => {
            if(xrs === WebXRState.IN_XR){
                if(this.controller === undefined || this.controller.type === "gaze"){
                    this.gui.initiateCross();
                }
            }else if (xrs === WebXRState.NOT_IN_XR){
                this.gui.hideScreen(this.gui.selector_cross_v);
                this.gui.hideScreen(this.gui.selector_cross_h);
            }
        });

        // Hide Button until meshes ready
        VRGUI.hideHTMLElement(this.xr.enterExitUI.overlay);
        console.log(`XR initiated`);
    }

    /**
     * Initiates the selected controller for the player
     * @param type "gaze" | "voice"
     */
    public async initiateController(type: "gaze" | "voice"): Promise<void> {
        console.log(`Initiating ${type} controller ...`);
        if (type === "gaze") {
            let controller = new GazeController(this);
            controller.initiateGazeInteractions();
            this.controller = controller;
        } else {
            let controller = new VoiceController(this);
            controller.initiate();
            this.controller = controller;
        }
    }

    /**
     * Handles the Rendering of the scene
     * @constructor
     */
    public DoRender(show_fps: boolean): void {
        // run the main render loop
        this.engine.runRenderLoop(() => {
            //const fps = this.engine.getFps().toFixed(1);
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
     * @param color
     * @constructor
     */
    private async LoadAvatar(avatar: Avatar, color: "white" | "black"): Promise<Avatar> {
        const t1 = performance.now();
        await BABYLON.SceneLoader.ImportMeshAsync("", avatar.rootURL, avatar.filename, this.scene, (evt) => {
            this.gui.displayMessage(`Loading ${color} avatar: ${((evt.loaded / evt.total) * 100).toFixed(1)}%`, "important");
        }).then(result => {
            avatar.scene = result;
            avatar.stopAnimations();
            avatar.placeAvatar();
            avatar.pose = new Pose(result.transformNodes);
            avatar.seatAvatar();
            avatar.loaded = true;

            const t2 = performance.now();
            const t = ((t2 - t1)/1000).toFixed(2);
            console.log(`Avatar ${color} initiated in ${t} s.`);

            this.app.connection.emitAvatarPreparation(color);
        });
        return avatar;
    }
}
