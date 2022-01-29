interface PlayerData {
    //name: string;
    color: "white" | "black";
    controller: "voice" | "gaze";
    avatar: "male_01" | "male_02" | "male_03" | "female_01" | "female_02" | "female_03";
    player_type: "human" | "easy" | "intermediate" | "expert";
    other_player?: "human" | "easy" | "intermediate" | "expert";
}

/**
 * Interface for all the relevant player data
 */
export class IPlayerData implements PlayerData {
    //public name: string;
    public color: "white" | "black";
    public avatar: "male_01" | "male_02" | "male_03" | "female_01" | "female_02" | "female_03";
    public controller: "voice" | "gaze";
    public player_type: "human" | "easy" | "intermediate" | "expert";
    public other_player: "human" | "easy" | "intermediate" | "expert";

    constructor(/* name,*/ color, controller, avatar, player_type, other_player?) {
        //this.name = name;
        this.color = color;
        this.avatar = avatar;
        this.controller = controller;
        this.player_type = player_type;
        this.other_player = other_player;
    }
}