import * as BABYLON from "@babylonjs/core";
import {Position} from "./Position";
import {ChessBoard} from "./ChessBoard";

export class ChessFigure {
    get original_position(): Position {
        return this._original_position;
    }

    set original_position(value: Position) {
        this._original_position = value;
    }
    get board(): ChessBoard {
        return this._board;
    }

    set board(value: ChessBoard) {
        this._board = value;
    }
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
    private _original_position: Position;
    private _mesh: BABYLON.AbstractMesh;
    private _color: string; // ("b" | "w")
    private _on_field: boolean;
    private _board: ChessBoard;


    constructor(id: string, pos: Position, mesh: BABYLON.AbstractMesh, side: string, on_field: boolean, board: ChessBoard) {
        this.id = id;
        this.pos = pos;
        this.original_position = pos;
        this.mesh = mesh;
        this.color = side;
        this.on_field = on_field;
        this.board = board;
    }

    // ************************************************************************
    // MAIN METHODS
    // ************************************************************************

    /**
     * Extracts the figures from a mesh import
     * @param meshes The (imported) meshes to be extracted from
     * @param board
     */
    public static extractFigures(meshes: Array<BABYLON.AbstractMesh>, board: ChessBoard): Array<ChessFigure> {
        // FIGURES
        let figures = [];
        const figure_meshes: Array<BABYLON.AbstractMesh> = meshes.filter(m => m.id.includes("fig"));

        figure_meshes.forEach(mesh => {
            figures.push(
                new ChessFigure(mesh.id, new Position(mesh.position, "figure"), mesh, this.getColor(mesh), true, board)
            );
        });

        return figures;
    }

    public capture(){
        this.on_field = false;
        this.board.state.processCapturedFigure(this);
        //this.pos = new Position(new BABYLON.Vector3(0,0,0)); // TODO to the side
        //this.mesh.position = this.pos.scene_pos;
    }

    public updatePosition(scene_pos: BABYLON.Vector3){
        this.pos = new Position(scene_pos);
        this.mesh.position = this.pos.scene_pos;
    }

    // ************************************************************************
    // HELPER METHODS
    // ************************************************************************
    private static getColor(mesh: BABYLON.AbstractMesh): string{
        return mesh.id.slice(-2, -1);
    }

}