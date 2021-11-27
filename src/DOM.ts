export class WindowManager{
    public game_canvas: HTMLCanvasElement;
    public game_menu: 


    constructor() {
    }

    public static showElement(elem: Element): void {
        elem.classList.remove("no_display");
    }

    public static hideElement(elem: Element): void{
        elem.classList.add("no_display")
    }

    public static switchToGameScreen(): void{
        let canvas = document.getElementById("gameCanvas");
        let menu = document.getElementById("gameMenu");

        WindowManager.showElement(canvas);
        WindowManager.hideElement(menu);
    }

    public static manageControllerHelp
}