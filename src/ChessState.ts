import {ChessFigure} from "./ChessFigure";
import {ChessField} from "./ChessField";
import {Chess, Move} from "chess.ts";
import {ChessPlayer} from "./ChessPlayer";
import {ChessBoard} from "./ChessBoard";

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
    private _moves: Array<Move> | null;
    private _board: ChessBoard;

    constructor(board: ChessBoard) {
        this.logic = new Chess();
        this.white = new ChessPlayer("w");
        this.black = new ChessPlayer("b");
        this.current_player = this.white;
        this.selected_field = null;
        this.moves = [];
        this.board = board;
    }

    public processClick(clicked_field: ChessField) {
        // Field with figure
        this.board.resetFieldsMaterial().then(() => {
            if (clicked_field.fig !== null) {
                // Own figure --> Select this figure
                if (this.isOwnFigure(clicked_field.fig)) {
                    this.toMoveSelection(clicked_field)
                }
                // Beatable enemy figure --> Make (beat) move
                else if (this.isPartOfMove(clicked_field)){
                    this.makeMove(this.getMove(clicked_field))
                }
            }
            // Field without figure
            else {
                // Playable Field --> Make move
                if(this.isPartOfMove(clicked_field)){
                    this.makeMove(this.getMove(clicked_field))
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

    public makeMove(move: Move): void {
        // Inform logic about move
        this.logic.move({from: move.from, to: move.to});

        // Reset state
        // TODO

        // Animate
        console.log(move);
    }

    /**
     * Uses the chess logic to determine possible moves for this figure
     */
    public getPlayableFields(moves: Array<Move>): Array<ChessField> {
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

    public isPartOfMove(field: ChessField): boolean{
        const move_targets = this.getMoveTargets();

        return move_targets.includes(field.id);
    }

    private getMove(field: ChessField): Move{
        return this.moves.find(m => m.to === field.id)
    }

    private getMoveTargets(): Array<string>{
        let move_targets = [];
        this.moves.forEach( m => {
            move_targets.push(m.to);
        })
        return move_targets;
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

}