const { UserNotInGame, Game, InvalidPlayerActivity } = require("../entities/Game");
const { PlayerActivity, isSameActivity } = require("../entities/Game.PlayerActivity");
const { GameNotFound } = require("../repositories/GameRepositoryExceptions");
const { MustHaveLength, IndexOutOfBounds } = require("./validation");

/**
 * @typedef {Object} GameRepository
 * @property {(gameId: string) => Promise<Game & { id: string} | undefined>} get
 * @prop {(game: Game & { id: string}) => Promise<void>} replace
 */

exports.RedactStory = class RedactStory {
    #games;
    /**
     *
     * @param {GameRepository} gameRepository
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
        if (gameId === undefined) throw new TypeError("gameId is required.");
        if (typeof gameId !== "string") throw new TypeError("gameId must be a string.");
    }

    /**
     *
     * @param {any} userId
     */
    static #validateUserId(userId) {
        if (userId === undefined) throw new TypeError("userId is required.");
        if (typeof userId !== "string") throw new TypeError("userId must be a string.");
    }

    /**
     *
     * @param {any} storyIndex
     */
    static #validateStoryIndex(storyIndex) {
        if (storyIndex === undefined) throw new TypeError("storyIndex is required.");
        if (typeof storyIndex !== "number") throw new TypeError("storyIndex must be a number.");
    }

    /**
     *
     * @param {any} wordIndices
     */
    static #validateWordIndices(wordIndices) {
        if (wordIndices === undefined) throw new TypeError("wordIndices is required.");
        if (!Array.isArray(wordIndices)) throw new TypeError("wordIndices must be an array.");
        if (wordIndices.length === 0 || wordIndices.length > 3) throw new MustHaveLength("wordIndices", 1, 3);
        wordIndices.forEach((value) => {
            if (typeof value !== "number") throw new TypeError("wordIndices must contain only numbers");
        });
    }

    /**
     *
     * @param {any} truncationCount
     */
    static #validateTruncationCount(truncationCount) {
        if (truncationCount === undefined) throw new TypeError("truncationCount is required.");
        if (typeof truncationCount !== "number") throw new TypeError("truncationCount must be a number.");
        if (truncationCount <= 0)
            throw new IndexOutOfBounds(`truncationCount <${truncationCount}> must be greater than 0.`);
        if (truncationCount > 7)
            throw new IndexOutOfBounds(`truncationCount <${truncationCount}> must be less than 7.`);
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
