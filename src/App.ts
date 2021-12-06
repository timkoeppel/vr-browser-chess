import Game from "./Game";
import {Connection} from "./Connection";
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

    public async makeGameReady(data: IPlayerData):Promise<void>{
        this.game.dom.hideGameMenu();
        this.game.setupPlayerReady(data).then(() => console.log(`Player ${data.color} ready!`));
    }

    public async startGame(data: Array<IPlayerData>): Promise<void> {
        console.log("Data received:", data);
        await this.game.startChessGame(data[0], data[1]);
    }
}

// MAIN
new App();