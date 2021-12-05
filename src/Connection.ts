import {App} from "./App";
import {IPlayerData} from "./IPlayerData";

export class Connection{
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
        this.socket.on("initiate", (own_color: "white" |"black") => this.app.initiateGame(own_color));
        this.socket.on("redirect", (location: string) => this.app.game.dom.lobbyFullRedirect(location));
        this.socket.on("start", (data: Array<IPlayerData>) => this.app.startGame(data));
        this.socket.on("other player move", (data) => this.app.game.chessboard.state.makeOtherPlayerMove(data));
    }

    // EMISSIONS
    public emitPlayerData(data: IPlayerData){
        this.socket.emit("player_ready", data);
    }

    public emitPlayerMove(data){
        this.socket.emit("player move", data)
    }

}