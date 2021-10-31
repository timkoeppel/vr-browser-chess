import * as BABYLON from "@babylonjs/core";

export class Action {
    public static makeMove(fig_mesh: BABYLON.AbstractMesh, start_pos: BABYLON.Vector3, end_pos: BABYLON.Vector3) {
        BABYLON.Animation.CreateAndStartAnimation(
            "anim",
            fig_mesh,
            "position",
            100,
            100,
            start_pos,
            end_pos,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    }
}