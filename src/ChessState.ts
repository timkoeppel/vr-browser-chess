import * as BABYLON from "@babylonjs/core";
import {ChessFigure} from "./ChessFigure";
import {ChessField} from "./ChessField";
import {Chess, Move} from "chess.ts";
import {ChessPlayer} from "./ChessPlayer";
import {Position} from "./Position";
import {ActionManager} from "./ActionManager";
import Game from "./Game";
import {AI} from "./AI";
import {Avatar} from "./Avatar";
import {ChessBoard} from "./ChessBoard";

/**
 * ChessState manages the game state, logic and move management
 * ... -> next Player (begin) -> select move -> make move -> next Player -> ... -> Game Over
 */
export class ChessState {
    get actionmanager(): ActionManager {
        return this._actionmanager;
    }

    set actionmanager(value: ActionManager) {
        this._actionmanager = value;
    }

    get is_game_running(): boolean {
        return this._is_game_running;
    }

    set is_game_running(value: boolean) {
        this._is_game_running = value;
    }

    get own_player(): ChessPlayer {
        return this._own_player;
    }

    set own_player(value: ChessPlayer) {
        this._own_player = value;
    }

    get game(): Game {
        return this._game;
    }

    set game(value: Game) {
        this._game = value;
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
    private _own_player: ChessPlayer;
    private _white: ChessPlayer;
    private _black: ChessPlayer;
    private _selected_field: ChessField | null;
    private _moves: Array<Move>;
    private _game: Game;
    private _is_game_running: boolean;
    private _actionmanager: ActionManager;

    constructor(game: Game, own_color: "white" | "black", black_player_type: "human" | "easy" | "intermediate" | "expert", own_avatar: Avatar, other_avatar: Avatar) {
        const white_avatar = (own_color === "white") ? own_avatar : other_avatar;
        const black_avatar = (own_color === "black") ? own_avatar : other_avatar;

        this.logic = new Chess();
        this.white = new ChessPlayer("human", "white", white_avatar, this);
        this.black = new ChessPlayer(black_player_type, "black", black_avatar, this);
        this.own_player = own_color === "white" ? this.white : this.black;
        this.current_player = this.white;
        this.selected_field = null;
        this.is_game_running = true;
        this.moves = [];
        this.game = game;
        this.actionmanager = new ActionManager(this);
    }

    // ************************************************************************
    // MAIN METHODS
    // ************************************************************************
    /**
     * Manages a gaze-click or "voice-click" from the user on a field
     * @param clicked_field
     */
    public processClick(clicked_field: ChessField) {
        // Field without figure and which is not part of a move -> No reset
        const is_unplayable_field = clicked_field.figure === null && !this.isPartOfMove(clicked_field);
        const is_not_my_turn = this.own_player !== this.current_player;
        const is_same_field = this.selected_field === clicked_field;

        if (is_unplayable_field || is_not_my_turn || !this.is_game_running || is_same_field) {
            return;
        }

        // Field with figure
        this.game.chessboard.resetFieldsMaterial().then(() => {
            if (clicked_field.figure !== null) {
                // Own figure --> Select this figure
                if (this.isOwnFigure(clicked_field.figure)) {
                    this.toMoveSelection(clicked_field)
                }
                // Beatable enemy figure --> Make (beat) move
                else if (this.isPartOfMove(clicked_field)) {
                    this.makeHumanMove(clicked_field);
                }
            }
            // Field without figure
            else {
                // Playable Field --> Make move
                if (this.isPartOfMove(clicked_field)) {
                    this.makeHumanMove(clicked_field);
                }
            }
        })
    }

    /**
     * Proceeds with all actions involved in a move made by a human
     * @param clicked_field
     */
    public makeHumanMove(clicked_field: ChessField) {
        const move = this.getMove(clicked_field);
        this.submitMove(move);
        this.makeMove(move, this.selected_field.figure);
        this.toNextPlayer();
    }

    /**
     * Executes the move from the other player (AI or other human) in your browser
     * @param move
     */
    public makeOtherPlayerMove(move: Move) {
        this.selected_field = this.game.chessboard.getField(move.from);

        /* NOT WORKING HAND ANIMATION TODO
        let hand_rel = this.current_player.avatar.pose.hand_r.position;
        let field_abs = this.selected_field.mesh.absolutePosition;

        let target_pos = Position.getLocalFromGlobal(this.current_player.avatar.pose.hand_r, field_abs);
        setTimeout(() => {
            ActionManager.moveHands(this.current_player.avatar.pose.hand_r, hand_rel, target_pos);
        }, 1000);
         */

        // Wait 2 seconds to make experience not too stressed
        // Action
        setTimeout(() => {
            this.makeMove(move, this.selected_field.figure);
            this.toNextPlayer();
        }, 2000);
    }

    /**
     * Proceeds to the move making process
     * @param clicked_field
     */
    public toMoveSelection(clicked_field: ChessField) {
        // Change State
        const moves = this.logic.moves({square: clicked_field.id, verbose: true});
        this.moves = ChessState.toUpperNotationMulti(moves);
        this.selected_field = clicked_field;

        // Change Materials
        const playable_fields = this.getPlayableFields(this.moves);
        this.game.controller.setFieldAsSelected(this.selected_field);
        this.game.controller.setFieldsAsPlayable(playable_fields);

        /* NOT WORKING HAND ANIMATION TODO
        let hand_rel = this.current_player.avatar.pose.hand_r.position;
        let field_abs = this.selected_field.mesh.absolutePosition;
        let target_pos = Position.getLocalFromGlobal(this.current_player.avatar.pose.hand_r, field_abs);
        ActionManager.moveHands(this.current_player.avatar.pose.hand_r, hand_rel, target_pos);
         */
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

        // Make moves if Ai and continues the lifecycle
        if (this.current_player.type !== "human") {
            const move = ChessState.toUpperNotationSingle((this.current_player.type as AI).getMove());
            this.submitMove(move);
            this.makeOtherPlayerMove(move);
        }
    }

    /**
     * Ends the game chain and initiates a game over
     * @private
     */
    private toGameOver() {
        const won_lost = (this.current_player === this.own_player) ? "won" : "lost";
        const game_over_message: string = `GAME OVER: You ${won_lost}!`;
        console.log(game_over_message);
        this.game.dom.displayMessage(game_over_message, "important");
    }

    /**
     * Manages the movement (physical and logical) of a figure
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
     * Manages the processes involved when a figure is promoted (to a queen)
     * @param promoted_pawn
     * @param color
     */
    public physicalPromotion(promoted_pawn: ChessFigure, color: "white" | "black"): void {
        let promotion_queen = this.game.chessboard.getPromotionQueen(color);
        promotion_queen.addToField(promoted_pawn.position);
        promoted_pawn.removeFromField();
    }

    /**
     * Manages the processes involved when a figure is captured
     * @param moved_fig
     * @param captured_figure
     * @param captured_field
     * @param is_en_passant
     */
    public capture(moved_fig: ChessFigure, captured_figure: ChessFigure, captured_field: ChessField, is_en_passant: boolean): void {
        // logical capture
        captured_figure.on_field = false;
        captured_field.figure = is_en_passant ? null : moved_fig;

        // physical capture TODO capture move hands
        const new_pos = ChessState.getOffBoardPosition(captured_figure);
        this.actionmanager.moveFigure(captured_figure, captured_figure.position.scene_pos, new_pos);
        captured_figure.position = new Position(new_pos);
    }

    /**
     * Manages the physical move of a figure in the environment
     * @param move
     * @param fig_to_move
     * @private
     */
    private makePhysicalMove(move: Move, fig_to_move: ChessFigure): void {
        // Capture case
        if (ChessState.isCapture(move)) {
            let captured_fig: ChessFigure;
            let captured_field: ChessField;
            let is_en_passant: boolean;

            if (ChessState.isEnPassantCapture(move)) {
                const en_passant_field = ChessState.getEnPassantField(move);
                captured_field = this.game.chessboard.getField(en_passant_field);
                captured_fig = captured_field.figure;
                is_en_passant = true
            } else {
                captured_field = this.game.chessboard.getField(move.to);
                captured_fig = captured_field.figure;
                is_en_passant = false;
            }
            this.capture(fig_to_move, captured_fig, captured_field, is_en_passant)
        }

        const target_pos = new Position(move.to, "figure");
        /* NOT WORKING HAND ANIMATION TODO
        let hand_rel = this.current_player.avatar.pose.hand_r.position;
        let field_abs = Position.getLocalFromGlobal(this.current_player.avatar.pose.hand_r, this.game.chessboard.getField(move.to).mesh.absolutePosition);
        let ori_rel = this.current_player.avatar.pose.hand_r_original.position;

        ActionManager.moveHands(this.current_player.avatar.pose.hand_r, hand_rel, field_abs, ori_rel);
         */

        // Promotion case
        if (ChessState.isPromotion(move)) {
            this.actionmanager.moveFigureAndPromote(fig_to_move, fig_to_move.mesh.position, target_pos.scene_pos);
        } else {
            this.actionmanager.moveFigure(fig_to_move, fig_to_move.mesh.position, target_pos.scene_pos);
        }

        // Rochade/Castling case
        if (ChessState.isCastling(move)) {
            const castling = this.getCastlingInfo(move);
            this.actionmanager.moveFigure(castling['rook'].mesh, castling['from'].position.scene_pos, castling['to'].position.scene_pos);
        }
    }

    /**
     * Manages all logical internal changes of a move making
     * @param move
     * @param fig_to_move
     * @private
     */
    private makeLogicalMove(move: Move, fig_to_move: ChessFigure): void {
        // Promotion (only queens for simplicity)
        const prom_fig = ChessState.isPromotion(move) ? "q" : null;

        // Inform Chess.ts logic about move
        const made_move = this.logic.move({
            from: move.from.toLowerCase(),
            to: move.to.toLowerCase(),
            promotion: prom_fig
        });
        console.log(made_move);
        console.log(this.logic.ascii());

        // Refresh Project Figure
        fig_to_move.position = new Position(move.to, "figure");

        // Refresh Project fields
        this.game.chessboard.getField(move.from).figure = null;
        this.game.chessboard.getField(move.to).figure = fig_to_move;

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
        if (this.current_player.color === "white") {
            this.current_player = this.black;
        } else {
            this.current_player = this.white;
        }
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
            const playable_field = this.game.chessboard.fields.find(f => f.id === m.to);
            playable_fields.push(playable_field);
        });

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
        });
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
     * Changes all Move properties to upper letters
     * @param moves
     */
    public static toUpperNotationMulti(moves: Array<Move>): Array<Move> {
        let new_moves = [];
        moves.forEach(m => {
            let new_move = this.toUpperNotationSingle(m);
            new_moves.push(new_move);
        });

        return new_moves;
    }

    public static toUpperNotationSingle(move: Move): Move {
        let new_move = Object.assign(move);
        for (let [key, value] of Object.entries(move)) {
            if (typeof value === "string") {
                new_move[key] = value.toUpperCase();
            }
        }
        return new_move;
    }

    /**
     * Checks if the given move is a capture move
     * @param move
     * @private
     */
    public static isCapture(move: Move): boolean {
        return move.flags.includes("C") || move.flags.includes("E");
    }

    /**
     * Checks if the given move is an en passant move
     * @param move
     * @private
     */
    private static isEnPassantCapture(move: Move): boolean {
        return move.flags.includes("E");
    }

    private static isPromotion(move: Move): boolean {
        return move.flags.includes("P");
    }

    /**
     * Gets the field of the figure involved in the en passant capture
     * @param move
     * @private
     */
    private static getEnPassantField(move: Move): string {
        const x_pos_chess = move.to.charAt(0);
        const y_pos_chess = parseInt(move.to.charAt(1));
        const addition = (move.color === "w") ? -1 : 1;
        return x_pos_chess + (y_pos_chess + addition).toString();
    };

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
        const pos_add = fig.color === "white" ? 5 : -5;

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
        const from_field = this.game.chessboard.getField(rook_from_x + chess_z);
        const rook = from_field.figure;

        // get to
        const rook_to_x = move.flags.includes("Q") ? "D" : "F";
        const to_field = this.game.chessboard.getField(rook_to_x + chess_z);

        return {
            rook: rook,
            from: from_field,
            to: to_field
        };

    }

    /**
     * Passes move to the server communication
     * @param data
     * @private
     */
    private submitMove(data) {
        this.game.app.connection.emitPlayerMove(data)
    }

}