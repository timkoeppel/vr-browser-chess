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

    get color(): "white" | "black" {
        return this._color;
    }

    set color(value: "white" | "black") {
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
    private _color: "white" | "black";
    private _on_field: boolean;
    private _board: ChessBoard;


    constructor(id: string, pos: Position, mesh: BABYLON.AbstractMesh, color: "white" | "black", on_field: boolean, board: ChessBoard) {
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
            const color = this.getColor(mesh);
            const color_abbr = color.charAt(0);
            const is_not_on_field = mesh.id.includes(`fig_queen_${color_abbr}`) && mesh.id !== `fig_queen_${color_abbr}1`;

            figures.push(
                new ChessFigure(
                    mesh.id,
                    new Position(mesh.position, "figure"),
                    mesh,
                    color,
                    !is_not_on_field,
                    board
                )
            );
        });

        return figures;
    }

    /**
     * removes this figure from the physical field to the global origin (hidden in table)
     */
    public removeFromField(){
        this.position = new Position(BABYLON.Vector3.Zero());
        this.mesh.position = BABYLON.Vector3.Zero();
        this.on_field = false;
    }

    /**
     * Adds the figure to the table to the given position
     * @param target_pos
     */
    public addToField(target_pos){
        this.on_field = true;
        this.position = target_pos;
        this.board.getField(this.position.chess_pos).figure = this;
        this.mesh.position = target_pos.scene_pos;
    }

    // ************************************************************************
    // HELPER METHODS
    // ************************************************************************

    /**
     * Gets the color of a figure mesh (second last character)
     * @param mesh
     * @private
     */
    private static getColor(mesh: BABYLON.AbstractMesh): "white" | "black" {
        const color_short = <"b" | "w">mesh.id.slice(-2, -1);
        return color_short === "w" ? "white" : "black";
    }
}