import {IPlayerData} from "./IPlayerData";
import {App} from "./App";
import * as BABYLON from "@babylonjs/core";
import * as GUI from 'babylonjs-gui';
import Game from "./Game";
import {Avatar} from "./Avatar";

export class DOM {
    get other_player(): GUI.RadioButton {
        return this._other_player;
    }

    set other_player(value: GUI.RadioButton) {
        this._other_player = value;
    }
    get avatar(): GUI.Button {
        return this._avatar;
    }

    set avatar(value: GUI.Button) {
        this._avatar = value;
    }
    get controller(): GUI.RadioButton {
        return this._controller;
    }

    set controller(value: GUI.RadioButton) {
        this._controller = value;
    }
    get scene(): BABYLON.Scene {
        return this._scene;
    }

    set scene(value: BABYLON.Scene) {
        this._scene = value;
    }
    get game(): Game {
        return this._game;
    }

    set game(value: Game) {
        this._game = value;
    }

    private _game: Game;
    private _scene: BABYLON.Scene;
    private _controller: GUI.RadioButton;
    private _avatar: GUI.Button;
    private _other_player: GUI.RadioButton;


    constructor(own_color, game: Game, scene: BABYLON.Scene) {
        this.game = game;
        this.scene = scene;
        this.controller = null;
        this.avatar = null;
        this.other_player = null;

        this.createGameMenu(own_color);
    }

    public showHTMLElement(element: HTMLElement) {
        element.classList.remove("no_display");
    }

    public lobbyFullRedirect(location: string) {
        alert("Lobby is full!");
        window.location.href = location
    }

    public createGameMenu(color: "white" | "black") {
        let plane = BABYLON.MeshBuilder.CreatePlane("plane", {height:100, width: 80});
        plane.position = new BABYLON.Vector3(30,50,0);
        plane.rotate(new BABYLON.Vector3(0,1, 0), -Math.PI/2);


        // @ts-ignore
        let advancedTexture = GUI.AdvancedDynamicTexture.CreateForMesh(plane, 1024, 1024);
        let panel = new GUI.StackPanel();
        panel.background = "grey";
        advancedTexture.addControl(panel);

        this.createControllerChoice(panel);
        this.createAvatarChoice(panel);
        if (color === "white") {
            this.createAIOrHumanChoice(panel);
        }
        this.addSubmitButton(panel);
    }

    private createControllerChoice(panel: GUI.Container) {
        DOM.addChoiceTitle("Controller:", panel);
        this.addRadioButton("Voice", "controller", panel, true);
        this.addRadioButton("Gaze", "controller", panel);
    }

    private createAvatarChoice(panel: GUI.Container){
        DOM.addChoiceTitle("Avatar:", panel);
        this.addImageRadio("male_01", Avatar.MALE_01_PATH, panel, true);
        this.addImageRadio("male_02", Avatar.MALE_02_PATH, panel);
        this.addImageRadio("male_03", Avatar.MALE_03_PATH, panel);
        this.addImageRadio("female_01", Avatar.FEMALE_01_PATH, panel);
        this.addImageRadio("female_02", Avatar.FEMALE_02_PATH, panel);
        this.addImageRadio("female_03", Avatar.FEMALE_03_PATH, panel);
    }

    private createAIOrHumanChoice(panel: GUI.Container) {
        DOM.addChoiceTitle("Other Player:", panel);
        this.addRadioButton("Human", "other_player", panel, true);
        this.addRadioButton("Easy", "other_player", panel);
        this.addRadioButton("Intermediate", "other_player", panel);
        this.addRadioButton("Expert", "other_player", panel);
    }

    private addImageRadio(name, path, parent, active?: boolean){
        let button = GUI.Button.CreateImageOnlyButton(name, path);
        button.name = name.toLowerCase();
        button.width = "80px";
        button.height = "100px";
        button.color = "white";
        button.background = "transparent";

        if(active){
            this.setAvatarChoice(button)
        }

        button.onPointerDownObservable.add(() => {
            this.setAvatarChoice(button);
        });

        parent.addControl(button);
    }

    private addRadioButton(text, group, parent, checked=false) {
        let button = new GUI.RadioButton();
        button.name = text.toLowerCase();
        button.width = "20px";
        button.height = "20px";
        button.color = "white";
        button.background = "grey";
        button.group = group;
        button.isChecked =  checked;

        if(checked){
            if(group === "controller") {
                this.controller = button;
            }else{
                this.other_player = button;
            }

        }


        button.onIsCheckedChangedObservable.add(() => {
            (group === "controller") ? this.setControllerChoice(button) : this.setOtherPlayerChoice(button);
        });

        let header = GUI.Control.AddHeader(button, text, "100px", { isHorizontal: true, controlFirst: true });
        header.height = "30px";
        header.color = "white";

        parent.addControl(header);
    }

    private static addChoiceTitle(text, panel){
        let textblock = new GUI.TextBlock();
        textblock.height = "50px";
        textblock.color = "white";
        textblock.text = text;
        textblock.fontWeight = "bold";
        panel.addControl(textblock);
    }

    private addSubmitButton(panel: GUI.Container){
        let button = GUI.Button.CreateSimpleButton("submit", "Start Game!");
        button.width = "150px";
        button.height = "40px";
        button.color = "white";
        button.cornerRadius = 10;
        button.background = "grey";
        button.onPointerDownObservable.add(() => {
            this.submitReadyPlayer();
        });
        panel.addControl(button);
    }

    private setControllerChoice(button: GUI.RadioButton){
        this.controller = button;
    }

    private setAvatarChoice(button: GUI.Button){
        if(this.avatar !== null){
            this.avatar.color = "white";
        }
        this.avatar = button;
        button.color = "red";
    }

    private setOtherPlayerChoice(button: GUI.RadioButton){
        this.other_player = button;
    }

    private fetchPlayerData(): IPlayerData {
        return new IPlayerData(
            this.game.own_color,
            this.controller.name,
            this.avatar.name,
            this.other_player.name
        )
    }

    private submitReadyPlayer() {
        const data: IPlayerData = this.fetchPlayerData();
        this.emitPlayerData(data);
    }


    private emitPlayerData(data: IPlayerData) {
        this.game.app.connection.emitPlayerData(data);
    }
}