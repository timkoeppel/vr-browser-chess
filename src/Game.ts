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
    get own_color(): "white" | "black" {
        return this._own_color;
    }

    set own_color(value: "white" | "black") {
        this._own_color = value;
    }
    get dom(): DOM {
        return this._dom;
    }

    set dom(value: DOM) {
        this._dom = value;
    }
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
    private _dom: DOM;
    private _own_color: "white" | "black";
    // ************************************************************************
    /**
     * Creates the whole Game environment
     * @constructor
     */
    constructor(own_color: "white" | "black", app: App){
        this.app = app;
        this.canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
        this.engine = new BABYLON.Engine(this.canvas, true);
        this.scene = new BABYLON.Scene(this.engine);
        this.own_color = own_color;

        this.initiateBabylonScene();
        this.initiateLights();
        this.initiateMenuCamera();
        this.initiateMeshes().then(() => {});
        this.initiateXR().then(() => {});
        this.dom = new DOM(own_color, this, this.scene);
        this.DoRender(false);
    }

    /**
     * Parametrizes the game
     */
    public async setupPlayerReady(data: IPlayerData) {
        await this.initiatePlayerCamera(data.color);
        await this.initiateAvatar(data.color, data.avatar);
        await this.initiateController(data.controller);
    }

    /**
     * Initiates the HTML Canvas, which BABYLON uses to render everything in
     */
    public initiateHTMLCanvas(){


    }

    /**
     * Initiates the BABYLON Engine
     */
    public initiateEngine() {

    }

    /**
     * Initiates the BABYLON Scene environment
     */
    public initiateBabylonScene() {

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
        this.light.intensity = 1;
    }

    /**
     * Initiates all meshes and imports the whole 3D scene from Blender into the BABYLON Scene
     */
    public async initiateMeshes() {
        await BABYLON.SceneLoader.AppendAsync("./meshes/", "scene.glb",  this.scene).then(scene => {
            this.scene = scene;
            this.chessboard = new ChessBoard(scene.meshes, this);
        }).catch(error => {
            console.log(error);
        });
    }

    public initiateMenuCamera(): void{
        this.camera = new BABYLON.FreeCamera(
            "camera",
            new BABYLON.Vector3(100, 50, 0),
            this.scene
        );
        this.camera.setTarget(new BABYLON.Vector3(0,50, 0));
    }

    /**
     * Initiates the camera which is used
     */
    public initiatePlayerCamera(own_color: "white" | "black") {
        const z_pos = own_color === "white" ? 20 : -20;
        this.camera.position = new BABYLON.Vector3(0, 51.5, z_pos); // TODO general eye position
        this.scene.activeCamera = this.camera;
        this.camera.setTarget(BABYLON.Vector3.Zero());
        this.camera.attachControl(this.canvas, true);
        this.camera.angularSensibility = 10000;
    }

    /**
     * Initiates the Avatars by importing and positioning them
     */
    public async initiateAvatar(color: "white" | "black", file_name: string){
        const avatar = new Avatar("white", file_name);
        this.LoadAvatar(avatar);
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
     * Handles the Rendering of the scene
     * @constructor
     */

    public DoRender(show_fps: boolean): void {
        // Fps management
        let fps_element = document.getElementById("fps");
        if(show_fps) {
            this.app.game.dom.showHTMLElement(fps_element)
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
