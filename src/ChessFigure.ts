import * as BABYLON from "@babylonjs/core";
import {Position} from "./Position";

export class ChessFigure {
    get on_field(): boolean {
        return this._on_field;
    }

    set on_field(value: boolean) {
        this._on_field = value;
    }
    get color(): string {
        return this._color;
    }

    set color(value: string) {
        this._color = value;
    }
    get mesh(): BABYLON.AbstractMesh {
        return this._mesh;
    }

    set mesh(value: BABYLON.AbstractMesh) {
        this._mesh = value;
    }
    get pos(): Position {
        return this._pos;
    }

    set pos(value: Position) {
        this._pos = value;
    }
    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }
    private _id: string;
    private _pos: Position;
    private _mesh: BABYLON.AbstractMesh;
    private _color: string; // ("b" | "w")
    private _on_field: boolean;


    constructor(id: string, pos: Position, mesh: BABYLON.AbstractMesh, side: string, on_field: boolean) {
        this.id = id;
        this.pos = pos;
        this.mesh = mesh;
        this.color = side;
        this.on_field = on_field;
    }

    // ************************************************************************
    // MAIN METHODS
    // ************************************************************************

    /**
     * Extracts the figures from a mesh import
     * @param meshes The (imported) meshes to be extracted from
     */
    public static extractFigures(meshes: Array<BABYLON.AbstractMesh>): Array<ChessFigure> {
        // FIGURES
        let figures = [];
        const figure_meshes: Array<BABYLON.AbstractMesh> = meshes.filter(m => m.id.includes("fig"));

        figure_meshes.forEach(mesh => {
            figures.push(
                new ChessFigure(mesh.id, new Position(mesh.position, "figure"), mesh, this.getColor(mesh), true));
        });

        return figures;
    }

    public capture(){
        this.on_field = false;
        this.pos = new Position(new BABYLON.Vector3(0,0,0)); // TODO to the side
        this.mesh.position = this.pos.scene_pos;
    }

    // ************************************************************************
    // HELPER METHODS
    // ************************************************************************
    private static getColor(mesh: BABYLON.AbstractMesh): string{
        return mesh.id.slice(-2, -1);
    }

}