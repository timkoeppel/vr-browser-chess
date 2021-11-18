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
        this.initiateGrammar();
        this.initiateClient();
        this.client.start()

        // RESULT
        this.client.onresult = (event) => {
            let current_transcript = '';
            // Transcript preparation
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                current_transcript += event.results[i][0].transcript;
            }
            const transcript = VoiceController.optimizeTranscript(current_transcript);

            // Transcript evaluation
            if(transcript.includes("select")){
                // TODO selection
            }else if(transcript.includes("move")){
                // TODO Move
            }
            console.log('You said:"' + transcript +'"');
        }

        // PREVENT LISTENING STOP
        this.client.onend = (event) => {
            this.client.start();
        }

    }


    // ************************************************************************
    // HELPER METHODS
    // ************************************************************************
    private static createAllChessFields() : Array<string>{
        const char_codes = [97, 65];
        let chess_fields = [];
        char_codes.forEach(char_code => {
            for(let i = 0; i < 8; i++){
                for( let j = 1; j <= 8;j++){
                    const letter = String.fromCharCode(char_code + i);
                    chess_fields.push(letter + j);
                }
            }
        })

        return chess_fields;
    }

    private initiateGrammar(){
        let fields_and_commands = [ 'select', 'move to'].concat(VoiceController.createAllChessFields());
        let grammar = '#JSGF V1.0; grammar fields; public <fields> = ' + fields_and_commands.join(' | ') + ' ;'

        this.grammar.addFromString(grammar, 1);
        this.grammar.grammars = this.grammar;
    }

    private initiateClient(){
        this.client.continuous = true;
        this.client.interimResults = false;
        this.client.lang = "en-US";
    }

    private static optimizeTranscript(transcript: string): string {
        const dict = {
            // Letters (with space)
            "a ": "A",
            "be ": "B",

            // Numbers
            "to": "2",
            "too": "2",
            "free": "3",

            // Both
            "ASICS": "A6",
            "before": "B4"
        }

        let optimized = transcript;
        for (const [key, value] of Object.entries(dict)) {
            optimized = optimized.replace(key, value);
        }
;
        return optimized;
    }

}