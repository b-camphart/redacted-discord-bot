const { PlayerActivity } = require("../entities/Game.PlayerActivity");
const { associate, associateWith } = require("../utils/collections");
const { param } = require("../validation");
const { mustHaveLengthInRange } = require("../validation/arrays");
const { exclusive, inclusive } = require("../validation/numbers");
const { mustNotBeBlank } = require("../validation/strings");
const { emitGameUpdate } = require("./abstractUseCases/GameUpdateEmitter");
const { PlayerInGameUpdatesGameUseCase } = require("./abstractUseCases/PlayerInGameUpdatesGameUseCase");
const { PlayerActivityChanged } = require("./applicationEvents");

class StartStory extends PlayerInGameUpdatesGameUseCase {
    #subscribedPlayers;
    #playerNotifier;
    /**
     *
     * @param {import("../repositories/GameRepository").UpdateGameRepository} games
     * @param {import("../repositories/SubscribedPlayerRepository").ReadOnlySubscribedPlayerRepository} subscribedPlayers
     * @param {import("../repositories/PlayerNotifier").PlayerNotifier} playerNotifier
     */
    constructor(games, subscribedPlayers, playerNotifier) {
        super(games);
        param("subscribedPlayers", subscribedPlayers).isRequired();
        param("playerNotifier", playerNotifier).isRequired();
        this.#subscribedPlayers = subscribedPlayers;
        this.#playerNotifier = playerNotifier;
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

        emitGameUpdate(game, playerId, this.#subscribedPlayers, this.#playerNotifier);

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
