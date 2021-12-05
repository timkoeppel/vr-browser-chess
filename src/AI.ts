import {Move} from "chess.ts";
import {ChessState} from "./ChessState";

/**
 * AI manages all AI related movements
 */
export class AI {
    get difficulty(): "easy" | "intermediate" | "expert" {
        return this._difficulty;
    }

    set difficulty(value: "easy" | "intermediate" | "expert") {
        this._difficulty = value;
    }
    get chess_state(): ChessState {
        return this._chess_state;
    }

    set chess_state(value: ChessState) {
        this._chess_state = value;
    }

    private _chess_state: ChessState;
    private _difficulty: "easy" | "intermediate" | "expert";

    constructor(difficulty: "easy" | "intermediate" | "expert", state: ChessState) {
        this.chess_state = state;
        this.difficulty = difficulty;
    }


    public getMove(): Move {
        switch(this.difficulty){
            case "easy":
                return this.getRandomMove();
            case "intermediate":
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
        let chosen_move = available_moves[Math.floor(Math.random() * available_moves.length)];

        // If capture move
        available_moves.forEach(m => {
           if(ChessState.isCapture(m)){
               chosen_move = m;
           }
        });

        return chosen_move;
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