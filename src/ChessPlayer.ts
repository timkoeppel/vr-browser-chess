import {AI} from "./AI";
import {ChessState} from "./ChessState";

/**
 * Manages the player
 */
export class ChessPlayer {
    get state(): ChessState {
        return this._state;
    }

    set state(value: ChessState) {
        this._state = value;
    }

    get ai(): AI | null {
        return this._ai;
    }

    set ai(value: AI | null) {
        this._ai = value;
    }

    get human(): boolean {
        return this._human;
    }

    set human(value: boolean) {
        this._human = value;
    }

    get color(): string {
        return this._color;
    }

    set color(value: string) {
        this._color = value;
    }

    private _human: boolean;
    private _color: string;
    private _state: ChessState;
    private _ai: AI | null;

    constructor(human: boolean, color: string, state: ChessState) {
        this.human = human;
        this.color = color;
        this.state = state;
        this.ai = human ? null : new AI(this.state);
    }

}