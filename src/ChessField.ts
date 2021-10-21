import * as BABYLON from "@babylonjs/core";
import {ChessFigure} from "./ChessFigure";
import {ChessBoard} from "./ChessBoard";

export class ChessField {
    public id: string;
    public pos: BABYLON.Vector3;
    public fig: ChessFigure | null;
    public mesh: BABYLON.AbstractMesh;
    public is_selected: boolean;
    public is_playable: boolean;

    /**
     * Constructs a Chess field
     * @param id
     * @param pos
     * @param fig
     * @param mesh
     * @param is_selected
     * @param is_playable
     */
    constructor(id: string, pos: BABYLON.Vector3, fig: ChessFigure | null, mesh: BABYLON.AbstractMesh, is_selected: boolean, is_playable) {
        this.id = id;
        this.pos = pos;
        this.fig = fig;
        this.mesh = mesh;
        this.is_selected = is_selected;
        this.is_playable = is_playable;
    }

    /**
     * Gets the figure if any on the given field
     * @param field_pos
     * @param figures
     */
    public static getFigureOnField(field_pos: BABYLON.Vector3, figures: Array<ChessFigure>): ChessFigure | null {
        figures.forEach(fig => {
            const same_x = fig.pos.x === field_pos.x;
            const same_z = fig.pos.z === field_pos.z;

            if (same_x && same_z) {
                return fig;
            }
        })
        return null;
    }

    /**
     * Gets the original material of the given field
     * @param scene
     */
    public getOriginalMaterial(scene: BABYLON.Scene): BABYLON.Material {
        const white_fields = ChessBoard.getFieldsPos("white");

        if (white_fields.includes(this.id)) {
            return scene.materials.find(m => m.id === "white_field");
        } else {
            return scene.materials.find(m => m.id === "black_field");
        }
    }

    /**
     * Resets the selected fields by setting is_selected false and reinstalling the original texture
     * @param scene for retrieving the original material
     */
    public async resetField(scene): Promise<void> {
        this.is_selected = false;
        this.mesh.material = this.getOriginalMaterial(scene);
    }

    /**
     * Sets the field to the given material
     * @param material
     */
    public setField(material: BABYLON.Material){
        this.is_selected = true;
        this.mesh.material = material;
    }

    /**
     * Sets up the hover-on functionality to change to the given material
     * @param hover_material
     */
    public setupHoverOn(hover_material: BABYLON.Material): void {
        this.mesh.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, () => {
                this.mesh.material = hover_material;
            }));
    }

    /**
     * Sets up the hover-out functionality which resets to the previous state (selected|unselected)
     * @param selection_material
     * @param ori_material
     */
    public setupHoverOut(selection_material: BABYLON.Material, ori_material: BABYLON.Material): void {
        this.mesh.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, () => {
                this.mesh.material = this.is_selected ? selection_material : ori_material;
            }));
    }

    /**
     * Sets up the selection of a field
     * @param chessboard for retrieving the currentyl selected field
     * @param selection_material material to set the newly selected field
     * @param scene For retrieving information for the reset to original material
     */
    public setupSelection(chessboard: ChessBoard, selection_material: BABYLON.Material, scene: BABYLON.Scene): void {
        this.mesh.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickDownTrigger, () => {
                let selected_field = chessboard.getSelectedField();

                if (selected_field !== null) {
                    selected_field.resetField(scene).then(() => {
                        this.setField(selection_material)
                    })
                }else{
                    this.setField(selection_material)
                }
            }));
    }
}