import * as BABYLON from "@babylonjs/core";
import {Position} from "./Position";
import {ChessBoard} from "./ChessBoard";

/**
 * ChessFigure manages a figure on the field
 */
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

    get color(): "b" | "w" {
        return this._color;
    }

    set color(value: "b" | "w") {
        this._color = value;
    }

    get mesh(): BABYLON.AbstractMesh {
        return this._mesh;
    }

    set mesh(value: BABYLON.AbstractMesh) {
        this._mesh = value;
    }

    get position(): Position {
        return this._position;
    }

    set position(value: Position) {
        this._position = value;
    }

    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    private _id: string;
    private _position: Position;
    private _original_position: Position;
    private _mesh: BABYLON.AbstractMesh;
    private _color: "b" | "w";
    private _on_field: boolean;
    private _board: ChessBoard;


    constructor(id: string, pos: Position, mesh: BABYLON.AbstractMesh, color: "b" | "w", on_field: boolean, board: ChessBoard) {
        this.id = id;
        this.position = pos;
        this.original_position = pos;
        this.mesh = mesh;
        this.color = color;
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

    /**
     * Initializes the capture of the figure
     */
    public capture() {
        this.on_field = false;
        this.board.state.processCapturedFigure(this);
    }

    // ************************************************************************
    // HELPER METHODS
    // ************************************************************************
    /**
     * Gets the color of a figure mesh (second last character)
     * @param mesh
     * @private
     */
    private static getColor(mesh: BABYLON.AbstractMesh): "b" | "w" {
        return <"b" | "w">mesh.id.slice(-2, -1);
    }

}