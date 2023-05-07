const { GameUseCase } = require("./GameUseCase");

class UpdateGameUseCase extends GameUseCase {
    _games;

    /**
     *
     * @param {import("../../repositories/GameRepository").UpdateGameRepository} games
     */
    constructor(games) {
        super(games);
        this._games = games;
    }
}

exports.UpdateGameUseCase = UpdateGameUseCase;
