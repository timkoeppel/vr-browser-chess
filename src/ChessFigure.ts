import * as BABYLON from "@babylonjs/core";
import {Position} from "./Position";

export class ChessFigure {
    public id: string;
    public pos: Position;
    public mesh: BABYLON.AbstractMesh;

    constructor(id: string, pos: Position, mesh: BABYLON.AbstractMesh) {
        this.id = id;
        this.pos = pos;
        this.mesh = mesh;
    }
}