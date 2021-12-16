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

    /**
     * The connection to the server will be initiated as first action
     */
    constructor() {
        this.connection = new Connection(this);
    }

    /**
     * Sets up the logical base for the game
     * @param own_color
     */
    public initiateGame(own_color: "white" | "black"){
        this.game = new Game(own_color, this);
    }

    /**
     * Hides the GameMenu, shows the wait for other player loading screen and makes the player ready
     * @param data
     */
    public async makeGameReady(data: IPlayerData):Promise<void>{
        this.game.dom.hidePanel(this.game.dom.game_menu);
        this.game.dom.displayMessage("Waiting for the other player ...", "important");
        this.game.setupPlayerReady(data).then(() => console.log(`Player ${data.color} ready!`));
    }

    /**
     * Starts the game by hiding the loading screen and starting the game in Game class
     * @param data
     */
    public async startGame(data: Array<IPlayerData>): Promise<void> {
        await this.game.startChessGame(data[0], data[1]);
        this.game.dom.hideScreen(this.game.dom.message_screen);
    }
}

// MAIN
new App();