import * as BABYLON from "@babylonjs/core";
/**
 * Manages all Actions/Animations including movements
 */
export declare class Action {
    /**
     * Moves a figure to the given 3D vector location
     * @param fig_mesh
     * @param start_pos
     * @param end_pos
     */
    static moveFigure(fig_mesh: BABYLON.AbstractMesh, start_pos: BABYLON.Vector3, end_pos: BABYLON.Vector3): void;
}
