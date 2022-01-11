import {ChessState} from "./ChessState";
import {Chess, Move} from "chess.ts";

/**
 * AI manages all AI related movements
 */
export class AI {
    get color(): "white" | "black" {
        return this._color;
    }

    set color(value: "white" | "black") {
        this._color = value;
    }

    get difficulty(): "easy" | "intermediate" | "expert" {
        return this._difficulty;
    }

    set difficulty(value: "easy" | "intermediate" | "expert") {
        this._difficulty = value;
    }

    get chess_state(): ChessState {
        return this._chess_state;
    }

    set chess_state(value: ChessState) {
        this._chess_state = value;
    }

    private _chess_state: ChessState;
    private _difficulty: "easy" | "intermediate" | "expert";
    private _color: "white" | "black";

    constructor(difficulty: "easy" | "intermediate" | "expert", color: "white" | "black", state: ChessState) {
        this.chess_state = state;
        this.difficulty = difficulty;
        this.color = color;
    }


    // ************************************************************************
    // MAIN METHODS
    // ************************************************************************

    /**
     * Gets the move according to the AI difficulty
     */
    public getMove(): Move {
        switch (this.difficulty) {
            case "easy":
                return this.getRandomMove();
            case "intermediate":
                return this.getAlphaBetaMove("intermediate");
            case "expert":
                return this.getAlphaBetaMove("expert");
        }
    }

    /**
     * Gets random available move, capture moves are priotized (used for the wasy AI)
     */
    private getRandomMove(): Move {
        const t1 = performance.now();
        const available_moves = ChessState.toUpperNotationMulti(this.chess_state.logic.moves({verbose: true}));
        let chosen_move = available_moves[Math.floor(Math.random() * available_moves.length)];

        // If capture move
        /*available_moves.forEach(m => {
            if (ChessState.isCapture(m)) {
                chosen_move = m;
            }
        });*/
        const t2 = performance.now();
        this.chess_state.game.app.connection.emitEasy((t2 - t1).toFixed(2));
        return chosen_move;
    }

    /**
     * Gets the best move from the alpha-beta-pruning of the current board config depending on the difficulty
     * intermediate depth: 2
     * expert depth: 4
     * @private
     */
    private getAlphaBetaMove(difficulty: "intermediate" | "expert"): Move {
        const t1 = performance.now();
        let game_copy: Chess = Object.assign(new Chess(), this.chess_state.logic);
        const is_max_player = this.color === "black";
        const depth = (difficulty === "intermediate") ? 2 : 4;
        const minimax_result = this.minimax(game_copy, depth, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, is_max_player, 0);
        const t2 = performance.now();
        (difficulty === "intermediate") ? this.chess_state.game.app.connection.emitIntermediate((t2 - t1).toFixed(2))
        : this.chess_state.game.app.connection.emitExpert((t2 - t1).toFixed(2));


        return minimax_result[0];
    }

    /**
     * Evaluates the board dependent of the pieces on the board and its positions
     * @param _move
     * @param prev_sum
     * @private
     */
    private evaluate(_move: Move, prev_sum: number): number {
        let move = ChessState.toUpperNotationSingle(_move);
        let from = [8 - parseInt(move.from[1]), move.from.charCodeAt(0) - 'A'.charCodeAt(0)];
        let to = [8 - parseInt(move.to[1]), move.to.charCodeAt(0) - 'A'.charCodeAt(0)];
        // @ts-ignore
        let move_color = (move.color === "W") ? "white" : "black";
        let piece_weights = AI.FIGURE_WEIGHTS;
        let own_field_weights = (this.color === "white") ? AI.FIELD_WEIGHTS_W : AI.FIELD_WEIGHTS_B;
        let other_field_weights = (this.color === "white") ? AI.FIELD_WEIGHTS_B : AI.FIELD_WEIGHTS_W;

        if (ChessState.isCapture(move)) {
            // Opponent piece was captured
            if (move_color === this.color) {
                prev_sum += (piece_weights[move.captured] + own_field_weights[move.captured][to[0]][to[1]]);
            }
            // Our piece was captured
            else {
                prev_sum -= (piece_weights[move.captured] + other_field_weights[move.captured][to[0]][to[1]]);
            }
        }

        if (move.flags.includes('P')) {
            // NOTE: promote to queen for simplicity
            // @ts-ignore
            move.promotion = 'Q';

            // Promotion for max_player
            if (move_color === this.color) {
                prev_sum -= (piece_weights[move.piece] + own_field_weights[move.piece][from[0]][from[1]]);
                prev_sum += (piece_weights[move.promotion] + own_field_weights[move.promotion][to[0]][to[1]]);
            }
            // Promotion for min_player
            else {
                prev_sum += (piece_weights[move.piece] + own_field_weights[move.piece][from[0]][from[1]]);
                prev_sum -= (piece_weights[move.promotion] + own_field_weights[move.promotion][to[0]][to[1]]);
            }
        } else {
            // The moved piece still exists on the updated board, so we only need to update the position value
            if (move_color !== this.color) {
                prev_sum += own_field_weights[move.piece][from[0]][from[1]];
                prev_sum -= own_field_weights[move.piece][to[0]][to[1]];
            } else {
                prev_sum -= own_field_weights[move.piece][from[0]][from[1]];
                prev_sum += own_field_weights[move.piece][to[0]][to[1]];
            }
        }

        return prev_sum;
    }

    /**
     * Recursive Alpha-Beta Minimax for getting the best move (BLACK is maximizing-player)
     * @param game The current game state according to our chess.ts logic
     * @param depth The depth the alpha-beta minimax should go (at least 2 recommended for max_player)
     * @param alpha The alpha value to determine pruning
     * @param beta The beta value to determine pruning
     * @param is_max_player If the calculation serves the maximizing player or not
     * @param sum The current recursive sum
     * @private
     */
    private minimax(game: Chess, depth: number, alpha: number, beta: number, is_max_player: boolean, sum: number): [Move, number] {
        let children = game.moves({verbose: true});

        // Sort moves randomly, so the same move isn't always picked on ties
        children.sort((a, b) => {
            return 0.5 - Math.random()
        });

        let current_move;
        // Maximum depth exceeded or node is a terminal node (no children)
        if (depth === 0 || children.length === 0) {
            return [null, sum]
        }

        // Find maximum/minimum from list of 'children' (possible moves)
        let max_val = Number.NEGATIVE_INFINITY;
        let min_val = Number.POSITIVE_INFINITY;
        let best_move;
        for (let i = 0; i < children.length; i++) {
            current_move = children[i];

            // Note: in our case, the 'children' are simply modified game states
            let new_sum = this.evaluate(current_move, sum);
            let [child_best_move, child_val] = this.minimax(game, depth - 1, alpha, beta, !is_max_player, new_sum);

            game.undo();

            if (is_max_player) {
                if (child_val > max_val) {
                    max_val = child_val;
                    best_move = current_move;
                }
                if (child_val > alpha) {
                    alpha = child_val;
                }
            } else {
                if (child_val < min_val) {
                    min_val = child_val;
                    best_move = current_move;
                }
                if (child_val < beta) {
                    beta = child_val;
                }
            }
            // Alpha-beta pruning
            if (alpha >= beta) {
                break;
            }
        }

        if (is_max_player) {
            return [best_move, max_val]
        } else {
            return [best_move, min_val];
        }
    }

    getStockfishMove(fen_string: string){

    }

    // ************************************************************************
    // CONSTANTS
    // ************************************************************************
    /**
     * The weight/value a figure itself has
     * Note: weights are from stockfish
     * @private
     */
    private static FIGURE_WEIGHTS = {
        "P": 100,
        "R": 479,
        "N": 280,
        "B": 320,
        "Q": 929,
        "K": 60000
    };

    /**
     * The field weight for black every figure (Some figures are more valuable on special positions)
     * -> maximizing player
     * Note: weights are from stockfish
     * @private
     */
    private static FIELD_WEIGHTS_W = {
        'P': [
            [-100, -100, -100, -100, -105, -100, -100, -100],
            [-78, -83, -86, -73, -102, -82, -85, -90],
            [-7, -29, -21, -44, -40, -31, -44, -7],
            [17, -16, 2, -15, -14, -0, -15, 13],
            [26, -3, -10, -9, -6, -1, 0, 23],
            [22, -9, -5, 11, 10, 2, -3, 19],
            [31, -8, 7, 37, 36, 14, -3, 31],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ],
        'N': [
            [66, 53, 75, 75, 10, 55, 58, 70],
            [3, 6, -100, 36, -4, -62, 4, 14],
            [-10, -67, -1, -74, -73, -27, -62, 2],
            [-24, -24, -45, -37, -33, -41, -25, -17],
            [1, -5, -31, -21, -22, -35, -2, 0],
            [18, -10, -13, -22, -18, -15, -11, 14],
            [23, 15, -2, 0, -2, 0, 23, 20],
            [74, 23, 26, 24, 19, 35, 22, 69]
        ],
        'B': [
            [59, 78, 82, 76, 23, 107, 37, 50],
            [11, -20, -35, 42, 39, -31, -2, 22],
            [9, -39, 32, -41, -52, 10, -28, 14],
            [-25, -17, -20, -34, -26, -25, -15, -10],
            [-13, -10, -17, -23, -17, -16, 0, -7],
            [-14, -25, -24, -15, -8, -25, -20, -15],
            [-19, -20, -11, -6, -7, -6, -20, -16],
            [7, -2, 15, 12, 14, 15, 10, 10]
        ],
        'R': [
            [-35, -29, -33, -4, -37, -33, -56, -50],
            [-55, -29, -56, -67, -55, -62, -34, -60],
            [-19, -35, -28, -33, -45, -27, -25, -15],
            [0, -5, -16, -13, -18, 4, 9, 6],
            [28, 35, 16, 21, 13, 29, 46, 30],
            [42, 28, 42, 25, 25, 35, 26, 46],
            [53, 38, 31, 26, 29, 43, 44, 53],
            [30, 24, 18, -5, 2, 18, 31, 32]
        ],
        'Q': [
            [-6, -1, 8, 104, -69, -24, -88, -26],
            [-14, -32, -60, 10, -20, -76, -57, -24],
            [2, -43, -32, -60, -72, -63, -43, -2],
            [-1, 16, -22, -17, -25, -20, 13, 6],
            [14, 15, 2, 5, 1, 10, 20, 22],
            [30, 6, 13, 11, 16, 11, 16, 27],
            [36, 18, 0, 19, 15, 15, 21, 38],
            [39, 30, 31, 13, 31, 36, 34, 42]
        ],
        'K': [
            [-4, -54, -47, 99, 99, -60, -83, 62],
            [32, -10, -55, -56, -56, -55, -10, -3],
            [62, -12, 57, -44, 67, -28, -37, 31],
            [55, -50, -11, 4, 19, -13, 0, 49],
            [55, 43, 52, 28, 51, 47, 8, 50],
            [47, 42, 43, 79, 64, 32, 29, 32],
            [4, -3, 14, 50, 57, 18, -13, -4],
            [-17, -30, 3, 14, -6, 1, -40, -18]
        ],
    };

    /**
     * The field weight for white every figure (Some figures are more valuable on special positions)
     * -> minimizing player
     * Note: weights are from stockfish
     * @private
     */
    private static FIELD_WEIGHTS_B = {
        'P': AI.FIELD_WEIGHTS_W['P'].slice().reverse(),
        'N': AI.FIELD_WEIGHTS_W['N'].slice().reverse(),
        'B': AI.FIELD_WEIGHTS_W['B'].slice().reverse(),
        'R': AI.FIELD_WEIGHTS_W['R'].slice().reverse(),
        'Q': AI.FIELD_WEIGHTS_W['Q'].slice().reverse(),
        'K': AI.FIELD_WEIGHTS_W['K'].slice().reverse(),
    }
}