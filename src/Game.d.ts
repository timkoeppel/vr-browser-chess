import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import * as BABYLON from "@babylonjs/core";
import { ChessBoard } from "./ChessBoard";
import { Controller } from "./Controller";
/**
 * Game manages all modules necessary for a chess game
 */
export default class Game {
    get controller(): Controller;
    set controller(value: Controller);
    get chessboard(): ChessBoard;
    set chessboard(value: ChessBoard);
    get xr(): BABYLON.WebXRDefaultExperience;
    set xr(value: BABYLON.WebXRDefaultExperience);
    get light(): BABYLON.Light;
    set light(value: BABYLON.Light);
    get camera(): BABYLON.FreeCamera;
    set camera(value: BABYLON.FreeCamera);
    get scene(): BABYLON.Scene;
    set scene(value: BABYLON.Scene);
    get engine(): BABYLON.Engine;
    set engine(value: BABYLON.Engine);
    get canvas(): HTMLCanvasElement;
    set canvas(value: HTMLCanvasElement);
    private _canvas;
    private _engine;
    private _scene;
    private _camera;
    private _light;
    private _xr;
    private _chessboard;
    private _controller;
    /**
     * Creates the whole Game environment
     * @constructor
     */
    constructor();
    /**
     * Parametrizes the game
     */
    initiate(): Promise<void>;
    /**
     * Initiates the HTML Canvas, which BABYLON uses to render everything in
     */
    initiateHTMLScene(): void;
    /**
     * Initiates the BABYLON Engine
     */
    initiateEngine(): void;
    /**
     * Initiates the BABYLON Scene environment
     */
    initiateBabylonScene(): void;
    /**
     * Initiates the Lights over the table
     */
    initiateLights(): void;
    /**
     * Initiates all meshes and imports the whole 3D scene from Blender into the BABYLON Scene
     */
    initiateMeshes(): Promise<void>;
    /**
     * Initiates the camera which is used
     */
    initiateCamera(): void;
    /**
     * Initiates the Avatars by importing and positioning them
     */
    initiateAvatars(white_gender: "male" | "female", white_ava_no: number, black_gender: "male" | "female", black_ava_no: number): Promise<void>;
    /**
     * Initiates the Babylon XR Experience for mobile devices
     */
    initiateXR(): Promise<void>;
    initiateController(type: "gaze" | "voice"): Promise<void>;
    /**
     * Starts the game chain by making the first move for white
     * (necessary if white is AI)
     */
    startGame(): void;
    /**
     * Handles the Rendering of the scene
     * @constructor
     */
    private divFps;
    DoRender(): void;
    /**
     * Loads the specified avatar
     * @param avatar
     * @constructor
     */
    private LoadAvatar;
}
