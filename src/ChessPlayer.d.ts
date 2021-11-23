import { AI } from "./AI";
import { ChessState } from "./ChessState";
/**
 * Manages the player
 */
export declare class ChessPlayer {
    get state(): ChessState;
    set state(value: ChessState);
    get ai(): AI | null;
    set ai(value: AI | null);
    get human(): boolean;
    set human(value: boolean);
    get color(): string;
    set color(value: string);
    private _human;
    private _color;
    private _state;
    private _ai;
    constructor(human: boolean, color: string, state: ChessState);
}
