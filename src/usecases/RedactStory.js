const { param } = require("../validation");
const { exclusive, inclusive, mustBeInRange } = require("../validation/numbers");
const { mustHaveLengthInRange, eachValueOf } = require("../validation/arrays");
const { PlayerInGameUpdatesStoryUseCase } = require("./abstractUseCases/PlayerInGameUpdatesStoryUseCase");

exports.RedactStory = class RedactStory extends PlayerInGameUpdatesStoryUseCase {
    /**
     *
     * @param {import("../repositories/GameRepository").UpdateGameRepository} gameRepository
     */
    constructor(gameRepository) {
        super(gameRepository);
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
