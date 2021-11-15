import {Controller} from "./Controller";
import Game from "./Game";

export class VoiceController extends Controller{

    constructor(game: Game) {
        super(game);

        this.game = game;
    }
}