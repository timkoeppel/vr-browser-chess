import * as BABYLON from "@babylonjs/core";
import {ChessState} from "./ChessState";
import {ChessFigure} from "./ChessFigure";

/**
 * Action manages all Actions/Animations including movements
 */
export class ActionManager {
    get state(): ChessState {
        return this._state;
    }

    set state(value: ChessState) {
        this._state = value;
    }
    private _state: ChessState;

    constructor(state: ChessState) {
        this.state = state;
    }

    /**
     * Moves a chess figure to the given 3D vector location
     * @param fig
     * @param start_pos The starting 3D position of the animation (normally fig_mesh's location)
     * @param end_pos The ending 3D position of the animation
     */
    public moveFigure(fig: ChessFigure, start_pos: BABYLON.Vector3, end_pos: BABYLON.Vector3) {
        BABYLON.Animation.CreateAndStartAnimation(
            "move_figure",
            fig.mesh,
            "position",
            100,
            100,
            start_pos,
            end_pos,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT,
        );
    }

    /**
     * Moves the figure and fulfills a promotion immediately afterwards
     * @param fig
     * @param start_pos
     * @param end_pos
     */
    public moveFigureAndPromote(fig: ChessFigure, start_pos: BABYLON.Vector3, end_pos: BABYLON.Vector3){
        const color = this.state.current_player.color;
        BABYLON.Animation.CreateAndStartAnimation(
            "move_figure",
            fig.mesh,
            "position",
            100,
            100,
            start_pos,
            end_pos,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT,
            new BABYLON.CubicEase(),
            () => {
                this.state.physicalPromotion(fig, color)
            }
        );
    }

    /**
     * Moves the hands to a given 3D vector location and moves back to the original hand position if necessary
     * @param hand_node The TransformNode of the hand to move
     * @param start_pos The starting 3D position of the animation (normally hand_node's location)
     * @param end_pos The ending 3D position of the animation
     * @param ori_pos The original 3D position to return to after successful move
     */
    public static moveHands(hand_node: BABYLON.TransformNode, start_pos: BABYLON.Vector3, end_pos: BABYLON.Vector3, ori_pos?: BABYLON.Vector3) {
        //let s_pos = new BABYLON.Vector3(start_pos.z,start_pos.y, start_pos.x);
        /*BABYLON.Animation.CreateAndStartAnimation(
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

         */
    }
}