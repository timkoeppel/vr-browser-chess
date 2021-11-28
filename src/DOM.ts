import {IPlayerData} from "./IPlayerData";
import {App} from "./App";


export class DOM {
    get app(): App {
        return this._app;
    }

    set app(value: App) {
        this._app = value;
    }

    private _app: App;
    public game_canvas: HTMLElement;
    public game_menu: HTMLElement;
    public name_input: HTMLInputElement;
    public colors: NodeListOf<HTMLElement>;
    public voice_input: HTMLElement;
    public voice_help: HTMLElement;
    public gaze_input: HTMLElement;
    public gaze_help: HTMLElement;
    public lobby_list: HTMLElement;
    public player_1_lobby: HTMLElement;
    public player_2_lobby: HTMLElement;
    public ready_button: HTMLElement;

    constructor(app: App) {
        this.app = app;

        // DOM
        this.game_canvas = document.getElementById("gameCanvas");
        this.game_menu = document.getElementById("gameMenu");
        this.name_input = <HTMLInputElement>document.getElementById("player_name");
        this.colors = document.getElementsByName("color");
        this.voice_input = document.getElementById("voice");
        this.voice_help = document.getElementById("voice_help");
        this.gaze_input = document.getElementById("gaze");
        this.gaze_help = document.getElementById("gaze_help");
        this.lobby_list = document.getElementById("lobby");
        this.player_1_lobby = document.getElementById("player_1-lobby");
        this.player_2_lobby = document.getElementById("player_2-lobby");
        this.ready_button = document.getElementById("ready_btn");

        // Event Listener
        this.name_input.addEventListener("change", () => this.handleReadyAccessButton());
        this.voice_input.addEventListener("click", () => this.showVoiceHelp());
        this.gaze_input.addEventListener("click", () => this.showGazeHelp());
        this.game_menu.addEventListener("change", () => this.emitPlayerChange());
        this.ready_button.addEventListener("click", (e) => this.submitReadyPlayer(e));
    }

    public showElement(elem: Element): void {
        elem.classList.remove("no_display");
    }

    public hideElement(elem: Element): void {
        elem.classList.add("no_display");
    }

    public enableElement(elem: Element): void {
        elem.classList.remove("disable");
    }

    public disableElement(elem: Element): void {
        elem.classList.add("disable");
    }

    public switchToGameScreen(): void {
        this.showElement(this.game_canvas);
        this.hideElement(this.game_menu);
    }

    private fetchPlayerData(): IPlayerData {
        return new IPlayerData(
            this.name_input.value,
            DOM.getActiveRadio("color"),
            DOM.getActiveRadio("avatar"),
            DOM.getActiveRadio("controller"),
            DOM.getActiveRadio("ai")
        )
    }

    public refreshPlayerOne(data: IPlayerData): void {
        console.log(data);
        this.player_1_lobby.innerText = `[HUMAN][${data.color.toUpperCase()}] ${data.name}`;
    }

    public refreshPlayerTwo(data: IPlayerData): void {
        this.player_2_lobby.innerText = `[HUMAN][${data.color.toUpperCase()}] ${data.name}`;
    }

    private handleReadyAccessButton() {
        if (this.name_input.value === "") {
            this.disableElement(this.ready_button);
        } else {
            this.enableElement(this.ready_button);
        }
    }

    private showVoiceHelp(): void {
        this.showElement(this.voice_help);
        this.hideElement(this.gaze_help);
    }

    private showGazeHelp(): void {
        this.showElement(this.gaze_help);
        this.hideElement(this.voice_help);
    }

    private static getActiveRadio(group_name: string) {
        const selector = `input[name=${group_name}]:checked`;
        const input = <HTMLInputElement>document.querySelector(selector);
        return input.id;
    }

    private submitReadyPlayer(e: Event) {
        e.preventDefault();
        this.disableElement(this.ready_button);
        this.ready_button.innerHTML = `<div class="spinner-border spinner-border-sm text-light" role="status"> 
                                       <span class="visually-hidden">Loading...</span><span class="visually-hidden">Waiting for other player ...</span></div\>`;
        this.emitPlayerReadiness();
    }

    private emitPlayerReadiness() {
        this.app.connection.emitPlayerReadiness();
    }

    public emitPlayerChange() {
        const player_data = this.fetchPlayerData();
        this.refreshPlayerOne(player_data);
        this.emitPlayerData(player_data);
    }


    private emitPlayerData(data: IPlayerData) {
        this.app.connection.emitPlayerData(data);
    }
}