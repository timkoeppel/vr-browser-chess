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

    get type(): "human" | AI {
        return this._type;
    }

    set type(value: "human" | AI) {
        this._type = value;
    }

    get color(): "white" | "black" {
        return this._color;
    }

    set color(value: "white" | "black") {
        this._color = value;
    }

    private _type: "human" | AI;
    private _color: "white" | "black";
    private _state: ChessState;

    constructor(type: "human" | "easy" | "intermediate" | "expert", color: "white" |"black", state: ChessState) {
        if(type !== "human") {
            this.type = new AI(this.state, type);
        }
        this.color = color;
        this.state = state;
    }

}