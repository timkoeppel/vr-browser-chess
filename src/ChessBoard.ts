import * as BABYLON from "@babylonjs/core";
import {ChessField} from "./ChessField";
import {ChessFigure} from "./ChessFigure";

export class ChessBoard {
    public figures: Array<ChessFigure>;
    public fields: Array<ChessField>;

    constructor(meshes: Array<BABYLON.AbstractMesh>) {
        // FIGURES
        let figures = [];
        const chess_figures: Array<BABYLON.AbstractMesh> = meshes.filter(m => m.id.includes("fig"));
        chess_figures.forEach(fig => {
            figures.push(new ChessFigure(fig.id, fig.position, fig));
        });

        // FIELDS
        let fields = [];
        const chess_fields: Array<BABYLON.AbstractMesh> = meshes.filter(m => m.id.length === 2);
        chess_fields.forEach(field => {
            const fig = ChessField.getFigureOnField(field.position, figures);
            fields.push(new ChessField(field.id, field.position, fig, field, false, false));
        })

        this.figures = figures;
        this.fields = fields;
    }

    public getSelectedField(): ChessField | null{
        let result = null;

        this.fields.forEach(field => {
            if(field.is_selected){
                result = field;
            }
        })
        return result;
    }

    public async resetSelectedField(scene): Promise<void>{
        let selected_field = this.getSelectedField();

        if (selected_field != null) {
            selected_field.is_selected = false;
            selected_field.mesh.material = selected_field.getOriginalMaterial(scene);
        }
    }

    public static getFieldsPos(color: string): Array<string>{
        let fields_pos = [];
        const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
        const add = color === "black" ? 1 : 0;

        for (let i = 0; i < letters.length; i++) {
            let pos = (i % 2) + add;
            for (pos; pos <= 8; pos = pos + 2) {
                let res = letters[i] + (pos);
                if(!res.includes("0")){
                    fields_pos.push(res);
                }
            }
        }
        return fields_pos;
    }
}