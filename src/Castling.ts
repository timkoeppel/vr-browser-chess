import {ChessFigure} from "./ChessFigure";
import {ChessField} from "./ChessField";

interface Castling {
    rook: ChessFigure;
    from: ChessField;
    to: ChessField
}

/**
 * Interface for all the relevant player data
 */
export class ICastling implements Castling {
    public rook: ChessFigure;
    public from: ChessField;
    public to: ChessField;

    constructor(rook: ChessFigure, from: ChessField, to: ChessField) {
        this.rook = rook;
        this.from = from;
        this.to = to;
    }
}