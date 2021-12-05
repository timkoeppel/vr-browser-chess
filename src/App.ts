import Game from "./Game";
import {Connection} from "./Connection";
import {DOM} from "./DOM";
import {IPlayerData} from "./IPlayerData";

/**
 * App is the main module
 */
export class App {
    get game(): Game {
        return this._game;
    }

    set game(value: Game) {
        this._game = value;
    }

    get connection(): any {
        return this._connection;
    }

    set connection(value: any) {
        this._connection = value;
    }

    private _connection: Connection;
    private _game: Game;

    constructor() {
        this.connection = new Connection(this);
    }

    public initiateGame(own_color: "white" | "black"){
        this.game = new Game(own_color, this);
    }

    public startGame(data: Array<IPlayerData>): void {
        //this.dom.switchToGameScreen();

    }
}

// MAIN
new App();