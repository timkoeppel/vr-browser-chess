import {ChessFigure} from "./ChessFigure";

export class ChessPlayer {
    get score(): number {
        return this._score;
    }

    set score(value: number) {
        this._score = value;
    }

    get color(): string {
        return this._color;
    }

    set color(value: string) {
        this._color = value;
    }

    private _color: string;
    private _score: number;

    constructor(color: string) {
        this.color = color;
        this.score = 0;
    }
}