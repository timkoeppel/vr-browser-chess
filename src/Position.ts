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

    constructor(pos: BABYLON.Vector3 | string, obj: string) {
        let chess_pos;
        let scene_pos;
        if(typeof pos === "string"){
            chess_pos = pos;
            scene_pos = Position._convertToScenePos(pos, obj);
        }else{
            chess_pos = Position._convertToChessPos(pos);
            scene_pos = Position._normalizeVector(pos);
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
        //const z_pos = this._getUnevenPlusMinusRange(8)[z_num];
        const z_pos = this._getUnevenPlusMinusRange(8).reverse()[z_num];

        // y
        const y_pos = obj === "figure" ? 25 : 24.95;

        return new BABYLON.Vector3(x_pos, y_pos, z_pos);
    }

    private static _convertToChessPos(scene_pos: BABYLON.Vector3): string{
        scene_pos = this._normalizeVector(scene_pos);
        const x_scene = scene_pos.x;
        const z_scene = scene_pos.z;

        // x conversion
        const x_chess = this._getUnevenPlusMinusRange(8).indexOf(x_scene);
        const x_letter = String.fromCharCode(x_chess + 65).toUpperCase();

        // z conversion
        const z_chess = this._getUnevenPlusMinusRange(8).reverse().indexOf(z_scene) + 1;

        return x_letter + z_chess;
    }

    /**
     * Returns [-7, -5, -3, -1, 1, 3, 5, 7] if num = 8
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

    private static _normalizeVector(vec: BABYLON.Vector3): BABYLON.Vector3{
        const x = Math.round(vec.x);
        const y = Math.round(vec.y * 100) / 100; // Fields have height 24.95
        const z = Math.round(vec.z);

        return new BABYLON.Vector3(x, y, z);
    }
}
