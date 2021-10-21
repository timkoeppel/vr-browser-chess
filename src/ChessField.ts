import * as BABYLON from "@babylonjs/core";
import {ChessFigure} from "./ChessFigure";
import {ChessBoard} from "./ChessBoard";

export class ChessField{
    public id: string;
    public pos: BABYLON.Vector3;
    public fig: ChessFigure | null;
    public mesh: BABYLON.AbstractMesh;
    public is_selected: boolean;
    public is_playable: boolean;

    constructor(id: string, pos: BABYLON.Vector3, fig: ChessFigure | null, mesh: BABYLON.AbstractMesh, is_selected: boolean, is_playable) {
        this.id = id;
        this.pos = pos;
        this.fig = fig;
        this.mesh = mesh;
        this.is_selected = is_selected;
        this.is_playable = is_playable;
    }

    public static getFigureOnField(field_pos: BABYLON.Vector3, figures: Array<ChessFigure>): ChessFigure | null{
        figures.forEach(fig => {
            const same_x = fig.pos.x === field_pos.x;
            const same_z = fig.pos.z === field_pos.z;

            if(same_x && same_z){
                return fig;
            }
        })
        return null;
    }

    public getOriginalMaterial(scene: BABYLON.Scene): BABYLON.Material{
        const white_fields = ChessBoard.getFieldsPos("white");

        if(white_fields.includes(this.id)){
            return scene.materials.find(m => m.id === "white_field");
        } else {
            return scene.materials.find(m => m.id === "black_field");
        }
    }
}