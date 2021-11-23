import { Controller } from "./Controller";
import Game from "./Game";
export declare class VoiceController extends Controller {
    get grammar(): any;
    set grammar(value: any);
    get client(): any;
    set client(value: any);
    private _client;
    private _grammar;
    constructor(game: Game);
    /**
     * Initiates the WebSpeechAPI Client with all its properties and event functions
     */
    initiate(): void;
    /**
     * Get all chess field position names upper and lower case, e.g. "A8", ...
     * @private
     */
    private static getAllChessFieldNames;
    /**
     * Initiate grammar properties
     * @private
     */
    private initiateGrammar;
    /**
     * Initiate client properties
     * @private
     */
    private initiateClient;
    /**
     * Optimize the transcript to the chess positions and commands by replacing words
     * @param transcript
     * @private
     */
    private static optimizeTranscript;
    /**
     * Extract the chess position from a transcript command
     * @param transcript
     * @private
     */
    private static extractPosition;
    /**
     * The dictionary used for the transcription optimization
     * @private
     */
    private static optimize_dict;
}
