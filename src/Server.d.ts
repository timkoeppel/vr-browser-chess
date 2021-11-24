/// <reference types="node" />
import * as express from 'express';
import * as https from 'https';
export declare class Server {
    get ssl(): https.ServerOptions;
    set ssl(value: https.ServerOptions);
    get port(): number;
    set port(value: number);
    get application(): express.Application;
    set application(value: express.Application);
    private _port;
    private _application;
    private _ssl;
    constructor();
    initiate(): void;
}
