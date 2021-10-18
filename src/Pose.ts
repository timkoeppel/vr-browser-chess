import * as BABYLON from "@babylonjs/core";

export class Pose {
    public head: BABYLON.TransformNode;
    public neck: BABYLON.TransformNode;
    public spine_2: BABYLON.TransformNode;
    public spine_1: BABYLON.TransformNode;
    public clavicle_l: BABYLON.TransformNode;
    public clavicle_r: BABYLON.TransformNode;
    public upperarm_l: BABYLON.TransformNode;
    public upperarm_r: BABYLON.TransformNode;
    public forearm_l: BABYLON.TransformNode;
    public forearm_r: BABYLON.TransformNode;
    public hand_l: BABYLON.TransformNode;
    public hand_r: BABYLON.TransformNode;
    public thigh_l: BABYLON.TransformNode;
    public thigh_r: BABYLON.TransformNode;
    public calf_l: BABYLON.TransformNode;
    public calf_r: BABYLON.TransformNode;
    public foot_l: BABYLON.TransformNode;
    public foot_r: BABYLON.TransformNode;

    /**
     * IDs according to Microsoft RocketBox Avatars
     */
    public ids = {
        id_head: "Bip01 Head",
        id_neck:"Bip01 Neck",
        id_spine_2: "Bip01 Spine 2",
        id_spine_1: "Bip01 Spine 1",
        id_clavicle_l: "Bip01 L Clavicle",
        id_clavicle_r: "Bip01 R Clavicle",
        id_upperarm_l: "Bip01 L UpperArm",
        id_upperarm_r: "Bip01 R UpperArm",
        id_forearm_l: "Bip01 L Forearm",
        id_forearm_r: "Bip01 R Forearm",
        id_hand_l: "Bip01 L Hand",
        id_hand_r: "Bip01 R Hand",
        id_thigh_l: "Bip01 L Thigh",
        id_thigh_r: "Bip01 R Thigh",
        id_calf_l: "Bip01 L Calf",
        id_calf_r: "Bip01 R Calf",
        id_foot_l: "Bip01 L Foot",
        id_foot_r: "Bip01 R Foot",
    }

    public static seat_rotations = {
        clavicle_l: new BABYLON.Vector3(0, 0, 0).toQuaternion(),

    };

    constructor(tnodes: Array<BABYLON.TransformNode>){
        this.head = tnodes.find(b => b.id === this.ids["id_head"]);
        this.neck = tnodes.find(b => b.id === this.ids["id_neck"]);
        this.spine_2 = tnodes.find(b => b.id === this.ids["id_spine_2"]);
        this.spine_1 = tnodes.find(b => b.id === this.ids["id_spine_1"]);
        this.clavicle_l = tnodes.find(b => b.id === this.ids["id_clavicle_l"]);
        this.clavicle_r = tnodes.find(b => b.id === this.ids["id_clavicle_r"]);
        this.upperarm_l = tnodes.find(b => b.id === this.ids["id_upperarm_l"]);
        this.upperarm_r = tnodes.find(b => b.id === this.ids["id_upperarm_r"]);
        this.forearm_l = tnodes.find(b => b.id === this.ids["id_forearm_l"]);
        this.forearm_r = tnodes.find(b => b.id === this.ids["id_forearm_r"]);
        this.hand_l = tnodes.find(b => b.id === this.ids["id_hand_l"])
        this.hand_r = tnodes.find(b => b.id === this.ids["id_hand_r"]);
        this.thigh_l = tnodes.find(b => b.id === this.ids["id_thigh_l"]);
        this.thigh_r = tnodes.find(b => b.id === this.ids["id_thigh_r"]);
        this.calf_l = tnodes.find(b => b.id === this.ids["id_calf_l"]);
        this.calf_r = tnodes.find(b => b.id === this.ids["id_calf_r"]);
        this.foot_l = tnodes.find(b => b.id === this.ids["id_foot_l"]);
        this.foot_r = tnodes.find(b => b.id === this.ids["id_foot_r"]);
    }


}