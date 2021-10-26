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

    get is_selected(): boolean {
        return this._is_selected;
    }

    set is_selected(value: boolean) {
        this._is_selected = value;
    }

    get is_playable(): boolean {
        return this._is_playable;
    }

    set is_playable(value: boolean) {
        this._is_playable = value;
    }

    get mesh(): BABYLON.AbstractMesh {
        return this._mesh;
    }

    set mesh(value: BABYLON.AbstractMesh) {
        this._mesh = value;
    }

    get fig(): ChessFigure | null {
        return this._fig;
    }

    set fig(value: ChessFigure | null) {
        this._fig = value;
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
    private _fig: ChessFigure | null;
    private _mesh: BABYLON.AbstractMesh;
    private _board: ChessBoard;
    private _original_material: BABYLON.Material;
    private _hover_material: BABYLON.Material;
    private _selection_material: BABYLON.Material;
    private _playable_material: BABYLON.Material;
    private _is_selected: boolean;
    private _is_playable: boolean;

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
        this.pos = pos;
        this.fig = fig;
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

        this.is_selected = false;
        this.is_playable = false;
    }

    /**
     * Gets the figure if any on the given field
     * @param field_pos
     * @param figures
     */
    public static getFigureOnField(field_pos: BABYLON.Vector3, figures: Array<ChessFigure>): ChessFigure | null {
        figures.forEach(fig => {
            const same_x = fig.pos.scene_pos.x === field_pos.x;
            const same_z = fig.pos.scene_pos.z === field_pos.z;

            if (same_x && same_z) {
                return fig;
            }
        })
        return null;
    }

    /**
     * Resets the selected fields by setting is_selected false and reinstalling the original texture
     */
    public async resetField(): Promise<void> {
        this.is_selected = false;
        this.is_playable = false;
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
                if(this.is_selected){
                    this.mesh.material = this.selection_material;
                }else if (this.is_playable){
                    this.mesh.material = this.playable_material;
                }else{
                    this.mesh.material = this.original_material;
                }
            }));
    }

    /**
     * Sets up the selection of a field
     * @param chessboard for retrieving the currently selected field
     * @param scene For retrieving information for the reset to original material
     */
    public setupSelection(chessboard: ChessBoard, scene: BABYLON.Scene): void {
        this.mesh.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickDownTrigger, () => {
                let selected_field = chessboard.getSelectedField();

                // If there was a previously selected field -> reset
                if (selected_field !== null) {
                    chessboard.resetFieldMaterial().then(() => {
                        this.setSelected();
                    })
                } else {
                    this.setSelected();
                }
                console.log(this.id);
            }));
    }

    public setSelected(){
        this.setFieldAsSelected()
        this.setFieldsAsPlayable(this.board.getPlayableFields(this.id));
    }
    // ************************************************************************
    // HELPER METHODS
    // ************************************************************************

    /**
     * Sets the field to the given material
     */
    private setFieldAsSelected(): void{
        this.is_selected = true;
        this.mesh.material = this.selection_material;
    }

    private setFieldsAsPlayable(fields: Array<ChessField>):void {
        fields.forEach(field => {
            field.is_playable = true;
            field.mesh.material = this.playable_material;

            // Edge coloring for distinction
            field.mesh.edgesWidth = 10;
            field.mesh.edgesColor = new BABYLON.Color4(0.5,0.5,0.5, 1);
            field.mesh.enableEdgesRendering();
        })
    }
}