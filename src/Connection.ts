import {App} from "./App";

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
}