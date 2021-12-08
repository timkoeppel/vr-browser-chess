import {IPlayerData} from "./IPlayerData";
import * as BABYLON from "@babylonjs/core";
import * as GUI from 'babylonjs-gui';
import Game from "./Game";
import {Avatar} from "./Avatar";

export class DOM {
    get main_panel(): GUI.Grid {
        return this._main_panel;
    }

    set main_panel(value: GUI.Grid) {
        this._main_panel = value;
    }

    get game_menu(): BABYLON.AbstractMesh {
        return this._game_menu;
    }

    set game_menu(value: BABYLON.AbstractMesh) {
        this._game_menu = value;
    }

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
    private _game_menu: BABYLON.AbstractMesh;
    private _main_panel: GUI.Grid;

    constructor(own_color, game: Game, scene: BABYLON.Scene) {
        this.game = game;
        this.scene = scene;
        this.controller = null;
        this.avatar = null;
        this.other_player = null;

        this.initiateGameMenu(own_color);
    }

    public showHTMLElement(element: HTMLElement) {
        element.classList.remove("no_display");
    }

    public lobbyFullRedirect(location: string) {
        alert("Lobby is full!");
        window.location.href = location
    }

    public refreshThroughOtherPlayerDisconnect(other_player_color: "white" | "black"): void {
        alert(`Player ${other_player_color} has disconnected.`);
        window.location.reload();
    }

    // Constants
    private static TITLE_ROW_HEIGHT = 55;
    private static RADIO_ROW_HEIGHT = 50;
    private static IMAGE_ROW_HEIGHT = 240;
    private static BUTTON_ROW_HEIGHT = 90;
    private static PADDING = 20;
    private static IMAGE_WIDTH = 200;
    private static BUTTON_WIDTH = 400;
    private static CORNER_RADIUS = 20;
    private static FONT_SIZE_TEXT = 30;
    private static FONT_SIZE_TITLE = 40;
    private static PRIMARY_COLOR = "white";
    private static SECONDARY_COLOR = "grey";
    private static BACKGROUND_COLOR = "transparent";

    public initiateGameMenu(player_color: "white" | "black") {
        this.initiateGameMenuMesh();
        this.initiateGrid(player_color);

        // Menu building
        let avatar_row = 3;
        let submit_row = 6;
        this.createControllerChoice(this.main_panel, 0);
        if (player_color === "white") {
            avatar_row = 8;
            submit_row = 11;
            this.createAIOrHumanChoice(this.main_panel, 3);
        }
        this.createAvatarChoice(this.main_panel, avatar_row);
        this.addSubmitButton(this.main_panel, submit_row, 1);
    }

    public hideGameMenu(): void {
        this.game_menu.visibility = 0;
    }

    public initiateGameMenuMesh(): void {
        this.game_menu = BABYLON.MeshBuilder.CreatePlane("plane", {height: 50, width: 40}) as BABYLON.AbstractMesh;
        this.game_menu.position = new BABYLON.Vector3(60, 45, 0);
        this.game_menu.rotate(new BABYLON.Vector3(0, 1, 0), -Math.PI / 2);
    }

    public initiateGrid(player_color: "white" | "black"): void {
        // Grid Panel Init
        this.main_panel = new GUI.Grid();
        this.main_panel.background = DOM.BACKGROUND_COLOR;
        this.main_panel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        this.main_panel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;

        // @ts-ignore
        let advancedTexture = GUI.AdvancedDynamicTexture.CreateForMesh(this.game_menu, 1024, 1024);
        advancedTexture.addControl(this.main_panel);

        // Layout
        this.main_panel.addColumnDefinition(0.25);
        this.main_panel.addColumnDefinition(0.5);
        this.main_panel.addColumnDefinition(0.25);
        DOM.addRows(this.main_panel, DOM.TITLE_ROW_HEIGHT, 1); // Controller title
        DOM.addRows(this.main_panel, DOM.RADIO_ROW_HEIGHT, 2); // Controller
        if (player_color === "white") {
            DOM.addRows(this.main_panel, DOM.TITLE_ROW_HEIGHT, 1); // Other player title
            DOM.addRows(this.main_panel, DOM.RADIO_ROW_HEIGHT, 4); // Other player
        }
        DOM.addRows(this.main_panel, DOM.TITLE_ROW_HEIGHT, 1); // Avatars title
        DOM.addRows(this.main_panel, DOM.IMAGE_ROW_HEIGHT, 2); // Avatars
        DOM.addRows(this.main_panel, DOM.BUTTON_ROW_HEIGHT, 1); // Submit
    }

    private createControllerChoice(panel: GUI.Grid, start_row: number) {
        DOM.addChoiceTitle("Controller:", start_row, 1, panel);
        this.addRadioButton("Voice", "controller", panel, start_row + 1, 1, true);
        this.addRadioButton("Gaze", "controller", panel, start_row + 2, 1);
    }

    private createAvatarChoice(panel: GUI.Grid, start_row: number) {
        DOM.addChoiceTitle("Avatar:", start_row, 1, panel);

        this.addImageRadio("male_01", Avatar.MALE_01_PATH, panel, start_row + 1, 0, true);
        this.addImageRadio("male_02", Avatar.MALE_02_PATH, panel, start_row + 1, 1);
        this.addImageRadio("male_03", Avatar.MALE_03_PATH, panel, start_row + 1, 2);
        this.addImageRadio("female_01", Avatar.FEMALE_01_PATH, panel, start_row + 2, 0);
        this.addImageRadio("female_02", Avatar.FEMALE_02_PATH, panel, start_row + 2, 1);
        this.addImageRadio("female_03", Avatar.FEMALE_03_PATH, panel, start_row + 2, 2);
    }

    private createAIOrHumanChoice(panel: GUI.Grid, start_row: number) {
        DOM.addChoiceTitle("Other Player:", start_row, 1, panel);
        this.addRadioButton("Human", "other_player", panel, start_row + 1, 1, true);
        this.addRadioButton("Easy", "other_player", panel, start_row + 2, 1);
        this.addRadioButton("Intermediate", "other_player", panel, start_row + 3, 1);
        this.addRadioButton("Expert", "other_player", panel, start_row + 4, 1);
    }

    private addImageRadio(name: string, path: string, parent: GUI.Grid, row: number, column: number, active?: boolean) {
        let button: GUI.Button = GUI.Button.CreateImageOnlyButton(name, path);
        button.name = name.toLowerCase();
        button.width = `${DOM.IMAGE_WIDTH}px`;
        button.height = `${DOM.IMAGE_ROW_HEIGHT - DOM.PADDING}px`;
        button.color = DOM.PRIMARY_COLOR;
        button.background = DOM.BACKGROUND_COLOR;
        button.cornerRadius = DOM.CORNER_RADIUS;

        if (active) {
            this.setAvatarChoice(button)
        }

        button.onPointerDownObservable.add(() => {
            this.setAvatarChoice(button);
        });

        parent.addControl(button, row, column);
    }

    private addRadioButton(text: string, group: string, parent: GUI.Grid, row: number, col: number, checked = false) {
        let button = new GUI.RadioButton();
        button.name = text.toLowerCase();
        button.width = `${DOM.RADIO_ROW_HEIGHT - DOM.PADDING}px`;
        button.height = `${DOM.RADIO_ROW_HEIGHT - DOM.PADDING}px`;
        button.color = DOM.PRIMARY_COLOR;
        button.background = DOM.SECONDARY_COLOR;
        button.group = group;
        button.isChecked = checked;

        if (checked) {
            if (group === "controller") {
                this.controller = button;
            } else {
                this.other_player = button;
            }
        }

        button.onPointerDownObservable.add(() => {
            if (group === "controller") {
                this.setControllerChoice(button)
            } else {
                this.setOtherPlayerChoice(button);
            }
        });

        let header: GUI.Control = GUI.Control.AddHeader(button, text, `${DOM.IMAGE_WIDTH}px`, {
            isHorizontal: true,
            controlFirst: true
        });
        header.height = `${DOM.RADIO_ROW_HEIGHT - DOM.PADDING}px`;
        header.color = DOM.PRIMARY_COLOR;
        header.fontSize = `${DOM.FONT_SIZE_TEXT}px`;
        parent.addControl(header, row, col);
    }

    private static addChoiceTitle(text: string, row: number, col: number, panel: GUI.Grid) {
        let textblock = new GUI.TextBlock();
        textblock.height = `${DOM.TITLE_ROW_HEIGHT}px`;
        textblock.fontSize = `${DOM.FONT_SIZE_TITLE}px`;
        textblock.color = DOM.PRIMARY_COLOR;
        textblock.text = text;
        textblock.fontWeight = "bold";
        panel.addControl(textblock, row, col);
    }

    private addSubmitButton(panel: GUI.Grid, row, col) {
        let button = GUI.Button.CreateSimpleButton("submit", "Start Game!");
        button.width = `${DOM.BUTTON_WIDTH}px`;
        button.height = `${DOM.BUTTON_ROW_HEIGHT - DOM.PADDING}px`;
        button.color = DOM.SECONDARY_COLOR;
        button.fontSize = `${DOM.FONT_SIZE_TEXT}px`;
        button.cornerRadius = DOM.CORNER_RADIUS;
        button.background = DOM.PRIMARY_COLOR;
        button.onPointerDownObservable.add(() => {
            this.submitReadyPlayer();
        });
        panel.addControl(button, row, col);
    }

    private static addRows(panel: GUI.Grid, height: number, amount: number) {
        for (let i = 0; i < amount; i++) {
            panel.addRowDefinition(height, true)
        }
    }

    private setControllerChoice(button: GUI.RadioButton) {
        this.controller = button;
    }

    private setAvatarChoice(button: GUI.Button) {
        if (this.avatar !== null) {
            this.avatar.background = DOM.BACKGROUND_COLOR;
        }
        this.avatar = button;
        button.background = DOM.PRIMARY_COLOR;
    }

    private setOtherPlayerChoice(button: GUI.RadioButton) {
        this.other_player = button;
    }

    private fetchPlayerData(): IPlayerData {
        return (this.game.own_color === "white")
            ? new IPlayerData(this.game.own_color, this.controller.name, this.avatar.name, "human", this.other_player.name)
            : new IPlayerData(this.game.own_color, this.controller.name, this.avatar.name, "human");
    }

    private submitReadyPlayer() {
        const data: IPlayerData = this.fetchPlayerData();
        this.emitPlayerData(data);
    }


    private emitPlayerData(data: IPlayerData) {
        this.game.app.connection.emitPlayerData(data);
    }
}