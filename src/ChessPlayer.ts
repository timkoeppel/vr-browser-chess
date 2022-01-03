import {AI} from "./AI";
import {ChessState} from "./ChessState";
import {Avatar} from "./Avatar";

/**
 * Manages the player
 */
export class ChessPlayer {
    get avatar(): Avatar {
        return this._avatar;
    }

    set avatar(value: Avatar) {
        this._avatar = value;
    }
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
    private _avatar: Avatar;

    constructor(type: "human" | "easy" | "intermediate" | "expert", color: "white" |"black", avatar: Avatar, state: ChessState) {
        this.color = color;
        this.state = state;
        this.avatar = avatar;
        this.type = (type !== "human") ?  new AI(type, color, this.state,) : "human";
    }

}