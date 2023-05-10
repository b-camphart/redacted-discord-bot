const { param } = require("../validation");
const { exclusive, inclusive, mustBeInRange } = require("../validation/numbers");
const { mustHaveLengthInRange, eachValueOf } = require("../validation/arrays");
const { PlayerInGameUpdatesStoryUseCase } = require("./abstractUseCases/PlayerInGameUpdatesStoryUseCase");
const { emitGameUpdate } = require("./abstractUseCases/GameUpdateEmitter");

exports.RedactStory = class RedactStory extends PlayerInGameUpdatesStoryUseCase {
    #subscribedPlayers;
    #playerNotifier;
    /**
     *
     * @param {import("../repositories/GameRepository").UpdateGameRepository} gameRepository
     * @param {import("../repositories/SubscribedPlayerRepository").ReadOnlySubscribedPlayerRepository} subscribedPlayers
     * @param {import("../repositories/PlayerNotifier").PlayerNotifier} playerNotifier
     */
    constructor(gameRepository, subscribedPlayers, playerNotifier) {
        super(gameRepository);
        param("subscribedPlayers", subscribedPlayers).isRequired();
        param("playerNotifier", playerNotifier).isRequired();
        this.#subscribedPlayers = subscribedPlayers;
        this.#playerNotifier = playerNotifier;
    }

    /**
     *
     * @param {string} gameId
     * @param {string} playerId
     * @param {number} storyIndex
     * @param {number[]} wordIndices
     */
    async censorStory(gameId, playerId, storyIndex, wordIndices) {
        this.#validateCommonRedactInputs(gameId, playerId, storyIndex);
        RedactStory.#validateWordIndices(wordIndices);
        const game = await this._getGameOrThrow(gameId);
        game.censorStory(playerId, storyIndex, wordIndices);
        this._saveUpdate(game);
        emitGameUpdate(game, playerId, this.#subscribedPlayers, this.#playerNotifier);
    }

    /**
     *
     * @param {string} gameId
     * @param {string} playerId
     * @param {number} storyIndex
     * @param {number} truncationCount
     */
    async truncateStory(gameId, playerId, storyIndex, truncationCount) {
        this.#validateCommonRedactInputs(gameId, playerId, storyIndex);
        RedactStory.#validateTruncationCount(truncationCount);
        const game = await this._getGameOrThrow(gameId);
        game.truncateStory(playerId, storyIndex, truncationCount);
        this._saveUpdate(game);
        emitGameUpdate(game, playerId, this.#subscribedPlayers, this.#playerNotifier);
    }

    /**
     *
     * @param {string} gameId
     * @param {string} playerId
     * @param {number} storyIndex
     */
    #validateCommonRedactInputs(gameId, playerId, storyIndex) {
        this._validateGameId(gameId);
        this._validatePlayerId(playerId);
        this._validateStoryIndex(storyIndex);
    }

    /**
     *
     * @param {any | undefined} wordIndices
     */
    static #validateWordIndices(wordIndices) {
        const arrayParam = param("wordIndices", wordIndices).isRequired().mustBeArray();
        mustHaveLengthInRange(arrayParam, exclusive(0), inclusive(3));
        eachValueOf(arrayParam, (valueParam) => {
            valueParam.isRequired().mustBeNumber();
        });
    }

    /**
     *
     * @param {any} truncationCount
     */
    static #validateTruncationCount(truncationCount) {
        const numberParam = param("truncationCount", truncationCount).isRequired().mustBeNumber();
        mustBeInRange(numberParam, exclusive(0), inclusive(7));
    }
};
