import * as BABYLON from "@babylonjs/core";
import {Pose} from "./Pose";

export class Avatar {
    // Properties
    public rootURL: string;
    public filename: string;
    public position: BABYLON.Vector3;
    public rotation: BABYLON.Vector3;
    public scale: BABYLON.Vector3;
    public scene: BABYLON.ISceneLoaderAsyncResult;

    /**
     *
     * @param player_side The playing side ("white" | "black")
     * @param file_name
     */
    constructor(player_side: "white" | "black", file_name) {
        this.rootURL = `/meshes/${file_name}/`;
        this.filename = `${file_name}.glb`;
        this.position = Avatar._getPlayerSidePosition(player_side);
        this.rotation = Avatar._getRotation(player_side);
        this.scale = new BABYLON.Vector3(100, 100, 100);
    }

    public static MALE_01_PATH = "./img/male_01.png";
    public static MALE_02_PATH = "./img/male_02.png";
    public static MALE_03_PATH = "./img/male_03.png";
    public static FEMALE_01_PATH = "./img/female_01.png";
    public static FEMALE_02_PATH = "./img/female_02.png";
    public static FEMALE_03_PATH = "./img/female_03.png";

    // ************************************************************************
    // MAIN METHODS
    // ************************************************************************
    /**
     * Places the avatar in its respective chair
     */
    public placeAvatar(): void {
        let meshes = this.scene.meshes;

        meshes.forEach(mesh => {
            mesh.position = this.position;
            mesh.rotation = this.rotation;
            mesh.scaling = this.scale;
        });
    }

    /**
     * Rotates the bones (transformNodes with .glb) to a seating position
     */
    public seatAvatar(): void {
        let bones = this.scene.transformNodes;
        let pose = new Pose(bones);

        pose.makeSeatPose();
    }

    /**
     * Stops all animations coming natively from the Rocketbox Library
     */
    public stopAnimations(): void {
        this.scene.animationGroups.forEach(an => {
            an.stop();
        })
    }

    // ************************************************************************
    // HELPER METHODS
    // ************************************************************************
    /**
     * Gets the position, where the avatar should be placed according to side
     * @param player_side
     * @private
     */
    private static _getPlayerSidePosition(player_side: string): BABYLON.Vector3 {
        const x_pos = 0;
        const y_pos = -15;
        const z_pos = (player_side == "white") ? 26 : -26;

        return new BABYLON.Vector3(x_pos, y_pos, z_pos);
    }

    /**
     * Gets the rotation, how the avatar should be rotated according to side
     * @param player_side
     * @private
     */
    private static _getRotation(player_side: string): BABYLON.Vector3 {
        const x_rot = 3 * Math.PI / 2;
        const y_rot = (player_side === "white") ? 0 : Math.PI;
        const z_rot = Math.PI;

        return new BABYLON.Vector3(x_rot, y_rot, z_rot);
    }


}