const { PlayerInGameUseCase } = require("./PlayerInGameUseCase");

class PlayerInGameUpdatesGameUseCase extends PlayerInGameUseCase {
    #games;
    /**
     *
     * @param {import("../../repositories/GameRepository").UpdateGameRepository} games
     */
    constructor(games) {
        super(games);
        this.#games = games;
    }

    /**
     *
     * @param {import("../../entities/types").Game<string>} game
     */
    async _saveUpdate(game) {
        await this.#games.replace(game);
    }
}

exports.PlayerInGameUpdatesGameUseCase = PlayerInGameUpdatesGameUseCase;
