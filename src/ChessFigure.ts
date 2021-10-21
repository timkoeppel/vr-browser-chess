import * as BABYLON from "@babylonjs/core";

export class ChessFigure {
    public id: string;
    public pos: BABYLON.Vector3;
    public mesh: BABYLON.AbstractMesh;

    constructor(id: string, pos: BABYLON.Vector3, mesh: BABYLON.AbstractMesh) {
        this.id = id;
        this.pos = pos;
        this.mesh = mesh;
    }
}