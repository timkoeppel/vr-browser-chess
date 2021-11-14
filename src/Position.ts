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

    constructor(pos: BABYLON.Vector3 | string, obj?: string) {
        let chess_pos;
        let scene_pos;
        if (typeof pos === "string") {
            chess_pos = pos;
            scene_pos = Position.convertToScenePos(pos, obj);
        } else {
            chess_pos = Position.convertToChessPos(pos);
            scene_pos = Position._normalizeVector(pos);
        }
        this.chess_pos = chess_pos;
        this.scene_pos = scene_pos;
    }

    /**
     * Converts the string notation of chess to a Vector according to the mesh
     * @param chess_pos The chess string notation e.g. "A1", "H8", ...
     * @param obj The object mesh ("figure" | "field")
     * @private
     */
    public static convertToScenePos(chess_pos: string, obj: string): BABYLON.Vector3 {
        const x_chess = chess_pos.charAt(0);
        const z_chess = chess_pos.charAt(1);

        // x conversion
        const x_num = x_chess.toLowerCase().charCodeAt(0) - 97;
        const x_pos = this._getUnevenPlusMinusRange(8, true)[x_num];

        // z conversion
        const z_num = parseInt(z_chess) - 1;
        const z_pos = this._getUnevenPlusMinusRange(8, false)[z_num];

        // y
        const y_pos = obj === "figure" ? 25 : 24.95;

        return new BABYLON.Vector3(x_pos, y_pos, z_pos);
    }

    /**
     * Converts the Vector into the chess string notation
     * @param scene_pos The vector
     * @return chess_pos if on the field "C3" and captured outside of board ""
     * @private
     */
    public static convertToChessPos(scene_pos: BABYLON.Vector3): string {
        scene_pos = this._normalizeVector(scene_pos);
        const x_scene = scene_pos.x;
        const z_scene = scene_pos.z;

        // x conversion
        const x_chess = this._getUnevenPlusMinusRange(8, true).indexOf(x_scene);
        const x_letter = String.fromCharCode(x_chess + 65).toUpperCase();

        // z conversion
        const z_chess = this._getUnevenPlusMinusRange(8, false).indexOf(z_scene) + 1;

        // captured figure
        if (x_chess < 0){
            return "";
        }

        return x_letter + z_chess;
    }

    /**
     * Returns Gets the uneven range from -num to +num
     * e.g. [-7, -5, -3, -1, 1, 3, 5, 7] if num = 8
     * @private
     */
    private static _getUnevenPlusMinusRange(num: number, minus_first: boolean): Array<number> {
        let range = [];
        for (let i = 1; i < 2 * num; i++) {
            if (i % 2 !== 0) {
                range.push(i - num);
            }
        }
        return minus_first ? range : range.reverse();
    }

    /**
     * Rounds up the vector position to work with
     * (Some imported meshes have positions with heaps of decimal places)
     * @param vec The vector
     * @private
     */
    private static _normalizeVector(vec: BABYLON.Vector3): BABYLON.Vector3 {
        const x = Math.round(vec.x);
        const y = Math.round(vec.y * 100) / 100; // Fields have height 24.95
        const z = Math.round(vec.z);

        return new BABYLON.Vector3(x, y, z);
    }
}
