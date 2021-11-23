import { ChessField } from "./ChessField";
import { Controller } from "./Controller";
import Game from "./Game";
export declare class GazeController extends Controller {
    constructor(game: Game);
    /**
     * Enables the interaction with the chess fields
     * - Hover over/out
     * - Click (selection)
     */
    initiateGazeInteractions(): void;
    /**
     * Sets up the selection of a field
     * @param field field to set up
     */
    setupSelection(field: ChessField): void;
    /**
     * Sets up the hover-on functionality to change to the given material
     */
    setupHoverOn(field: ChessField): void;
    /**
     * Sets up the hover-out functionality which resets to the previous state
     */
    setupHoverOut(field: ChessField): void;
}
