import Game from "./Game";

class App {
    constructor() {
        let game = new Game();
        game.initiate().then(() => {
                game.DoRender()
            }
        ).catch(error => {
            console.log(error)
        })
    }
}

new App();