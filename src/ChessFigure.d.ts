import * as BABYLON from "@babylonjs/core";
import { Position } from "./Position";
import { ChessBoard } from "./ChessBoard";
/**
 * ChessFigure manages a figure on the field
 */
export declare class ChessFigure {
    get original_position(): Position;
    set original_position(value: Position);
    get board(): ChessBoard;
    set board(value: ChessBoard);
    get on_field(): boolean;
    set on_field(value: boolean);
    get color(): "b" | "w";
    set color(value: "b" | "w");
    get mesh(): BABYLON.AbstractMesh;
    set mesh(value: BABYLON.AbstractMesh);
    get position(): Position;
    set position(value: Position);
    get id(): string;
    set id(value: string);
    private _id;
    private _position;
    private _original_position;
    private _mesh;
    private _color;
    private _on_field;
    private _board;
    constructor(id: string, pos: Position, mesh: BABYLON.AbstractMesh, color: "b" | "w", on_field: boolean, board: ChessBoard);
    /**
     * Extracts the figures from a mesh import
     * @param meshes The (imported) meshes to be extracted from
     * @param board
     */
    static extractFigures(meshes: Array<BABYLON.AbstractMesh>, board: ChessBoard): Array<ChessFigure>;
    /**
     * Initializes the capture of the figure
     */
    capture(): void;
    /**
     * Gets the color of a figure mesh (second last character)
     * @param mesh
     * @private
     */
    private static getColor;
}
