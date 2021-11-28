import Game from "./Game";
import {Connection} from "./Connection";
import {DOM} from "./DOM";
import {IPlayerData} from "./IPlayerData";

/**
 * App is the main module
 */
export class App {
    get dom(): DOM {
        return this._dom;
    }

    set dom(value: DOM) {
        this._dom = value;
    }
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

    private _connection: any;
    private _game: Game;
    private _dom: DOM;

    constructor() {
        this.game = new Game(this);
        this.connection = new Connection(this);
        this.dom = new DOM(this);
    }

    public startGame(data: Array<IPlayerData>): void {
        this.dom.switchToGameScreen();
        this.game.initiate(data).then(() => {
                console.log(this);
                this.game.DoRender(false);
            }
        ).catch(error => {
            console.log(error)
        })
    }
}

// MAIN
let app = new App();
app.connection.socket.on("redirect", (location) => {
    alert("Lobby is full!");
    window.location.href = location
});
app.connection.socket.on("start", (data: Array<IPlayerData>) => app.startGame(data));
app.connection.socket.on("player change out", (data: IPlayerData) => {app.dom.refreshPlayerTwo(data); console.log(data)});
app.connection.socket.on("player info request", () => app.dom.emitPlayerChange());
app.connection.socket.on("other player move", (data) => app.game.chessboard.state.makeOtherPlayerMove(data));