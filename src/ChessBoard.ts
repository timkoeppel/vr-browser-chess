import * as BABYLON from "@babylonjs/core";
import {ChessField} from "./ChessField";
import {ChessFigure} from "./ChessFigure";
import {Position} from "./Position";
import {Chess} from "chess.ts";

export class ChessBoard {

    get figures(): Array<ChessFigure> {
        return this._figures;
    }

    set figures(value: Array<ChessFigure>) {
        this._figures = value;
    }

    get fields(): Array<ChessField> {
        return this._fields;
    }

    set fields(value: Array<ChessField>) {
        this._fields = value;
    }

    get logic(): Chess {
        return this._logic;
    }

    set logic(value: Chess) {
        this._logic = value;
    }

    private _logic: Chess;
    private _figures: Array<ChessFigure>;
    private _fields: Array<ChessField>;

    /**
     * Constructs a complex chessboard with its figures from the meshes
     * @param meshes
     * @param scene
     */
    constructor(meshes: Array<BABYLON.AbstractMesh>, scene: BABYLON.Scene) {
        this.logic = new Chess();
        this.figures = ChessFigure.extractFigures(meshes);
        this.fields = ChessField.extractFields(meshes, this, scene);
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

    public async resetFieldMaterial(): Promise<void> {
        this.fields.forEach(field => {
            field.resetField();
        })
    }

    /**
     * Makes figure unpickable so that you can gaze "through" them
     */
    public makeFiguresUnpickable(): void {
        this.figures.forEach(fig => {
            fig.mesh.isPickable = false;
        });
    }

    public getPlayableFields(chess_pos: string): Array<ChessField> {
        const moves = this.logic.moves({square: chess_pos});

        let playable_fields = [];

        moves.forEach(m => {
            const id = m.slice(-2).toUpperCase(); // Last 2 of moves method are the id
            const flag = ChessBoard.getFlag(id); // TODO Flags
            const playable_field = this.fields.find(f => f.id === id);
            playable_fields.push(playable_field);
        })

        return playable_fields;
    }

    public getFigureById(id: string){
        let result_fig = null;
        this.figures.forEach(fig => {
            if (fig.id === id){
                result_fig = fig;
            }
        })
        return result_fig;
    }

    private static getFlag(move: string): string {
        if (move.length > 2) {
            return move.charAt(0);
        }
        return "";
    }
}