/** @typedef {import("../../src/repositories/GameRepository").GameRepository} GameRepository */
/**
 * @template {string | undefined} T
 * @typedef {import("../../src/entities/types").Game<T>} IGame<T>
 */

const { Game } = require("../../src/entities/Game");

/**
 * @implements {GameRepository}
 */
exports.FakeGameRepository = class FakeGameRepository {
    /** @type {Map<string, IGame<string>>} */
    #games;

    constructor() {
        this.#games = new Map();
    }

    /**
     *
     * @param {string} gameId
     */
    async get(gameId) {
        const storedGame = this.#games.get(gameId);
        if (storedGame === undefined) return undefined;
        const gameCopy = new Game(
            gameId,
            storedGame.playerIds,
            storedGame.isStarted,
            storedGame.stories,
            storedGame.maxStoryEntries
        );
        return /** @type {IGame<string>} */ (gameCopy);
    }

    /**
     *
     * @param {IGame<*>} game
     * @returns {Promise<IGame<string>>}
     */
    async add(game) {
        game.id = `FakeGame: ${this.#games.size}`;
        const gameWithId = /** @type {IGame<string>} */ (game);
        this.#games.set(game.id, gameWithId);
        return gameWithId;
    }

    /**
     *
     * @param {IGame<string>} game
     */
    async replace(game) {
        this.#games.set(game.id, game);
    }
};
