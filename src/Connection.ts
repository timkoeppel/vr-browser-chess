import {App} from "./App";
import {IPlayerData} from "./IPlayerData";

/**
 * Connection manages the interface to the server via socket connection
 */
export class Connection {
    get app(): App {
        return this._app;
    }

    set app(value: App) {
        this._app = value;
    }

    get socket(): any {
        return this._socket;
    }

    set socket(value: any) {
        this._socket = value;
    }

    private _socket: any;
    private _app: App;

    constructor(app: App) {
        // @ts-ignore
        this.socket = io();
        this.app = app;

        // Initiate Receptions
        this.socket.on("initiate", (own_color: "white" | "black") => this.app.initiateGame(own_color));
        this.socket.on("redirect", (location: string) => this.app.game.dom.lobbyFullRedirect(location));
        this.socket.on("ready", (data: IPlayerData) => this.app.makeGameReady(data));
        this.socket.on("start", (data: Array<IPlayerData>) => this.app.startGame(data));
        this.socket.on("other_player_move", (data) => this.app.game.chessboard.state.makeOtherPlayerMove(data));
        this.socket.on("game_reset", (other_player_color) => this.app.game.dom.refreshThroughOtherPlayerDisconnect(other_player_color));
    }

    // ************************************************************************
    // MAIN METHODS (Emissions)
    // ************************************************************************
    /**
     * Emits the changed player data
     * @param data The player data
     */
    public emitPlayerData(data: IPlayerData) {
        this.socket.emit("player_ready", data);
    }

    /**
     * Emits the move the player has executed
     * @param data
     */
    public emitPlayerMove(data) {
        this.socket.emit("player_move", data)
    }

    public emitFPS(fps_list){
        this.socket.emit("fps", fps_list);
    }
}