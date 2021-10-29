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

    public static types = {
        "p": "pawn",
        "r": "rook",
        "n": "knight",
        "b": "bishop",
        "q": "queen",
        "k": "king"
    }

    public static extractFigures(meshes: Array<BABYLON.AbstractMesh>): Array<ChessFigure> {
        // FIGURES
        let figures = [];
        const chess_figures: Array<BABYLON.AbstractMesh> = meshes.filter(m => m.id.includes("fig"));

        chess_figures.forEach(fig => {
            figures.push(new ChessFigure(fig.id, new Position(fig.position, "figure"), fig));
        });

        return figures;
    }

}