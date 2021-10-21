import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import * as BABYLON from "@babylonjs/core";
import {Avatar} from "./Avatar";
import {ChessBoard} from "./ChessBoard";
import {ChessField} from "./ChessField";

export default class Game {
    private _canvas: HTMLCanvasElement;
    private _engine: BABYLON.Engine;
    private _scene: BABYLON.Scene;
    //private _camera: BABYLON.DeviceOrientationCamera;
    private _camera: BABYLON.FreeCamera;
    private _light: BABYLON.Light;
    private _xr: BABYLON.WebXRDefaultExperience;
    private _chessboard: ChessBoard;

    public async CreateScene(): Promise<void> {
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
        this._light.intensity = 1.2;

        // Load Scene
        BABYLON.SceneLoader.ImportMeshAsync("", "/meshes/", "scene.glb", this._scene).then(result => {
            this._chessboard = new ChessBoard(result.meshes);

            // Gaze through figures
            this._chessboard.figures.forEach(fig => {
                fig.mesh.isPickable = false;
            })

            // Initiate field
            this.initiateFieldInteractions(this._chessboard, this._scene);
        }).catch(error => {
            console.log(error);
        });

        // Camera
        this._camera = new BABYLON.FreeCamera(
            "camera_white",
            new BABYLON.Vector3(0, 51.5, 20), // general eye position
            this._scene
        );
        this._scene.activeCamera = this._camera;
        this._camera.setTarget(BABYLON.Vector3.Zero());
        this._camera.attachControl(this._canvas, true);
        this._camera.angularSensibility = 10000;

        // XR
        await this.initiateXR(this._scene, this._xr, this._camera.position);

        // Load Avatars
        // TODO Parametrize in game menu selection
        const avatar_white = new Avatar("white", "male", 1);
        const avatar_black = new Avatar("black", "female", 1);
        this.LoadAvatar(avatar_white);
        this.LoadAvatar(avatar_black);


    }

    /**
     * Loads the specified avatar
     * @param avatar
     * @constructor
     */
    public LoadAvatar(avatar: Avatar): void {
        BABYLON.SceneLoader.ImportMeshAsync("", avatar.rootURL, avatar.filename, this._scene).then(result => {
            avatar.scene = result;
            avatar.stopAnimations();
            avatar.placeAvatar();
            avatar.seatAvatar();
        });
    }

    /**
     * Initiates the Babylon JS Experience for mobile devices
     * @param scene
     * @param xr
     * @param cameraPos
     */
    public async initiateXR(scene: BABYLON.Scene, xr: BABYLON.WebXRDefaultExperience, cameraPos: BABYLON.Vector3) {
        xr = await scene.createDefaultXRExperienceAsync({});

        xr.baseExperience.onInitialXRPoseSetObservable.add(xrCamera => {
            xrCamera.position = cameraPos;
            xrCamera.setTarget(scene.getMeshByID("board").position);
        });

        xr.pointerSelection = <BABYLON.WebXRControllerPointerSelection>xr.baseExperience.featuresManager.enableFeature(BABYLON.WebXRControllerPointerSelection, 'latest', {
            gazeCamera: xr.baseExperience.camera,
            xrInput: xr.input
        });
        //xr.pointerSelection.laserPointerDefaultColor = new BABYLON.Color3(255, 0, 80);
        //let mesh = xr.pointerSelection.getMeshUnderPointer(BABYLON.WebXRControllerPointerSelection.name);
        //console.log(mesh.id);

        /*const vr_possible = await xr.baseExperience.sessionManager.isSessionSupportedAsync("immersive-vr");
        if (vr_possible) {
            this._scene.registerBeforeRender(() => {
                let mesh = this._scene.getPointerOverMesh();
                console.log(mesh.id);
            });
        }*/
    }

    public initiateFieldInteractions(chessboard: ChessBoard, scene: BABYLON.Scene): void {
        let fields = chessboard.fields;

        fields.forEach(field => {
            let mesh = field.mesh;
            mesh.actionManager = new BABYLON.ActionManager(scene);

            const hover_material = new BABYLON.StandardMaterial("hover_material", scene);
            hover_material.diffuseColor = new BABYLON.Color3(0.5, 0.6, 1);
            const selection_material = new BABYLON.StandardMaterial("selection_material", scene);
            selection_material.diffuseColor = new BABYLON.Color3(0.1, 0, 1);
            const ori_material = field.getOriginalMaterial(scene);

            // Hover over -> set field to color
            mesh.actionManager.registerAction(
                new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, () => {
                    mesh.material = hover_material;
                }));

            // Hover out -> reset field to original
            mesh.actionManager.registerAction(
                new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, () => {
                    mesh.material = field.is_selected ? selection_material : ori_material;
                }));

            mesh.actionManager.registerAction(
                new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, () => {
                    chessboard.resetSelectedField(scene).then(() =>{
                        field.is_selected = true;
                        mesh.material = selection_material
                    })
                }));
        });
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
}
