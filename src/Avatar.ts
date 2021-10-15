import * as BABYLON from "@babylonjs/core";
import * as path from "path";

export class Avatar {
    public rootURL;
    public filename;
    public position;
    public rotation;
    public scale;

    private _height = -15;
    private _scale = new BABYLON.Vector3(100, 100, 100);
    private _pos_white = new BABYLON.Vector3(0, this._height, 25);
    private _rot_white = new BABYLON.Vector3(3 * Math.PI / 2, 0, Math.PI);
    private _pos_black = new BABYLON.Vector3(0, this._height, -25);
    private _rot_black = new BABYLON.Vector3(3 * Math.PI / 2, Math.PI, Math.PI);

    /**
     *
     * @param side The playing side ("white" | "black")
     * @param gender The gender of the avatar ("male" | "female")
     * @param no The number of the selected avatar (1 | 2)
     */
    constructor(side, gender, no) {
        this.rootURL = `/meshes/${gender}_0${no}/`;
        this.filename = `${gender}_0${no}.babylon`;
        this.position = (side === "white") ? this._pos_white : this._pos_black;
        this.rotation = (side === "white") ? this._rot_white : this._rot_black;
        this.scale = this._scale;
    }


}