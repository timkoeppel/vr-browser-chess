import Game from "./game";

class App {
    constructor() {
        let game = new Game();
        game.CreateScene();
        game.DoRender();
    }
}

new App();