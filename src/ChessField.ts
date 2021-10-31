import * as BABYLON from "@babylonjs/core";
import {ChessFigure} from "./ChessFigure";
import {ChessBoard} from "./ChessBoard";
import {Position} from "./Position";

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

    get playable_material(): BABYLON.Material {
        return this._playable_material;
    }

    set playable_material(value: BABYLON.Material) {
        this._playable_material = value;
    }

    get selection_material(): BABYLON.Material {
        return this._selection_material;
    }

    set selection_material(value: BABYLON.Material) {
        this._selection_material = value;
    }

    get hover_material(): BABYLON.Material {
        return this._hover_material;
    }

    set hover_material(value: BABYLON.Material) {
        this._hover_material = value;
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
    private _hover_material: BABYLON.Material;
    private _selection_material: BABYLON.Material;
    private _playable_material: BABYLON.Material;

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

        // Materials
        let selection_material = new BABYLON.StandardMaterial("selection_material", scene);
        selection_material.diffuseColor = new BABYLON.Color3(0.1, 0, 1);

        let hover_material = new BABYLON.StandardMaterial("hover_material", scene);
        hover_material.diffuseColor = new BABYLON.Color3(0.5, 0.6, 1);

        let playable_material = new BABYLON.StandardMaterial("playable_material", scene);
        playable_material.diffuseColor = new BABYLON.Color3(0.5, 1, 0.5);


        this.original_material = ori_material;
        this.hover_material = hover_material;
        this.selection_material = selection_material;
        this.playable_material = playable_material;
    }

    /**
     * Resets the selected fields by setting is_selected false and reinstalling the original texture
     */
    public async resetFieldMaterial(): Promise<void> {
        this.mesh.material = this.original_material;
        this.mesh.disableEdgesRendering();
    }

    /**
     * Sets up the hover-on functionality to change to the given material
     */
    public setupHoverOn(): void {
        this.mesh.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, () => {
                this.mesh.material = this.hover_material;
            }));
    }

    /**
     * Sets up the hover-out functionality which resets to the previous state
     */
    public setupHoverOut(): void {
        this.mesh.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, () => {
                if (this.isSelected()) {
                    this.mesh.material = this.selection_material;
                } else if (this.board.state.isPartOfMove(this)) {
                    this.mesh.material = this.playable_material;
                } else {
                    this.mesh.material = this.original_material;
                }
            }));
    }

    /**
     * Sets up the selection of a field
     * @param scene For retrieving information for the reset to original material
     */
    public setupSelection(scene: BABYLON.Scene): void {
        this.mesh.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickDownTrigger, () => {
                this.board.state.processClick(this);
            }));
    }

    /**
     * Sets the field to the given material
     */
    public setFieldAsSelected(): void {
        this.mesh.material = this.selection_material;
    }

    /**
     * Sets field as playable and its logical consequences
     * @private
     * @param playable_moves
     */
    public setFieldsAsPlayable(playable_moves: Array<ChessField>): void {
        playable_moves.forEach(field => {
            field.mesh.material = this.playable_material;
            field.mesh.edgesWidth = 10;
            field.mesh.edgesColor = new BABYLON.Color4(0.5, 0.5, 0.5, 1);
            field.mesh.enableEdgesRendering();
        })
    }

    // ************************************************************************
    // HELPER METHODS
    // ************************************************************************
    private isSelected() {
        let result = false;
        if(this.board.state.selected_field !== null){
            result = this.id === this.board.state.selected_field.id;
        }
        return result;
    }

}