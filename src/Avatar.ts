import * as BABYLON from "@babylonjs/core";
import * as path from "path";

export class Avatar {
    // Properties
    public rootURL;
    public filename;
    public position;
    public rotation;
    public scale;

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

    private static _getPosition(side): BABYLON.Vector3{
        const x_pos = 0;
        const y_pos = -15;
        const z_pos = (side == "white") ? 25 : -25;

        return new BABYLON.Vector3(x_pos, y_pos, z_pos);
    }

    private static _getRotation(side): BABYLON.Vector3{
        const x_rot = 3 * Math.PI / 2;
        const y_rot = (side === "white") ? 0 : Math.PI;
        const z_rot = Math.PI;

        return new BABYLON.Vector3(x_rot, y_rot, z_rot);
    }


}