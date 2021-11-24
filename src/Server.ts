import * as express from 'express';
import * as https from 'https';
import * as fs from "fs";
import {Request, Response} from "express";
import * as path from "path";

export class Server {
    get ssl(): https.ServerOptions {
        return this._ssl;
    }

    set ssl(value: https.ServerOptions) {
        this._ssl = value;
    }

    get port(): number {
        return this._port;
    }

    set port(value: number) {
        this._port = value;
    }

    get application(): express.Application {
        return this._application;
    }

    set application(value: express.Application) {
        this._application = value;
    }

    private _port: number = 8080;
    private _application: express.Application;
    private _ssl: https.ServerOptions;

    constructor() {
        this.application = express();
        this.application.set("port", this.port);
        this.ssl = {
            key: fs.readFileSync('./key.pem'),
            cert: fs.readFileSync('./cert.pem')
        };
    }

    public initiate() {
        this.application.use(express.static("public"));
        this.application.get("/", (req: Request, res: Response) => {
            res.sendFile(path.join(__dirname, "/index.html"));
        });

        https.createServer(this.ssl, this.application).listen(this.port, () => {
            console.log(`Listening on port ${this.port} ...`);
        });
    }
}

const server = new Server();
server.initiate();

