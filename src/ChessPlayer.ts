

export class ChessPlayer {
    get human(): boolean {
        return this._human;
    }

    set human(value: boolean) {
        this._human = value;
    }
    get score(): number {
        return this._score;
    }

    set score(value: number) {
        this._score = value;
    }

    get color(): string {
        return this._color;
    }

    set color(value: string) {
        this._color = value;
    }

    private _human: boolean; // "human" | "computer"
    private _color: string;
    private _score: number;

    constructor(human: boolean, color: string) {
        this.human = human;
        this.color = color;
        this.score = 0;
    }

    public togglePlayer(player: ChessPlayer){
        this.human = player.human;
        this.color = player.color;
        this.score = player.score;
    }
}