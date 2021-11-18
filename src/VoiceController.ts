import {Controller} from "./Controller";
import Game from "./Game";


export class VoiceController extends Controller {
    get grammar(): any {
        return this._grammar;
    }

    set grammar(value: any) {
        this._grammar = value;
    }
    get client(): any {
        return this._client;
    }

    set client(value: any) {
        this._client = value;
    }

    private _client: any;
    private _grammar: any;

    constructor(game: Game) {
        const {webkitSpeechRecognition} = (window as any);
        const {webkitSpeechGrammarList} = (window as any);

        super(game);
        this.game = game;
        this.client = new webkitSpeechRecognition();
        this.grammar = new webkitSpeechGrammarList();
    }

    public initiate(){
        let colors = [ 'aqua' , 'azure' , 'beige', 'bisque', 'black', 'blue', 'brown', 'chocolate', 'coral'];
        let grammar = '#JSGF V1.0; grammar colors; public <color> = ' + colors.join(' | ') + ' ;'

        this.grammar.addFromString(grammar, 1);
        this.grammar.grammars = this.grammar;


        this.client.continuous = true;
        this.client.interimResults = true;
        this.client.lang = "en-GB";
        this.client.start()

        this.client.onresult = (event) => {
            let res = event.results[0][0].transcript;
            console.log(res);
        }

        this.client.onnomatch = (event) => {
            console.log('I didnt recognize that color.');
        }

        console.log(this.client);


    }

}