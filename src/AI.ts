import {Move} from "chess.ts";
import {ChessState} from "./ChessState";

/**
 * AI manages all AI related movements
 */
export class AI {
    get chess_state(): ChessState {
        return this._chess_state;
    }

    set chess_state(value: ChessState) {
        this._chess_state = value;
    }

    private _chess_state: ChessState;

    constructor(board: ChessState) {
        this.chess_state = board;
    }

    /**
     * Gets random available move
     */
    public getRandomMove(): Move {
        const available_moves = ChessState.toUpperNotation(this.chess_state.logic.moves({verbose: true}));

        return available_moves[Math.floor(Math.random() * available_moves.length)];
    }
}