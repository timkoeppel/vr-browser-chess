import * as BABYLON from "@babylonjs/core";
import {ChessFigure} from "./ChessFigure";
import {ChessField} from "./ChessField";
import {Chess, Move} from "chess.ts";
import {ChessPlayer} from "./ChessPlayer";
import {ChessBoard} from "./ChessBoard";
import {Position} from "./Position";
import {Action} from "./Action";

/**
 * ChessState manages the game state, logic and move management
 * ... -> next Player (begin) -> select move -> make move -> next Player -> ... -> Game Over
 */
export class ChessState {
    get board(): ChessBoard {
        return this._board;
    }

    set board(value: ChessBoard) {
        this._board = value;
    }

    get black(): ChessPlayer {
        return this._black;
    }

    set black(value: ChessPlayer) {
        this._black = value;
    }

    get white(): ChessPlayer {
        return this._white;
    }

    set white(value: ChessPlayer) {
        this._white = value;
    }

    get moves(): Array<Move> | null {
        return this._moves;
    }

    set moves(value: Array<Move> | null) {
        this._moves = value;
    }

    get selected_field(): ChessField | null {
        return this._selected_field;
    }

    set selected_field(value: ChessField | null) {
        this._selected_field = value;
    }

    get current_player(): ChessPlayer {
        return this._current_player;
    }

    set current_player(value: ChessPlayer) {
        this._current_player = value;
    }

    get logic(): Chess {
        return this._logic;
    }

    set logic(value: Chess) {
        this._logic = value;
    }

    private _logic: Chess;
    private _current_player: ChessPlayer;
    private _white: ChessPlayer;
    private _black: ChessPlayer;
    private _selected_field: ChessField | null;
    private _moves: Array<Move>;
    private _board: ChessBoard;

    constructor(board: ChessBoard) {
        this.logic = new Chess();
        this.white = new ChessPlayer(true, "w", this);
        this.black = new ChessPlayer(false, "b", this);
        this.current_player = this.white;
        this.selected_field = null;
        this.moves = [];
        this.board = board;
    }

    // ************************************************************************
    // MAIN METHODS
    // ************************************************************************
    /**
     * Manages a (gaze-)click from the user on a field
     * @param clicked_field
     */
    public processClick(clicked_field: ChessField) {
        // Field without figure and which is not part of a move -> No reset
        if(clicked_field.figure === null && !this.isPartOfMove(clicked_field)){
            return;
        }

        // Field with figure
        this.board.resetFieldsMaterial().then(() => {
            if (clicked_field.figure !== null) {
                // Own figure --> Select this figure
                if (this.isOwnFigure(clicked_field.figure)) {
                    this.toMoveSelection(clicked_field)
                }
                // Beatable enemy figure --> Make (beat) move
                else if (this.isPartOfMove(clicked_field)) {
                    this.makeHumanMove(clicked_field)
                }
            }
            // Field without figure
            else {
                // Playable Field --> Make move
                if (this.isPartOfMove(clicked_field)) {
                    this.makeHumanMove(clicked_field)
                }
            }
        })
    }

    /**
     * Proceeds with all actions involved in a move made by a human
     * @param clicked_field
     */
    public makeHumanMove(clicked_field: ChessField) {
        this.makeMove(this.getMove(clicked_field), this.selected_field.figure);
        this.toNextPlayer();
    }

    /**
     * Proceeds with all actions involved in a move made by an AI
     */
    public makeAIMove() {
        // Change State
        const move = this.current_player.ai.getMove();
        this.selected_field = this.board.getField(move.from);

        // Wait 2 seconds
        // (If moves too fast --> bad UX & physical move corrupts by capture)
        setTimeout(() => {
            this.makeMove(move, this.selected_field.figure);
            this.toNextPlayer();
        }, 2000);
    }

    /**
     * Proceeds to stage 'make move'
     * @param clicked_field
     */
    public toMoveSelection(clicked_field: ChessField) {
        // Change State
        const moves = this.logic.moves({square: clicked_field.id, verbose: true})
        this.moves = ChessState.toUpperNotation(moves);
        this.selected_field = clicked_field;

        // Change Material
        const playable_fields = this.getPlayableFields(this.moves);
        this.selected_field.setFieldAsSelected();
        this.selected_field.setFieldsAsPlayable(playable_fields)
    }

    /**
     * Manages the player change including:
     * - Necessary player/state resets/changes
     * - Game Over check/handling
     * - Make next move if next player is AI
     */
    public toNextPlayer(): void {
        // Reset move related properties of ChessState
        this.resetMoveProperties();

        // Check game over
        if (this.logic.gameOver()) {
            this.toGameOver();
            return; // breaks the game chain
        }

        // Pass to next player
        this.passToNextPlayer();

        // Make moves if Ai
        if (!this.current_player.human) {
            this.makeAIMove();
        }
    }

    /**
     * Ends the game chain
     * @private
     */
    private toGameOver() {
        console.log("GAME OVER!", this.current_player.color, "wins!");
    }

    /**
     * Manages the movement of a figure
     * @param move
     * @param fig_to_move
     * @private
     */
    private makeMove(move: Move, fig_to_move: ChessFigure): void {
        this.makePhysicalMove(move, fig_to_move);
        this.makeLogicalMove(move, fig_to_move);
    }

    /**
     * Checks if the given field is part of an available move based on the field selection
     * @param field
     */
    public isPartOfMove(field: ChessField): boolean {
        const move_targets = this.getMoveTargets();

        return move_targets.includes(field.id);
    }

    /**
     * Manages the processes involved when a figure is captured
     * @param captured_figure
     */
    public processCapturedFigure(captured_figure: ChessFigure): void {
        const new_pos = ChessState.getOffBoardPosition(captured_figure);

        Action.moveFigure(captured_figure.mesh, captured_figure.position.scene_pos, new_pos);
        captured_figure.position = new Position(new_pos);
    }

    // ************************************************************************
    // HELPER METHODS
    // ************************************************************************
    /**
     * Uses the chess logic to determine possible moves for this figure
     */
    private getPlayableFields(moves: Array<Move>): Array<ChessField> {
        let playable_fields = [];

        moves.forEach(m => {
            const playable_field = this.board.fields.find(f => f.id === m.to);
            playable_fields.push(playable_field);
        })

        return playable_fields;
    }

    /**
     * Checks if a figure belongs to the current player
     * @param fig
     * @private
     */
    private isOwnFigure(fig: ChessFigure): boolean {
        return fig.color === this.current_player.color;
    }

    /**
     * Gets the involved move of a playable field
     * @param field
     * @private
     */
    private getMove(field: ChessField): Move {
        return this.moves.find(m => m.to === field.id)
    }

    /**
     * Gets the chess field positions of all available moves
     * @private
     */
    private getMoveTargets(): Array<string> {
        let move_targets = [];
        this.moves.forEach(m => {
            move_targets.push(m.to);
        })
        return move_targets;
    }

    /**
     * Resets the necessary properties of the chess state
     * @private
     */
    private resetMoveProperties(): void {
        this.moves = [];
        this.selected_field = null;
    }

    /**
     * Manages the physical move of a figure in the encironment
     * @param move
     * @param fig_to_move
     * @private
     */
    private makePhysicalMove(move: Move, fig_to_move: ChessFigure): void {
        // Capture case
        if (ChessState.isCapture(move)) {
            let captured_fig = this.board.getField(move.to).figure;
            captured_fig.capture();
        }
        // Animate
        Action.moveFigure(fig_to_move.mesh, fig_to_move.position.scene_pos, Position.convertToScenePos(move.to, "figure"));

        // Rochade/Castling case
        if (ChessState.isCastling(move)) {
            const castling = this.getCastlingInfo(move);
            Action.moveFigure(castling['rook'].mesh, castling['from'].position.scene_pos, castling['to'].position.scene_pos);
        }
    }

    /**
     * Manages all logical internal changes of a move making
     * @param move
     * @param fig_to_move
     * @private
     */
    private makeLogicalMove(move: Move, fig_to_move: ChessFigure): void {
        // Inform Chess.ts logic about move
        const made_move = this.logic.move({from: move.from.toLowerCase(), to: move.to.toLowerCase()});
        console.log(made_move);
        console.log(this.logic.ascii());

        // Refresh Project Figure
        fig_to_move.position = new Position(move.to, "figure");

        // Refresh Project fields
        this.board.getField(move.from).figure = null;
        this.board.getField(move.to).figure = fig_to_move;

        // Rochade/Castling case
        if (ChessState.isCastling(move)) {
            const castling = this.getCastlingInfo(move);

            // Refresh Project Rook
            castling['rook'].pos = castling['to'].position;

            // Refresh Project fields
            castling['from'].figure = null;
            castling['to'].figure = castling['rook'];
        }
    }

    /**
     * Changes the current player in the game state
     * @private
     */
    private passToNextPlayer(): void {
        if (this.current_player.color === "w") {
            this.current_player = this.black;
        } else {
            this.current_player = this.white;
        }
    }

    /**
     * Changes all Move properties to upper letters
     * @param moves
     */
    public static toUpperNotation(moves: Array<Move>): Array<Move> {
        let new_moves = []
        moves.forEach(m => {
            let new_move = Object.assign(m);
            for (let [key, value] of Object.entries(m)) {
                if (typeof value === "string") {
                    new_move[key] = value.toUpperCase();
                }
            }
            new_moves.push(new_move);
        })

        return new_moves;
    }

    /**
     * Checks if the given move is a capture move
     * @param move
     * @private
     */
    private static isCapture(move: Move) {
        return move.flags.includes("C") || move.flags.includes("E");
    }

    /**
     * Checks if the given move is a castling move
     * @param move
     * @private
     */
    private static isCastling(move: Move) {
        return move.flags.includes("K") || move.flags.includes("Q");
    }

    /**
     * Calculates the position of a figure on the table when captured
     * @param fig
     * @private
     */
    private static getOffBoardPosition(fig: ChessFigure): BABYLON.Vector3 {
        const pos_add = fig.color === "w" ? 5 : -5

        const x = fig.original_position.scene_pos.z + pos_add;
        const y = 24.95;
        const z = -fig.original_position.scene_pos.x;

        return new BABYLON.Vector3(x, y, z);
    }

    /**
     * Gets all info from a move regarding castling
     * @param move
     * @private
     */
    private getCastlingInfo(move: Move): object {
        // @ts-ignore
        const chess_z = move.color === "W" ? 1 : 8;

        // Get rook and from
        const rook_from_x = move.flags.includes("Q") ? "A" : "H";
        const from_field = this.board.getField(rook_from_x + chess_z);
        const rook = from_field.figure;

        // get to
        const rook_to_x = move.flags.includes("Q") ? "D" : "F";
        const to_field = this.board.getField(rook_to_x + chess_z);

        return {
            rook: rook,
            from: from_field,
            to: to_field
        };

    }

}