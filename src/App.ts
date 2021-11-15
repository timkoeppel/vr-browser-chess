import Game from "./Game";
import {GazeController} from "./GazeController";

/**
 * App is the main module
 */
class App {
    constructor() {
        let game = new Game();
        game.initiate().then(() => {
                console.log(game);
                game.DoRender();
            }
        ).catch(error => {
            console.log(error)
        })
    }
}

new App();