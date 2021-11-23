import * as BABYLON from "@babylonjs/core";
/**
 * Pose manages the stature/pose of the avatars
 */
export declare class Pose {
    head: BABYLON.TransformNode;
    neck: BABYLON.TransformNode;
    spine_2: BABYLON.TransformNode;
    spine_1: BABYLON.TransformNode;
    clavicle_l: BABYLON.TransformNode;
    clavicle_r: BABYLON.TransformNode;
    upperarm_l: BABYLON.TransformNode;
    upperarm_r: BABYLON.TransformNode;
    forearm_l: BABYLON.TransformNode;
    forearm_r: BABYLON.TransformNode;
    hand_l: BABYLON.TransformNode;
    hand_r: BABYLON.TransformNode;
    thigh_l: BABYLON.TransformNode;
    thigh_r: BABYLON.TransformNode;
    calf_l: BABYLON.TransformNode;
    calf_r: BABYLON.TransformNode;
    foot_l: BABYLON.TransformNode;
    foot_r: BABYLON.TransformNode;
    /**
     * IDs according to Microsoft RocketBox Avatars
     */
    ids: {
        id_head: string;
        id_neck: string;
        id_spine_2: string;
        id_spine_1: string;
        id_clavicle_l: string;
        id_clavicle_r: string;
        id_upperarm_l: string;
        id_upperarm_r: string;
        id_forearm_l: string;
        id_forearm_r: string;
        id_hand_l: string;
        id_hand_r: string;
        id_thigh_l: string;
        id_thigh_r: string;
        id_calf_l: string;
        id_calf_r: string;
        id_foot_l: string;
        id_foot_r: string;
    };
    constructor(tnodes: Array<BABYLON.TransformNode>);
    /**
     * Brings the pose parts in a seating position
     */
    makeSeatPose(): void;
}
