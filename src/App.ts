import Game from "./Game";
import {Connection} from "./Connection";

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

    private _connection: any;
    private _game: Game;

    constructor() {
        this.game = new Game();
        this.connection = new Connection(this);
    }

    public startGame(): void {
        this.game.initiate().then(() => {
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
app.connection.socket.on("start", () => app.startGame());