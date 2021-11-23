import * as BABYLON from "@babylonjs/core";
export declare class Avatar {
    rootURL: string;
    filename: string;
    position: BABYLON.Vector3;
    rotation: BABYLON.Vector3;
    scale: BABYLON.Vector3;
    scene: BABYLON.ISceneLoaderAsyncResult;
    /**
     *
     * @param player_side The playing side ("white" | "black")
     * @param gender The gender of the avatar ("male" | "female")
     * @param no The number of the selected avatar (1 | 2)
     */
    constructor(player_side: any, gender: any, no: any);
    /**
     * Places the avatar in its respective chair
     */
    placeAvatar(): void;
    /**
     * Rotates the bones (transformNodes with .glb) to a seating position
     */
    seatAvatar(): void;
    /**
     * Stops all animations coming natively from the Rocketbox Library
     */
    stopAnimations(): void;
    /**
     * Gets the position, where the avatar should be placed according to side
     * @param player_side
     * @private
     */
    private static _getPlayerSidePosition;
    /**
     * Gets the rotation, how the avatar should be rotated according to side
     * @param player_side
     * @private
     */
    private static _getRotation;
}
