import * as BABYLON from "@babylonjs/core";
import { ChessField } from "./ChessField";
import { ChessFigure } from "./ChessFigure";
import { ChessState } from "./ChessState";
import Game from "./Game";
/**
 * ChessBoard manages all aspects bound to the chessboard
 */
export declare class ChessBoard {
    get game(): Game;
    set game(value: Game);
    get state(): ChessState;
    set state(value: ChessState);
    get figures(): Array<ChessFigure>;
    set figures(value: Array<ChessFigure>);
    get fields(): Array<ChessField>;
    set fields(value: Array<ChessField>);
    private _figures;
    private _fields;
    private _state;
    private _game;
    /**
     * Constructs a complex chessboard with its figures from the meshes
     * @param meshes The imported meshes
     * @param game The game the board is bounded to
     */
    constructor(meshes: Array<BABYLON.AbstractMesh>, game: Game);
    /**
     * Resets the material for all fields to their original black/white field material
     */
    resetFieldsMaterial(): Promise<void>;
    /**
     * Makes figure unpickable so that you can gaze "through" them
     */
    makeFiguresUnpickable(): void;
    /**
     * Gets the ChessField by the given chess ID
     * @param chess_pos
     */
    getField(chess_pos: string): ChessField;
    /**
     * Extracts all the Chessfields from imported meshes
     * @param meshes The imported chess meshes (board/fields, figures)
     * @param board The chessboard to which the Chessfields should belong to
     * @private
     */
    private static extractFields;
    /**
     * Gets the figure on a field by its position (getFigure won't work, because the board isn't initialized yet)
     * @param pos The field position
     * @param figures All the possible figures
     * @private
     */
    private static getFigureByPos;
}
