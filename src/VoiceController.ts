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

    // ************************************************************************
    // MAIN METHODS
    // ************************************************************************
    /**
     * Initiates the WebSpeechAPI Client with all its properties and event functions
     */
    public initiate() {
        this.initiateGrammar();
        this.initiateClient();
        this.client.start()

        // ON RESULT
        this.client.onresult = (event) => {
            let current_transcript = '';
            // Transcript preparation
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                current_transcript += event.results[i][0].transcript;
            }

            // Evaluate the optimized transcript
            VoiceController.optimizeTranscript(current_transcript).then(transcript => {
                // SELECT
                if (transcript.includes("select") || transcript.includes("move")) {
                    const pos = VoiceController.extractPosition(transcript);
                    if (pos !== "") {
                        const chess_field = this.game.chessboard.getField(pos);
                        this.game.chessboard.state.processClick(chess_field);
                    }
                }
            })
        }

        // PREVENT LISTENING STOP (After a time the recording mode stops)
        this.client.onend = (event) => {
            this.client.start();
        }

    }

    // ************************************************************************
    // HELPER METHODS
    // ************************************************************************
    /**
     * Get all chess field position names upper and lower case, e.g. "A8", ...
     * @private
     */
    private static getAllChessFieldNames(): Array<string> {
        const char_codes = [65, 97];
        let chess_fields = [];

        char_codes.forEach(char_code => {
            for (let i = 0; i < 8; i++) {
                for (let j = 1; j <= 8; j++) {
                    const letter = String.fromCharCode(char_code + i);
                    chess_fields.push(letter + j);
                }
            }
        })
        return chess_fields;
    }

    /**
     * Initiate grammar properties
     * @private
     */
    private initiateGrammar() {
        let fields_and_commands = ['select', 'move to'].concat(VoiceController.getAllChessFieldNames());
        let grammar = '#JSGF V1.0; grammar fields; public <fields> = ' + fields_and_commands.join(' | ') + ' ;'

        this.grammar.addFromString(grammar, 1);
        this.grammar.grammars = this.grammar;
    }

    /**
     * Initiate client properties
     * @private
     */
    private initiateClient() {
        this.client.continuous = true;
        this.client.interimResults = false;
        this.client.lang = "en-US";
    }

    /**
     * Optimize the transcript to the chess positions and commands by replacing words
     * @param transcript
     * @private
     */
    private static async optimizeTranscript(transcript: string): Promise<string> {
        let optimized = transcript;
        for (const [key, value] of Object.entries(this.optimize_dict)) {
            optimized = optimized.replace(key, value);
        }
        return optimized;
    }

    /**
     * Extract the chess position from a transcript command
     * @param transcript
     * @private
     */
    private static extractPosition(transcript: string): string {
        const chess_positions = VoiceController.getAllChessFieldNames();
        let result = "";

        chess_positions.forEach(pos => {
            if (transcript.includes(pos)) {
                result = pos.toUpperCase();
            }
        })
        return result;
    }

    /**
     * The dictionary used for the transcription optimization
     * @private
     */
    private static optimize_dict = {
        // Letters (with occasional space to bring positions together)
        "a ": "A",
        "be ": "B",
        "by ": "B",
        "see ": "C",
        "Die ": "D",
        "die ": "D",
        "T": "G",
        "she ": "G",
        "gu": "G",
        "GU": "G",
        "20": "H",
        "age ": "H",

        // Numbers
        "one": "1",
        "to": "2",
        "too": "2",
        "free": "3",
        "for": "4",

        // Both
        "ASICS": "A6",
        "before": "B4",
        "ch": "C8",
        "DY1": "D1",
        "fh4": "F4",
        "T5": "G5",
        "C8eese 7": "G7",
        "81": "H1",
        "82": "H2",
        "83": "H3",
    }

}