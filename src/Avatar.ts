import * as BABYLON from "@babylonjs/core";
import {Pose} from "./Pose";

/**
 * Avatar manages everything avatar related
 */
export class Avatar {
    get rootURL(): string {
        return this._rootURL;
    }

    set rootURL(value: string) {
        this._rootURL = value;
    }

    get filename(): string {
        return this._filename;
    }

    set filename(value: string) {
        this._filename = value;
    }

    get position(): BABYLON.Vector3 {
        return this._position;
    }

    set position(value: BABYLON.Vector3) {
        this._position = value;
    }

    get rotation(): BABYLON.Vector3 {
        return this._rotation;
    }

    set rotation(value: BABYLON.Vector3) {
        this._rotation = value;
    }

    get scale(): BABYLON.Vector3 {
        return this._scale;
    }

    set scale(value: BABYLON.Vector3) {
        this._scale = value;
    }

    get scene(): BABYLON.ISceneLoaderAsyncResult {
        return this._scene;
    }

    set scene(value: BABYLON.ISceneLoaderAsyncResult) {
        this._scene = value;
    }

    get pose(): Pose {
        return this._pose;
    }

    set pose(value: Pose) {
        this._pose = value;
    }


    private _rootURL: string;
    private _filename: string;
    private _position: BABYLON.Vector3;
    private _rotation: BABYLON.Vector3;
    private _scale: BABYLON.Vector3;
    private _scene: BABYLON.ISceneLoaderAsyncResult;
    private _pose: Pose;

    /**
     *
     * @param player_side The playing side ("white" | "black")
     * @param file_name
     */
    constructor(player_side: "white" | "black", file_name) {
        const scale = 40;
        this.rootURL = `/meshes/${file_name}/`;
        this.filename = `${file_name}.glb`;
        this.position = Avatar._getPlayerSidePosition(player_side);
        this.rotation = Avatar._getRotation(player_side);
        this.scale = new BABYLON.Vector3(-scale, scale, scale);
    }

    // ************************************************************************
    // CONSTANTS
    // ************************************************************************
    public static MALE_01_PATH = "./img/avatars/male_01.png";
    public static MALE_02_PATH = "./img/avatars/male_02.png";
    public static MALE_03_PATH = "./img/avatars/male_03.png";
    public static FEMALE_01_PATH = "./img/avatars/female_01.png";
    public static FEMALE_02_PATH = "./img/avatars/female_02.png";
    public static FEMALE_03_PATH = "./img/avatars/female_03.png";

    // ************************************************************************
    // MAIN METHODS
    // ************************************************************************
    /**
     * Places the avatar in its respective chair
     */
    public placeAvatar(): void {
        let root_node = this.scene.meshes[0];

        // meshes[0] is the root node
        root_node.rotation = this.rotation;
        root_node.scaling = this.scale;
        root_node.setAbsolutePosition(this.position);
    }

    /**
     * Rotates the bones (transformNodes with .glb) to a seating position
     */
    public seatAvatar(): void {
        this.pose.makeSeatPose();
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
        const x_rot = 0;//3 * Math.PI / 2;
        const y_rot = (player_side === "white") ? Math.PI : 0;
        const z_rot = 0;//Math.PI;

        return new BABYLON.Vector3(x_rot, y_rot, z_rot);
    }


}