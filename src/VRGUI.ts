import {IPlayerData} from "./IPlayerData";
import * as BABYLON from "@babylonjs/core";
import * as GUI from 'babylonjs-gui';
import Game from "./Game";
import {Avatar} from "./Avatar";

/**
 * VRGUI regulates the 3D GUI of the game screen
 */
export class VRGUI {
    get selector_cross_v(): GUI.Rectangle {
        return this._selector_cross_v;
    }
    set selector_cross_v(value: GUI.Rectangle) {
        this._selector_cross_v = value;
    }
    get selector_cross_h(): GUI.Rectangle {
        return this._selector_cross_h;
    }

    set selector_cross_h(value: GUI.Rectangle) {
        this._selector_cross_h = value;
    }
    get message_screen(): GUI.Rectangle {
        return this._message_screen;
    }

    set message_screen(value: GUI.Rectangle) {
        this._message_screen = value;
    }

    get game_menu_grid(): GUI.Grid {
        return this._game_menu_grid;
    }

    set game_menu_grid(value: GUI.Grid) {
        this._game_menu_grid = value;
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
    private _message_screen: GUI.Rectangle;
    private _game_menu: BABYLON.AbstractMesh;
    private _game_menu_grid: GUI.Grid;
    private _selector_cross_h: GUI.Rectangle;
    private _selector_cross_v: GUI.Rectangle;

    /**
     * Initiates the 3D VRGUI for the game
     * @param own_color important for not showing the other-player-choice
     * @param game
     * @param scene
     */
    constructor(own_color, game: Game, scene: BABYLON.Scene) {
        this.game = game;
        this.scene = scene;
        this.controller = null;
        this.avatar = null;
        this.other_player = null;

        this.initiateGameMenu(own_color);
        this.askPermissions();
    }

    // ************************************************************************
    // CONSTANTS
    // ************************************************************************
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
    private static PRIMARY_COLOR = "#FFFFFF";
    private static SECONDARY_COLOR = "#222222";
    private static BACKGROUND_COLOR = "transparent";
    private static WARNING_COLOR = "red";


    // ************************************************************************
    // MAIN METHODS
    // ************************************************************************

    public askPermissions(): void {
        // Microphone
        navigator.mediaDevices.getUserMedia({audio: true})
            .then(function (stream) {
                console.log('Microphone access granted!')
            })
            .catch(function (err) {
                console.log('Microphone access denied!')
            });
    }

    /**
     * Redirect method if lobby is full
     * @param location
     */
    public lobbyFullRedirect(location: string) {
        alert(`Lobby is full! Please try later again!`);
        setTimeout(() => {
            window.location.href = location
        }, 2000);
    }

    /**
     * Refresh method when the other player disconnected (prevents dysfunctional game with no other player)
     * @param other_player_color
     */
    public refreshThroughOtherPlayerDisconnect(other_player_color: "white" | "black"): void {
        this.displayMessage(`Player ${other_player_color} has disconnected.`, "important");
        setTimeout(() => {
            window.location.reload();
        }, 2000);
    }

    public initiateCross(): void {
        // @ts-ignore
        let texture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("cross_screen", true, this.scene);
        this.selector_cross_h = new GUI.Rectangle("cross_horizontal");
        this.selector_cross_v = new GUI.Rectangle("cross_vertical");

        [this.selector_cross_v, this.selector_cross_h].forEach(cross => {
            cross.isVisible = true;
            cross.background = VRGUI.PRIMARY_COLOR;
            cross.color = VRGUI.PRIMARY_COLOR;
            cross.width = (cross.name === "cross_horizontal") ? "15px" : "6px";
            cross.height = (cross.name === "cross_horizontal") ?"2px" : "8px";
            cross.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
            cross.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;

            texture.addControl(cross);
        });
    }

    /**
     * Creates the game menu for the
     * @param player_color
     */
    public initiateGameMenu(player_color: "white" | "black") {
        this.initiateGameMenuMesh();
        this.initiateGameMenuGrid(player_color);

        // Menu building
        let avatar_row: number = 3;
        let submit_row: number = 6;
        this.createControllerChoice(this.game_menu_grid, 0);
        if (player_color === "white") {
            avatar_row = 8;
            submit_row = 11;
            this.createAIOrHumanChoice(this.game_menu_grid, 3);
        }
        this.createAvatarChoice(this.game_menu_grid, avatar_row);
        this.addSubmitButton(this.game_menu_grid, "START GAME", submit_row, 1);
    }

    /**
     * Hides the Game Menu
     */
    public hidePanel(panel: BABYLON.AbstractMesh): void {
        panel.visibility = 0;
        panel.setEnabled(false);
    }


    public hideScreen(screen: GUI.Rectangle) {
        screen.isVisible = false;
    }

    public showScreen(screen: GUI.Rectangle) {
        screen.isVisible = true;
    }

    /**
     * Initiates the waiting screen after player ready
     */
    public displayMessage(message: string, type: "warning" | "important"): void {
        // @ts-ignore
        let texture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("loading", true, this.scene);
        this.message_screen = new GUI.Rectangle("waiting_panel");
        this.message_screen.width = "500px";
        this.message_screen.height = "50px";
        this.message_screen.cornerRadius = VRGUI.CORNER_RADIUS;
        this.message_screen.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.message_screen.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        texture.addControl(this.message_screen);
        let text = new GUI.TextBlock("message", message);

        if (type === "warning") {
            this.message_screen.background = VRGUI.WARNING_COLOR;
            text.color = VRGUI.PRIMARY_COLOR;
        } else if (type === "important") {
            this.message_screen.background = VRGUI.PRIMARY_COLOR;
            text.color = VRGUI.SECONDARY_COLOR;
        }
        this.message_screen.addControl(text);
    }

    /**
     * Initiates the game menu mesh
     */
    public initiateGameMenuMesh(): void {
        this.game_menu = BABYLON.MeshBuilder.CreatePlane("plane", {height: 50, width: 40}) as BABYLON.AbstractMesh;
        this.game_menu.position = new BABYLON.Vector3(60, 45, 0);
        this.game_menu.rotate(new BABYLON.Vector3(0, 1, 0), -Math.PI / 2);
    }

    /**
     * Initiates the grid on which the game menu is based
     * @param player_color
     */
    public initiateGameMenuGrid(player_color: "white" | "black"): void {
        // Grid Panel Init
        this.game_menu_grid = new GUI.Grid();
        this.game_menu_grid.background = VRGUI.BACKGROUND_COLOR;
        this.game_menu_grid.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        this.game_menu_grid.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;

        // @ts-ignore
        let advancedTexture = GUI.AdvancedDynamicTexture.CreateForMesh(this.game_menu, 1024, 1024);
        advancedTexture.addControl(this.game_menu_grid);

        // Layout
        this.game_menu_grid.addColumnDefinition(0.25);
        this.game_menu_grid.addColumnDefinition(0.5);
        this.game_menu_grid.addColumnDefinition(0.25);
        VRGUI.addRows(this.game_menu_grid, VRGUI.TITLE_ROW_HEIGHT, 1); // Controller title
        VRGUI.addRows(this.game_menu_grid, VRGUI.RADIO_ROW_HEIGHT, 2); // Controller
        if (player_color === "white") {
            VRGUI.addRows(this.game_menu_grid, VRGUI.TITLE_ROW_HEIGHT, 1); // Other player title
            VRGUI.addRows(this.game_menu_grid, VRGUI.RADIO_ROW_HEIGHT, 4); // Other player
        }
        VRGUI.addRows(this.game_menu_grid, VRGUI.TITLE_ROW_HEIGHT, 1); // Avatars title
        VRGUI.addRows(this.game_menu_grid, VRGUI.IMAGE_ROW_HEIGHT, 2); // Avatars
        VRGUI.addRows(this.game_menu_grid, VRGUI.BUTTON_ROW_HEIGHT, 1); // Submit
    }

    /**
     * Creates the Controller choice panel
     * @param panel
     * @param start_row
     * @private
     */
    private createControllerChoice(panel: GUI.Grid, start_row: number) {
        VRGUI.addChoiceTitle("Controller:", start_row, 1, panel);
        this.addRadioButton("Voice", "controller", panel, start_row + 1, 1, true);
        this.addRadioButton("Gaze", "controller", panel, start_row + 2, 1);
    }

    /**
     * Creates the Avatar choice panel
     * @param panel
     * @param start_row
     * @private
     */
    private createAvatarChoice(panel: GUI.Grid, start_row: number) {
        VRGUI.addChoiceTitle("Avatar:", start_row, 1, panel);

        this.addAvatarImageRadio("male_01", Avatar.MALE_01_PATH, panel, start_row + 1, 0, true);
        this.addAvatarImageRadio("male_02", Avatar.MALE_02_PATH, panel, start_row + 1, 1);
        this.addAvatarImageRadio("male_03", Avatar.MALE_03_PATH, panel, start_row + 1, 2);
        this.addAvatarImageRadio("female_01", Avatar.FEMALE_01_PATH, panel, start_row + 2, 0);
        this.addAvatarImageRadio("female_02", Avatar.FEMALE_02_PATH, panel, start_row + 2, 1);
        this.addAvatarImageRadio("female_03", Avatar.FEMALE_03_PATH, panel, start_row + 2, 2);
    }

    /**
     * Creates the other-player choice panel (white only)
     * @param panel
     * @param start_row
     * @private
     */
    private createAIOrHumanChoice(panel: GUI.Grid, start_row: number) {
        VRGUI.addChoiceTitle("Other Player:", start_row, 1, panel);
        this.addRadioButton("Human", "other_player", panel, start_row + 1, 1, true);
        this.addRadioButton("Easy", "other_player", panel, start_row + 2, 1);
        this.addRadioButton("Intermediate", "other_player", panel, start_row + 3, 1);
        this.addRadioButton("Expert", "other_player", panel, start_row + 4, 1);
    }

    /**
     * Changes the default Enter XR button
     * @param overlay
     */
    public static showEnterVRDisplay(overlay: HTMLDivElement): void{
        let button = overlay.children[0] as HTMLButtonElement;
        let instruction = document.createElement('label') as HTMLLabelElement;

        // overlay
        VRGUI.showHTMLElement(overlay);
        overlay.classList.add('overlay');


        // instruction
        overlay.appendChild(instruction);
        instruction.classList.add('instruction');
        instruction.htmlFor = button.id;
        instruction.innerText = "Click to enter VR";

        // button style
        button.classList.add('vr-button');
    }



    // ************************************************************************
    // HELPER METHODS
    // ************************************************************************

    /**
     * Adds an avatar image radio button to a grid
     * @param name
     * @param path The image path
     * @param parent The parent grid
     * @param row The row in the grid
     * @param column The column in the grid
     * @param active If radio button should be the active one in the group
     * @private
     */
    private addAvatarImageRadio(name: string, path: string, parent: GUI.Grid, row: number, column: number, active?: boolean) {
        let button: GUI.Button = GUI.Button.CreateImageOnlyButton(name, path);
        button.name = name.toLowerCase();
        button.width = `${VRGUI.IMAGE_WIDTH}px`;
        button.height = `${VRGUI.IMAGE_ROW_HEIGHT - VRGUI.PADDING}px`;
        button.color = VRGUI.PRIMARY_COLOR;
        button.background = VRGUI.BACKGROUND_COLOR;
        button.cornerRadius = VRGUI.CORNER_RADIUS;

        if (active) {
            this.setAvatarChoice(button)
        }

        button.onPointerDownObservable.add(() => {
            this.setAvatarChoice(button);
        });

        parent.addControl(button, row, column);
    }

    /**
     * Adds a default Radio button choice to the given grid
     * @param text
     * @param group
     * @param parent
     * @param row
     * @param col
     * @param checked
     * @private
     */
    private addRadioButton(text: string, group: string, parent: GUI.Grid, row: number, col: number, checked = false) {
        let button = new GUI.RadioButton();
        button.name = text.toLowerCase();
        button.width = `${VRGUI.RADIO_ROW_HEIGHT - VRGUI.PADDING}px`;
        button.height = `${VRGUI.RADIO_ROW_HEIGHT - VRGUI.PADDING}px`;
        button.color = VRGUI.PRIMARY_COLOR;
        button.background = VRGUI.BACKGROUND_COLOR;
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

        let header: GUI.Control = GUI.Control.AddHeader(button, text, `${VRGUI.IMAGE_WIDTH}px`, {
            isHorizontal: true,
            controlFirst: true
        });
        header.height = `${VRGUI.RADIO_ROW_HEIGHT - VRGUI.PADDING}px`;
        header.color = VRGUI.PRIMARY_COLOR;
        header.fontSize = `${VRGUI.FONT_SIZE_TEXT}px`;
        parent.addControl(header, row, col);
    }

    /**
     * Adds a title for the following choice to the given grid
     * @param text
     * @param row
     * @param col
     * @param panel
     * @private
     */
    private static addChoiceTitle(text: string, row: number, col: number, panel: GUI.Grid) {
        let textblock = new GUI.TextBlock();
        textblock.height = `${VRGUI.TITLE_ROW_HEIGHT}px`;
        textblock.fontSize = `${VRGUI.FONT_SIZE_TITLE}px`;
        textblock.color = VRGUI.PRIMARY_COLOR;
        textblock.text = text;
        textblock.fontWeight = "bold";
        panel.addControl(textblock, row, col);
    }

    /**
     * Adds a submit button to the given grid
     * @param panel
     * @param text
     * @param row
     * @param col
     * @private
     */
    private addSubmitButton(panel: GUI.Grid, text: string, row: number, col: number) {
        let button = GUI.Button.CreateSimpleButton("submit", text);
        button.width = `${VRGUI.BUTTON_WIDTH}px`;
        button.height = `${VRGUI.BUTTON_ROW_HEIGHT - VRGUI.PADDING}px`;
        button.color = VRGUI.SECONDARY_COLOR;
        button.fontSize = `${VRGUI.FONT_SIZE_TEXT}px`;
        button.fontWeight = "bold";
        button.thickness = 0;
        button.cornerRadius = VRGUI.CORNER_RADIUS;
        button.background = VRGUI.PRIMARY_COLOR;
        button.onPointerDownObservable.add(() => {
            this.submitReadyPlayer();
        });
        panel.addControl(button, row, col);
    }

    /**
     * Adds several rows for the grid initialization
     * @param panel
     * @param height
     * @param amount
     * @private
     */
    private static addRows(panel: GUI.Grid, height: number, amount: number) {
        for (let i = 0; i < amount; i++) {
            panel.addRowDefinition(height, true)
        }
    }

    /**
     * Sets the controller choice (active radio) variable ready for fetching
     * @param button
     * @private
     */
    private setControllerChoice(button: GUI.RadioButton): void {
        this.controller = button;
    }

    /**
     * Sets the avatar choice (active radio) variable ready for fetching
     * @param button
     * @private
     */
    private setAvatarChoice(button: GUI.Button): void {
        if (this.avatar !== null) {
            this.avatar.background = VRGUI.BACKGROUND_COLOR;
        }
        this.avatar = button;
        button.background = VRGUI.PRIMARY_COLOR;
    }

    /**
     * Sets the other player choice (active radio) variable ready for fetching
     * @param button
     * @private
     */
    private setOtherPlayerChoice(button: GUI.RadioButton): void {
        this.other_player = button;
    }

    /**
     * Shows an HTML element
     * @param element
     */
    public static showHTMLElement(element: HTMLElement) {
        element.classList.remove("no-display");
    }

    /**
     * Hides an HTML element
     * @param element
     */
    public static hideHTMLElement(element: HTMLElement) {
        element.classList.add("no-display");
    }

    /**
     * Fetches the needed data to the PlayerData interface
     * @private
     */
    private fetchPlayerData(): IPlayerData {
        return (this.game.own_color === "white")
            ? new IPlayerData(this.game.own_color, this.controller.name, this.avatar.name, "human", this.other_player.name)
            : new IPlayerData(this.game.own_color, this.controller.name, this.avatar.name, "human");
    }

    /**
     * Submits the ready player
     * @private
     */
    private submitReadyPlayer() {
        const data: IPlayerData = this.fetchPlayerData();
        this.emitPlayerData(data);
    }

    /**
     * Emits the ready player to the server
     * @param data
     * @private
     */
    private emitPlayerData(data: IPlayerData) {
        this.game.app.connection.emitPlayerData(data);
    }
}