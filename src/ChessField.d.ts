import * as BABYLON from "@babylonjs/core";
import { ChessFigure } from "./ChessFigure";
import { ChessBoard } from "./ChessBoard";
import { Position } from "./Position";
/**
 * ChessField manages all aspects bound to a single chess field
 */
export declare class ChessField {
    get board(): ChessBoard;
    set board(value: ChessBoard);
    get original_material(): BABYLON.Material;
    set original_material(value: BABYLON.Material);
    get mesh(): BABYLON.AbstractMesh;
    set mesh(value: BABYLON.AbstractMesh);
    get figure(): ChessFigure | null;
    set figure(value: ChessFigure | null);
    get position(): Position;
    set position(value: Position);
    get id(): string;
    set id(value: string);
    private _id;
    private _position;
    private _figure;
    private _mesh;
    private _board;
    private _original_material;
    /**
     * Constructs a Chess field
     * @param id
     * @param pos
     * @param fig
     * @param mesh
     * @param board
     * @param ori_material
     * @param scene
     */
    constructor(id: string, pos: Position, fig: ChessFigure | null, mesh: BABYLON.AbstractMesh, board: ChessBoard, ori_material: BABYLON.Material, scene: BABYLON.Scene);
    /**
     * Resets the selected fields by setting is_selected false and reinstalling the original texture
     */
    resetFieldMaterial(): Promise<void>;
    /**
     * Checks id the given field is selected by communicating with the ChessState
     * @private
     */
    isSelected(): boolean;
}
