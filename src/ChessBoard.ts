import * as BABYLON from "@babylonjs/core";
import {ChessField} from "./ChessField";
import {ChessFigure} from "./ChessFigure";

export class ChessBoard {
    public figures: Array<ChessFigure>;
    public fields: Array<ChessField>;

    /**
     * Constructs a complex chessboard with its figures from the meshes
     * @param meshes
     */
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

    /**
     * Gets the Chessfield which is selected
     * @return null when there was no field selected previously
     */
    public getSelectedField(): ChessField | null {
        let result = null;

        this.fields.forEach(field => {
            if (field.is_selected) {
                result = field;
            }
        })
        return result;
    }

    /**
     * Gets all chess style positions of either black or white
     * @param player_side
     */
    public static getFieldsPos(player_side: string): Array<string> {
        let fields_pos = [];
        const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
        const add = player_side === "black" ? 1 : 0;

        for (let i = 0; i < letters.length; i++) {
            let pos = (i % 2) + add;
            for (pos; pos <= 8; pos = pos + 2) {
                let res = letters[i] + (pos);
                if (!res.includes("0")) {
                    fields_pos.push(res);
                }
            }
        }
        return fields_pos;
    }

    /**
     * Makes figure unpickable so that you can gaze "through" them
     */
    public makeFiguresUnpickable(): void{
        this.figures.forEach(fig => {
            fig.mesh.isPickable = false;
        });
    }
}