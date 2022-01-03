import * as BABYLON from "@babylonjs/core";

/**
 * Manages all Actions/Animations including movements
 */
export class Action {

    /**
     * Moves a chess figure to the given 3D vector location
     * @param fig_mesh
     * @param start_pos
     * @param end_pos
     */
    public static moveFigure(fig_mesh: BABYLON.AbstractMesh, start_pos: BABYLON.Vector3, end_pos: BABYLON.Vector3) {
        BABYLON.Animation.CreateAndStartAnimation(
            "move_figure",
            fig_mesh,
            "position",
            100,
            100,
            start_pos,
            end_pos,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
    }

    /**
     * Moves the hands to a given 3D vector location and moves back to the original hand position if necessary
     * @param hand_node
     * @param start_pos
     * @param end_pos
     * @param ori_pos
     */
    public static moveHands(hand_node: BABYLON.TransformNode, start_pos: BABYLON.Vector3, end_pos: BABYLON.Vector3, ori_pos?: BABYLON.Vector3) {
        //let s_pos = new BABYLON.Vector3(start_pos.z,start_pos.y, start_pos.x);
        BABYLON.Animation.CreateAndStartAnimation(
            "move_hands_to",
            hand_node,
            "position",
            100,
            100,
            start_pos,
            end_pos,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        if(ori_pos !== undefined){
            setTimeout(() => {
                BABYLON.Animation.CreateAndStartAnimation(
                    "move_hands_back",
                    hand_node,
                    "position",
                    100,
                    50,
                    end_pos,
                    ori_pos,
                    BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
                );
            }, 1000)

        }
    }
}