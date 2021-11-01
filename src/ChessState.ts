import * as BABYLON from "@babylonjs/core";
import {ChessFigure} from "./ChessFigure";
import {ChessField} from "./ChessField";
import {Chess, Move} from "chess.ts";
import {ChessPlayer} from "./ChessPlayer";
import {ChessBoard} from "./ChessBoard";
import {Position} from "./Position";
import {Action} from "./Action";

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
        this.white = new ChessPlayer(true, "w");
        this.black = new ChessPlayer(false, "b");
        this.current_player = this.white;
        this.selected_field = null;
        this.moves = [];
        this.board = board;
    }

    // ************************************************************************
    // MAIN METHODS
    // ************************************************************************

    public processClick(clicked_field: ChessField) {
        // Field with figure
        this.board.resetFieldsMaterial().then(() => {
            if (clicked_field.figure !== null) {
                // Own figure --> Select this figure
                if (this.isOwnFigure(clicked_field.figure)) {
                    this.toMoveSelection(clicked_field)
                }
                // Beatable enemy figure --> Make (beat) move
                else if (this.isPartOfMove(clicked_field)) {
                    this.makeMove(this.getMove(clicked_field), this.selected_field.figure);
                    this.toNextPlayer();
                }
            }
            // Field without figure
            else {
                // Playable Field --> Make move
                if (this.isPartOfMove(clicked_field)) {
                    this.makeMove(this.getMove(clicked_field), this.selected_field.figure);
                    this.toNextPlayer();
                }
            }
        })
    }

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

    // TODO
    public toNextPlayer() {
        // Reset move related properties of ChessState
        this.resetMoveProperties();

        // Check game over/ ... state


        // Refresh player score

        // Pass to next player
        this.passToNextPlayer();

        // Make moves if Ai
        if(!this.current_player.human){
            // TODO do AI stuff
        }
    }

    private makeMove(move: Move, fig_to_move: ChessFigure): void {
        this.makePhysicalMove(move, fig_to_move);
        this.makeLogicalMove(move, fig_to_move);
    }

    public isPartOfMove(field: ChessField): boolean {
        const move_targets = this.getMoveTargets();

        return move_targets.includes(field.id);
    }

    public processCapturedFigure(captured_figure: ChessFigure){
        const new_pos = ChessState.getOffBoardPosition(captured_figure);
        captured_figure.updatePosition(new_pos);
    }


    // ************************************************************************
    // HELPER METHODS
    // ************************************************************************
    /**
     * Uses the chess logic to determine possible moves for this figure
     */
    private getPlayableFields(moves: Array<Move>): Array<ChessField> {
        let playable_fields = [];
        // TODO make flagged moves different colors
        moves.forEach(m => {
            const playable_field = this.board.fields.find(f => f.id === m.to);
            playable_fields.push(playable_field);
        })

        return playable_fields;
    }

    private isOwnFigure(fig: ChessFigure): boolean {
        return fig.color === this.current_player.color;
    }


    private getMove(field: ChessField): Move {
        return this.moves.find(m => m.to === field.id)
    }

    private getMoveTargets(): Array<string> {
        let move_targets = [];
        this.moves.forEach(m => {
            move_targets.push(m.to);
        })
        return move_targets;
    }

    private resetMoveProperties(): void {
        this.moves = [];
        this.selected_field = null;
    }

    private makePhysicalMove(move: Move, fig_to_move: ChessFigure): void {
        // Capture case
        if(ChessState.isCapture(move)){
            let captured_fig = this.board.getField(move.to).figure;
            captured_fig.capture();
        }
        // Animate
        Action.makeMove(fig_to_move.mesh, fig_to_move.pos.scene_pos, Position.convertToScenePos(move.to, "figure"));

        // Rochade/Castling case
        if(ChessState.isCastling(move)){
            const castling = this.getCastlingInfo(move);
            console.log(castling['rook']);
            Action.makeMove(castling['rook'].mesh, castling['from'].position.scene_pos, castling['to'].position.scene_pos);
        }
    }

    private makeLogicalMove(move: Move, fig_to_move: ChessFigure): void {
        // Inform Chess.ts logic about move
        this.logic.move({from: move.from.toLowerCase(), to: move.to.toLowerCase()});
        console.log(this.logic.ascii());

        // Refresh Project Figure
        fig_to_move.pos = new Position(move.to, "figure");

        // Refresh Project fields
        this.board.getField(move.from).figure = null;
        this.board.getField(move.to).figure = fig_to_move;

        // Rochade/Castling case
        if(ChessState.isCastling(move)) {
            const castling = this.getCastlingInfo(move);

            // Refresh Project Rook
            castling['rook'].pos = castling['to'].position;

            // Refresh Project fields
            castling['from'].figure = null;
            castling['to'].figure = castling['rook'];
        }
    }

    private passToNextPlayer(): void{
        if(this.current_player.color === "w"){
            this.current_player = this.black;
        }else{
            this.current_player = this.white;
        }
    }

    private static toUpperNotation(moves: Array<Move>): Array<Move> {
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

    private static isCapture(move: Move){
        return move.flags.includes("C") || move.flags.includes("E");
    }

    private static isCastling(move: Move){
        return move.flags.includes("K") || move.flags.includes("Q");
    }

    private static getOffBoardPosition(fig: ChessFigure){
            const pos_add = fig.color === "w" ? 5 : -5

            const x = fig.original_position.scene_pos.z + pos_add;
            const y = 24.95;
            const z = -fig.original_position.scene_pos.x;

        return new BABYLON.Vector3(x,y,z);
    }

    private getCastlingInfo(move: Move): object{
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