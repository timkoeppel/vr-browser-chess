import * as BABYLON from "@babylonjs/core";

export class Position {
    get scene_pos() {
        return this._scene_pos;
    }

    set scene_pos(value) {
        this._scene_pos = value;
    }
    get chess_pos() {
        return this._chess_pos;
    }

    set chess_pos(value) {
        this._chess_pos = value;
    }

    private _chess_pos: string;
    private _scene_pos: BABYLON.Vector3;

    public static y_figure = 25;
    public static y_field = 24.95;

    constructor(chess_pos: string | null, scene_pos: BABYLON.Vector3 | null, y_scene_pos) {
        if(scene_pos === null){
            scene_pos = Position._convertToScenePos(chess_pos, y_scene_pos);
        } else if (chess_pos === null) {
            chess_pos = Position._convertToChessPos(scene_pos);
        }

        this.chess_pos = chess_pos;
        this.scene_pos = scene_pos;
    }

    /**
     *
     * @param chess_pos
     * @param obj ("figure" | "field")
     * @private
     */
    private static _convertToScenePos(chess_pos: string, obj: string): BABYLON.Vector3{
        const x_chess = chess_pos.charAt(0);
        const z_chess = chess_pos.charAt(1);

        // x conversion
        const x_num = x_chess.toLowerCase().charCodeAt(0) - 97 + 1;
        const x_pos = this._getUnevenPlusMinusRange(8)[x_num];

        // z conversion
        const z_num = parseInt(z_chess) - 1;
        const z_pos = this._getUnevenPlusMinusRange(8)[z_num];

        // y
        const y_pos = obj === "figure" ? this.y_figure : this.y_field;

        return new BABYLON.Vector3(x_pos, y_pos, z_pos);
    }

    private static _convertToChessPos(scene_pos: BABYLON.Vector3): string{
        const x_scene = scene_pos.x;
        const z_scene = scene_pos.z;

        // x conversion
        const x_chess = this._getUnevenPlusMinusRange(8).indexOf(x_scene);
        const x_letter = String.fromCharCode(x_chess + 97).toUpperCase();

        // z conversion
        const z_chess = this._getUnevenPlusMinusRange(8).indexOf(z_scene) + 1;

        return x_letter + z_chess;
    }

    /**
     * Returns [-7, -5, -3, -1, 1, 3, 5, 7]
     * @private
     */
    private static _getUnevenPlusMinusRange(num): Array<number>{
        let range = [];
        for (let i=1; i<2*num; i++) {
            if(i % 2 !== 0) {
                range.push(i - num);
            }
        }
        return range;
    }
}