import Game from "./Game";

class App {
    constructor() {
        let game = new Game();
        game.CreateScene().then(() => {
                game.DoRender()
            }
        ).catch(error => {
            console.log(error)
        })
    }
}

new App();