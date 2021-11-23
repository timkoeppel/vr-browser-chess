import { ChessField } from "./ChessField";
import * as BABYLON from "@babylonjs/core";
import Game from "./Game";
export declare class Controller {
    get game(): Game;
    set game(value: Game);
    private _game;
    hover_material: BABYLON.Material;
    selection_material: BABYLON.Material;
    playable_material: BABYLON.Material;
    capture_material: BABYLON.Material;
    constructor(game: Game);
    /**
     * Resets the field to the previous material
     * @private
     */
    restorePreviousMaterial(field: ChessField): void;
    /**
     * Sets the field to the given material
     */
    setFieldAsSelected(field: ChessField): void;
    /**
     * Sets field as playable and its logical consequences
     * @private
     * @param playable_moves
     */
    setFieldsAsPlayable(playable_moves: Array<ChessField>): void;
    /**
     * Gets the move related material
     * (Different color for capture move than color for moving move)
     * @private
     */
    private getMoveMaterial;
}
