import { ChessFigure } from "./ChessFigure";
import { ChessField } from "./ChessField";
import { Chess, Move } from "chess.ts";
import { ChessPlayer } from "./ChessPlayer";
import Game from "./Game";
/**
 * ChessState manages the game state, logic and move management
 * ... -> next Player (begin) -> select move -> make move -> next Player -> ... -> Game Over
 */
export declare class ChessState {
    get game(): Game;
    set game(value: Game);
    get black(): ChessPlayer;
    set black(value: ChessPlayer);
    get white(): ChessPlayer;
    set white(value: ChessPlayer);
    get moves(): Array<Move> | null;
    set moves(value: Array<Move> | null);
    get selected_field(): ChessField | null;
    set selected_field(value: ChessField | null);
    get current_player(): ChessPlayer;
    set current_player(value: ChessPlayer);
    get logic(): Chess;
    set logic(value: Chess);
    private _logic;
    private _current_player;
    private _white;
    private _black;
    private _selected_field;
    private _moves;
    private _game;
    constructor(game: Game);
    /**
     * Manages a (gaze-)click from the user on a field
     * @param clicked_field
     */
    processClick(clicked_field: ChessField): void;
    /**
     * Proceeds with all actions involved in a move made by a human
     * @param clicked_field
     */
    makeHumanMove(clicked_field: ChessField): void;
    /**
     * Proceeds with all actions involved in a move made by an AI
     */
    makeAIMove(): void;
    /**
     * Proceeds to stage 'make move'
     * @param clicked_field
     */
    toMoveSelection(clicked_field: ChessField): void;
    /**
     * Manages the player change including:
     * - Necessary player/state resets/changes
     * - Game Over check/handling
     * - Make next move if next player is AI
     */
    toNextPlayer(): void;
    /**
     * Ends the game chain
     * @private
     */
    private toGameOver;
    /**
     * Manages the movement of a figure
     * @param move
     * @param fig_to_move
     * @private
     */
    private makeMove;
    /**
     * Checks if the given field is part of an available move based on the field selection
     * @param field
     */
    isPartOfMove(field: ChessField): boolean;
    /**
     * Manages the processes involved when a figure is captured
     * @param captured_figure
     */
    processCapturedFigure(captured_figure: ChessFigure): void;
    /**
     * Uses the chess logic to determine possible moves for this figure
     */
    private getPlayableFields;
    /**
     * Checks if a figure belongs to the current player
     * @param fig
     * @private
     */
    private isOwnFigure;
    /**
     * Gets the involved move of a playable field
     * @param field
     * @private
     */
    private getMove;
    /**
     * Gets the chess field positions of all available moves
     * @private
     */
    private getMoveTargets;
    /**
     * Resets the necessary properties of the chess state
     * @private
     */
    private resetMoveProperties;
    /**
     * Manages the physical move of a figure in the encironment
     * @param move
     * @param fig_to_move
     * @private
     */
    private makePhysicalMove;
    /**
     * Manages all logical internal changes of a move making
     * @param move
     * @param fig_to_move
     * @private
     */
    private makeLogicalMove;
    /**
     * Changes the current player in the game state
     * @private
     */
    private passToNextPlayer;
    /**
     * Changes all Move properties to upper letters
     * @param moves
     */
    static toUpperNotation(moves: Array<Move>): Array<Move>;
    /**
     * Checks if the given move is a capture move
     * @param move
     * @private
     */
    static isCapture(move: Move): boolean;
    /**
     * Checks if the given move is a castling move
     * @param move
     * @private
     */
    private static isCastling;
    /**
     * Calculates the position of a figure on the table when captured
     * @param fig
     * @private
     */
    private static getOffBoardPosition;
    /**
     * Gets all info from a move regarding castling
     * @param move
     * @private
     */
    private getCastlingInfo;
}
