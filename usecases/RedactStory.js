const { GameNotFound } = require("../repositories/GameRepositoryExceptions");
const { param } = require("../validation");
const { exclusive, inclusive, mustBeInRange } = require("../validation/numbers");
const { mustHaveLengthInRange, eachValueOf } = require("../validation/arrays");

exports.RedactStory = class RedactStory {
    #games;
    /**
     *
     * @param {import("../repositories/GameRepository").UpdateGameRepository} gameRepository
     */
    constructor(gameRepository) {
        this.#games = gameRepository;
    }

    /**
     *
     * @param {string} gameId
     * @param {string} userId
     * @param {number} storyIndex
     * @param {number[]} wordIndices
     */
    async censorStory(gameId, userId, storyIndex, wordIndices) {
        RedactStory.#validateCommonRedactInputs(gameId, userId, storyIndex);
        RedactStory.#validateWordIndices(wordIndices);
        const game = await this.#getGame(gameId);
        game.censorStory(userId, storyIndex, wordIndices);
        this.#games.replace(game);
    }

    /**
     *
     * @param {string} gameId
     * @param {string} userId
     * @param {number} storyIndex
     * @param {number} truncationCount
     */
    async truncateStory(gameId, userId, storyIndex, truncationCount) {
        RedactStory.#validateCommonRedactInputs(gameId, userId, storyIndex);
        RedactStory.#validateTruncationCount(truncationCount);
        const game = await this.#getGame(gameId);
        game.truncateStory(userId, storyIndex, truncationCount);
        this.#games.replace(game);
    }

    /**
     *
     * @param {string} gameId
     * @param {string} userId
     * @param {number} storyIndex
     */
    static #validateCommonRedactInputs(gameId, userId, storyIndex) {
        RedactStory.#validateGameId(gameId);
        RedactStory.#validateUserId(userId);
        RedactStory.#validateStoryIndex(storyIndex);
    }

    /**
     *
     * @param {any} gameId
     */
    static #validateGameId(gameId) {
        param("gameId", gameId).isRequired().mustBeString();
    }

    /**
     *
     * @param {any} userId
     */
    static #validateUserId(userId) {
        param("userId", userId).isRequired().mustBeString();
    }

    /**
     *
     * @param {any} storyIndex
     */
    static #validateStoryIndex(storyIndex) {
        param("storyIndex", storyIndex).isRequired().mustBeNumber();
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
        mustBeInRange(numberParam, exclusive(0), exclusive(7));
    }

    /**
     *
     * @param {string} gameId
     */
    async #getGame(gameId) {
        const game = await this.#games.get(gameId);
        if (game === undefined) throw new GameNotFound(gameId);
        return game;
    }
};
