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
     * @param meshes The imported meshes
     */
    constructor(meshes: Array<BABYLON.AbstractMesh>) {
        this.logic = new Chess();
        this.figures = ChessFigure.extractFigures(meshes);
        this.fields = ChessBoard.extractFields(meshes, this);
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
     * Resets the material for all fields to their original black/white field material
     */
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

    /**
     * Uses the chess logic to determine possible moves for this figure
     * @param chess_pos The position
     */
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

    // ************************************************************************
    // HELPER METHODS
    // ************************************************************************
    /**
     * Gets the flag of a move from the chess logic response
     * @param move the move from the chess logic (Syntax)
     * @private
     */
    private static getFlag(move: string): string {
        if (move.length > 2) {
            return move.charAt(0);
        }
        return "";
    }

    /**
     * Extracts all the Chessfields from imported meshes
     * @param meshes The imported chess meshes (board/fields, figures)
     * @param board The chessboard to which the Chessfields should belong to
     * @private
     */
    private static extractFields(meshes: Array<BABYLON.AbstractMesh>, board: ChessBoard): Array<ChessField> {
        const scene = meshes[0].getScene();
        let fields = [];
        const field_meshes: Array<BABYLON.AbstractMesh> = meshes.filter(m => m.id.length === 2);
        field_meshes.forEach(mesh => {
            const chess_field_pos = new Position(mesh.position, "field");
            const fig = this.getFigureByPos(chess_field_pos, board.figures);

            const chess_field = new ChessField(
                mesh.id,
                chess_field_pos,
                fig,
                mesh,
                board,
                mesh.material,
                scene
            );
            fields.push(chess_field);
        });
        return fields;
    }

    /**
     * Gets the figure on a field by its position (getFigure won't work, because the board isn't initialized yet)
     * @param pos The field position
     * @param figures All the possible figures
     * @private
     */
    private static getFigureByPos(pos: Position, figures: Array<ChessFigure>): ChessFigure | null {
        let result = null;
        figures.forEach(fig => {
            const same_pos = pos.chess_pos === fig.pos.chess_pos;
            if (same_pos) {
                result = fig;
            } else {
                //console.log(pos.chess_pos, fig);
            }
        })
        return result;
    }
}