import {Move} from "chess.ts";
import {ChessState} from "./ChessState";

/**
 * AI manages all AI related movements
 */
export class AI {
    get difficulty(): "easy" | "advanced" | "expert" {
        return this._difficulty;
    }

    set difficulty(value: "easy" | "advanced" | "expert") {
        this._difficulty = value;
    }
    get chess_state(): ChessState {
        return this._chess_state;
    }

    set chess_state(value: ChessState) {
        this._chess_state = value;
    }

    private _chess_state: ChessState;
    private _difficulty: "easy" | "advanced" | "expert";

    constructor(board: ChessState, difficulty: "easy" | "advanced" | "expert") {
        this.chess_state = board;
        this.difficulty = difficulty;
    }


    public getMove(): Move {
        switch(this.difficulty){
            case "easy":
                return this.getRandomMove();
            case "advanced":
                return this.getAlphaBetaMove();
            case "expert":
                return this.getExpertAIMove();
        }
    }

    /**
     * Gets random available move
     */
    private getRandomMove(): Move {
        const available_moves = ChessState.toUpperNotation(this.chess_state.logic.moves({verbose: true}));

        return available_moves[Math.floor(Math.random() * available_moves.length)];
    }

    private getAlphaBetaMove(): Move {
        // TODO
        return  null
    }

    private getExpertAIMove(): Move {
        // TODO
        return null
    }
}