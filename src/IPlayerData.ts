interface PlayerData{
    name: string;
    color: "white" | "black";
    avatar: "male_01" | "male_02"| "male_03" | "female_01" | "female_02" | "female_03";
    controller: "voice" | "gaze";
    ai: "easy" | "intermediate" | "expert";
}

export class IPlayerData implements PlayerData{
    public name: string;
    public color: "white" | "black";
    public avatar: "male_01" | "male_02"| "male_03" | "female_01" | "female_02" | "female_03";
    public controller: "voice" | "gaze";
    public ai: "easy" | "intermediate" | "expert";

    constructor(name, color, avatar, controller, ai) {
        this.name = name;
        this.color = color;
        this.avatar = avatar;
        this.controller = controller;
        this.ai = ai;
    }
}