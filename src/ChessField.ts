import * as BABYLON from "@babylonjs/core";
import {ChessFigure} from "./ChessFigure";
import {ChessBoard} from "./ChessBoard";
import {Position} from "./Position";

/**
 * ChessField manages all aspects bound to a single chess field
 */
export class ChessField {
    get board(): ChessBoard {
        return this._board;
    }

    set board(value: ChessBoard) {
        this._board = value;
    }

    get original_material(): BABYLON.Material {
        return this._original_material;
    }

    set original_material(value: BABYLON.Material) {
        this._original_material = value;
    }

    get mesh(): BABYLON.AbstractMesh {
        return this._mesh;
    }

    set mesh(value: BABYLON.AbstractMesh) {
        this._mesh = value;
    }

    get figure(): ChessFigure | null {
        return this._figure;
    }

    set figure(value: ChessFigure | null) {
        this._figure = value;
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
    private _figure: ChessFigure | null;
    private _mesh: BABYLON.AbstractMesh;
    private _board: ChessBoard;
    private _original_material: BABYLON.Material;

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
    constructor(id: string, pos: Position, fig: ChessFigure | null, mesh: BABYLON.AbstractMesh, board: ChessBoard, ori_material: BABYLON.Material, scene: BABYLON.Scene) {
        this.id = id;
        this.position = pos;
        this.figure = fig;
        this.mesh = mesh;
        this.board = board;
        this.original_material = ori_material;
    }

    /**
     * Resets the selected fields by setting is_selected false and reinstalling the original texture
     */
    public async resetFieldMaterial(): Promise<void> {
        this.mesh.material = this.original_material;
        this.mesh.disableEdgesRendering();
    }

    // ************************************************************************
    // HELPER METHODS
    // ************************************************************************
    /**
     * Checks id the given field is selected by communicating with the ChessState
     * @private
     */
    public isSelected() {
        let result = false;
        if (this.board.state.selected_field !== null) {
            result = this.id === this.board.state.selected_field.id;
        }
        return result;
    }

}