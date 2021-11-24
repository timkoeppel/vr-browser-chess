import Game from "./Game";

/**
 * App is the main module
 */
export class App {
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

//new App();