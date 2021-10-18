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
     * @param side The playing side ("white" | "black")
     * @param gender The gender of the avatar ("male" | "female")
     * @param no The number of the selected avatar (1 | 2)
     */
    constructor(side, gender, no) {
        this.rootURL = `/meshes/${gender}_0${no}/`;
        this.filename = `${gender}_0${no}.glb`;
        this.position = Avatar._getPosition(side);
        this.rotation = Avatar._getRotation(side);
        this.scale = new BABYLON.Vector3(100, 100, 100);
    }

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
     * Rotates the bones to a seating position
     */
    public seatAvatar(): void {
        let bones = this.scene.transformNodes;
        let pose = new Pose(bones);

        pose.clavicle_l.rotationQuaternion = Pose.seat_rotations.clavicle_l;

    }

    public stopAnimations(): void {
        this.scene.animationGroups.forEach(an => {
            an.stop();
        })
    }

    private static _getPosition(side: string): BABYLON.Vector3 {
        const x_pos = 0;
        const y_pos = -15;
        const z_pos = (side == "white") ? 25 : -25;

        return new BABYLON.Vector3(x_pos, y_pos, z_pos);
    }

    private static _getRotation(side: string): BABYLON.Vector3 {
        const x_rot = 3 * Math.PI / 2;
        const y_rot = (side === "white") ? 0 : Math.PI;
        const z_rot = Math.PI;

        return new BABYLON.Vector3(x_rot, y_rot, z_rot);
    }


}