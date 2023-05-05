const { UserNotInGame, Game, InvalidPlayerActivity } = require("../entities/Game");
const { PlayerActivity, isSameActivity } = require("../entities/Game.PlayerActivity");
const { GameNotFound } = require("../repositories/GameRepositoryExceptions");
const { MustHaveLength } = require("./validation");

/**
 * @typedef {Object} GameRepository
 * @property {(gameId: string) => Promise<Game & { id: string} | undefined>} get
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
        RedactStory.#validateGameId(gameId);
        RedactStory.#validateUserId(userId);
        RedactStory.#validateWordIndices(wordIndices);
        const game = await this.#getGame(gameId);
        game.censorStory(userId, storyIndex, wordIndices);
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
     * @param {any} gameId
     */
    static #validateGameId(gameId) {
        if (gameId === undefined) throw new TypeError("gameId is required.");
        if (typeof gameId !== "string") throw new TypeError("gameId must be string.");
    }

    /**
     *
     * @param {any} userId
     */
    static #validateUserId(userId) {
        if (userId === undefined) throw new TypeError("userId is required.");
        if (typeof userId !== "string") throw new TypeError("userId must be string.");
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
