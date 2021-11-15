import * as BABYLON from "@babylonjs/core";
import {ChessField} from "./ChessField";
import {Controller} from "./Controller";
import Game from "./Game";

export class GazeController extends Controller{
    constructor(game: Game) {
        super(game);

        this.game = game;
    }

    /**
     * Enables the interaction with the chess fields
     * - Hover over/out
     * - Click (selection)
     */
    public initiateGazeInteractions(): void {
        // Gaze through figures
        this.game.chessboard.makeFiguresUnpickable();
        this.game.chessboard.fields.forEach(field => {
            field.mesh.actionManager = new BABYLON.ActionManager(this.game.scene);

            // Interactions
            this.setupHoverOn(field);
            this.setupHoverOut(field);
            this.setupSelection(field);
        });
    }

    /**
     * Sets up the hover-on functionality to change to the given material
     */
    public setupHoverOn(field: ChessField): void {
        field.mesh.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, () => {
                field.mesh.material = this.hover_material;
            }));
    }

    /**
     * Sets up the hover-out functionality which resets to the previous state
     */
    public setupHoverOut(field: ChessField): void {
        field.mesh.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, () => {
                this.restorePreviousMaterial(field);
            }));
    }
}