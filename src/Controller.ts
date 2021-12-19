import {ChessField} from "./ChessField";
import * as BABYLON from "@babylonjs/core";
import Game from "./Game";

export class Controller{
    get type(): "gaze" | "voice" {
        return this._type;
    }

    set type(value: "gaze" | "voice") {
        this._type = value;
    }
    get game(): Game {
        return this._game;
    }

    set game(value: Game) {
        this._game = value;
    }
    private _game: Game;
    private _type: "gaze" | "voice";
    public hover_material: BABYLON.Material;
    public selection_material: BABYLON.Material;
    public playable_material: BABYLON.Material;
    public capture_material: BABYLON.Material;

    constructor(game: Game) {
        // Materials
        let selection_material = new BABYLON.StandardMaterial("selection_material", game.scene);
        selection_material.emissiveColor = new BABYLON.Color3(0.1, 0, 1);
        selection_material.disableLighting = true;

        let hover_material = new BABYLON.StandardMaterial("hover_material", game.scene);
        hover_material.emissiveColor = new BABYLON.Color3(0.5, 0.6, 1);
        hover_material.disableLighting = true;

        let playable_material = new BABYLON.StandardMaterial("playable_material", game.scene);
        playable_material.emissiveColor = new BABYLON.Color3(0.5, 1, 0.5);
        playable_material.disableLighting = true;

        let capture_material = new BABYLON.StandardMaterial("capture_material", game.scene);
        capture_material.emissiveColor = new BABYLON.Color3(0.1, 0.5, 0.1);
        capture_material.disableLighting = true;


        this.hover_material = hover_material;
        this.selection_material = selection_material;
        this.playable_material = playable_material;
        this.capture_material = capture_material;
    }

    /**
     * Resets the field to the previous material
     * @private
     */
    public restorePreviousMaterial(field: ChessField): void {
        if (field.isSelected()) {
            field.mesh.material = this.selection_material;
        } else if (field.board.state.isPartOfMove(field)) {
            field.mesh.material = this.getMoveMaterial(field);
        } else {
            field.mesh.material = field.original_material;
        }
    }

    /**
     * Sets the field to the given material
     */
    public setFieldAsSelected(field: ChessField): void {
        field.mesh.material = this.selection_material;
    }

    /**
     * Sets field as playable and its logical consequences
     * @private
     * @param playable_moves
     */
    public setFieldsAsPlayable(playable_moves: Array<ChessField>): void {
        playable_moves.forEach(field => {
            field.mesh.material = this.getMoveMaterial(field);
            field.mesh.edgesWidth = 10;
            field.mesh.edgesColor = new BABYLON.Color4(0.5, 0.5, 0.5, 1);
            field.mesh.enableEdgesRendering();
        })
    }

    /**
     * Gets the move related material
     * (Different color for capture move than color for moving move)
     * @private
     */
    private getMoveMaterial(field: ChessField) {
        return field.figure === null ? this.playable_material : this.capture_material;
    }

}