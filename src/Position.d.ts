import * as BABYLON from "@babylonjs/core";
export declare class Position {
    get scene_pos(): BABYLON.Vector3;
    set scene_pos(value: BABYLON.Vector3);
    get chess_pos(): string;
    set chess_pos(value: string);
    private _chess_pos;
    private _scene_pos;
    constructor(pos: BABYLON.Vector3 | string, obj?: string);
    /**
     * Converts the string notation of chess to a Vector according to the mesh
     * @param chess_pos The chess string notation e.g. "A1", "H8", ...
     * @param obj The object mesh ("figure" | "field")
     * @private
     */
    static convertToScenePos(chess_pos: string, obj: string): BABYLON.Vector3;
    /**
     * Converts the Vector into the chess string notation
     * @param scene_pos The vector
     * @return chess_pos if on the field "C3" and captured outside of board ""
     * @private
     */
    static convertToChessPos(scene_pos: BABYLON.Vector3): string;
    /**
     * Returns Gets the uneven range from -num to +num
     * e.g. [-7, -5, -3, -1, 1, 3, 5, 7] if num = 8
     * @private
     */
    private static _getUnevenPlusMinusRange;
    /**
     * Rounds up the vector position to work with
     * (Some imported meshes have positions with heaps of decimal places)
     * @param vec The vector
     * @private
     */
    private static _normalizeVector;
}
