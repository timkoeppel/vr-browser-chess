import * as BABYLON from "@babylonjs/core";
import {ChessField} from "./ChessField";
import {ChessFigure} from "./ChessFigure";
import {Position} from "./Position";
import {ChessState} from "./ChessState";
import Game from "./Game";

/**
 * ChessBoard manages all aspects bound to the chessboard
 */
export class ChessBoard {
    get game(): Game {
        return this._game;
    }

    set game(value: Game) {
        this._game = value;
    }
    get state(): ChessState {
        return this._state;
    }

    set state(value: ChessState) {
        this._state = value;
    }

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

    private _figures: Array<ChessFigure>;
    private _fields: Array<ChessField>;
    private _state: ChessState;
    private _game: Game;

    /**
     * Constructs a complex chessboard with its figures from the meshes
     * @param meshes The imported meshes
     * @param game The game the board is bounded to
     */
    constructor(meshes: Array<BABYLON.AbstractMesh>, game: Game) {
        this.game = game;
        this.figures = ChessFigure.extractFigures(meshes, this);
        this.fields = ChessBoard.extractFields(meshes, this);
    }

    initiate(own_color: "white" | "black", black_player: "human" | "easy" | "intermediate" | "expert"): void{
        this.state = new ChessState(this.game, own_color, black_player);
    }

    // ************************************************************************
    // MAIN METHODS
    // ************************************************************************

    /**
     * Resets the material for all fields to their original black/white field material
     */
    public async resetFieldsMaterial(): Promise<void> {
        this.fields.forEach(field => {
            field.resetFieldMaterial();
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
     * Gets the ChessField by the given chess ID
     * @param chess_pos
     */
    public getField(chess_pos: string): ChessField {
        return this.fields.find(f => f.id === chess_pos);
    }


    // ************************************************************************
    // HELPER METHODS
    // ************************************************************************
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
            const same_pos = pos.chess_pos === fig.position.chess_pos;
            if (same_pos) {
                result = fig;
            }
        });
        return result;
    }
}