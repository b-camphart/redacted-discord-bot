const { PlayerInGameUseCase } = require("./PlayerInGameUseCase");

class PlayerInGameUpdatesGameUseCase extends PlayerInGameUseCase {
    /**
     *
     * @param {import("../../repositories/GameRepository").UpdateGameRepository} games
     */
    constructor(games) {
        super(games);
        this._games = games;
    }
}

exports.PlayerInGameUpdatesGameUseCase = PlayerInGameUpdatesGameUseCase;
