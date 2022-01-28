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

        // Initialize move sounds
        ActionManager.capture_url.push("./sfx/capture.mp3");
        for (let i = 0; i < 8; i++) {
            ActionManager.move_url.push(`./sfx/move${i + 1}.mp3`);
        }
    }

    /**
     * Moves a chess figure to the given 3D vector location
     * @param fig
     * @param start_pos The starting 3D position of the animation (normally fig_mesh's location)
     * @param end_pos The ending 3D position of the animation
     */
    public moveFigure(fig: ChessFigure, start_pos: BABYLON.Vector3, end_pos: BABYLON.Vector3) {
        this.playSFX("move_figure",ActionManager.move_url);
        BABYLON.Animation.CreateAndStartAnimation(
            "move_figure",
            fig.mesh,
            "position",
            100,
            100,
            start_pos,
            end_pos,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT,
            new BABYLON.SineEase()
        );
    }

    /**
     * Moves a chess figure to the given 3D vector location
     * @param fig
     * @param start_pos The starting 3D position of the animation (normally fig_mesh's location)
     * @param end_pos The ending 3D position of the animation
     */
    public moveFigureAndCapture(fig: ChessFigure, start_pos: BABYLON.Vector3, end_pos: BABYLON.Vector3) {
        this.playSFX("move_figure_and_capture", ActionManager.capture_url);
        BABYLON.Animation.CreateAndStartAnimation(
            "move_figure_and_capture",
            fig.mesh,
            "position",
            100,
            100,
            start_pos,
            end_pos,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT,
            new BABYLON.SineEase()
        );
    }

    /**
     * Moves the figure and fulfills a promotion immediately afterwards
     * @param fig
     * @param start_pos
     * @param end_pos
     */
    public moveFigureAndPromote(fig: ChessFigure, start_pos: BABYLON.Vector3, end_pos: BABYLON.Vector3) {
        const color = this.state.current_player.color;
        BABYLON.Animation.CreateAndStartAnimation(
            "move_figure_and_promote",
            fig.mesh,
            "position",
            100,
            100,
            start_pos,
            end_pos,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT,
            new BABYLON.SineEase(),
            () => {
                this.state.physicalPromotion(fig, color)
            }
        );
    }

    private playSFX(description: string, sfx_collection: Array<string>): void {
        const sfx_url = sfx_collection[Math.floor(Math.random() * sfx_collection.length)];
        let sound = new BABYLON.Sound(description, sfx_url, this.state.game.scene, function () {
            // Sound has been downloaded & decoded
            sound.play();
        }, {
            loop: false,
            autoplay: false,
            length: 1,
            volume: 0.8,
        });
    }

    private static move_url: Array<string> = [];
    private static capture_url: Array<string> = [];
}