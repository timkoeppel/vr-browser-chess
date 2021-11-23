import { Move } from "chess.ts";
import { ChessState } from "./ChessState";
/**
 * AI manages all AI related movements
 */
export declare class AI {
    get difficulty(): "easy" | "advanced" | "expert";
    set difficulty(value: "easy" | "advanced" | "expert");
    get chess_state(): ChessState;
    set chess_state(value: ChessState);
    private _chess_state;
    private _difficulty;
    constructor(state: ChessState, difficulty: "easy" | "advanced" | "expert");
    getMove(): Move;
    /**
     * Gets random available move
     */
    private getRandomMove;
    private getAlphaBetaMove;
    private getExpertAIMove;
}
