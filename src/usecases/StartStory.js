const { param } = require("../validation");
const { mustHaveLengthInRange } = require("../validation/arrays");
const { exclusive, inclusive } = require("../validation/numbers");
const { mustNotBeBlank } = require("../validation/strings");
const { PlayerInGameUpdatesGameUseCase } = require("./abstractUseCases/PlayerInGameUpdatesGameUseCase");

class StartStory extends PlayerInGameUpdatesGameUseCase {
    /**
     *
     * @param {import("../repositories/GameRepository").UpdateGameRepository} games
     */
    constructor(games) {
        super(games);
    }

    /**
     *
     * @param {string} gameId
     * @param {string} playerId
     * @param {string} content
     * @returns {Promise<import("../entities/types").Game<string>>}
     */
    async startStory(gameId, playerId, content) {
        this.#validateInputs(gameId, playerId, content);
        const game = await this._getGameOrThrow(gameId);
        game.startStory(playerId, content);
        await this._saveUpdate(game);
        return game;
    }

    /**
     *
     * @param {any} gameId
     * @param {any} playerId
     * @param {any} content
     */
    #validateInputs(gameId, playerId, content) {
        this._validateGameId(gameId);
        this._validatePlayerId(playerId);
        const contentParam = param("content", content).isRequired().mustBeString();
        mustNotBeBlank(contentParam);
        mustHaveLengthInRange(contentParam, exclusive(0), inclusive(256));
    }
}
module.exports = { StartStory };
