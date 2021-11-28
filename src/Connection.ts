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
    }

    public emitPlayerData(data: IPlayerData){
        this.socket.emit("player change in", data);
    }

    public emitPlayerReadiness(){
        this.socket.emit("player ready")
    }

    public emitPlayerMove(data){
        this.socket.emit("player move", data)
    }

}