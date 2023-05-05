/** @typedef {import("./GameRepository").GameRepository} GameRepository */
/** @typedef {import("./GameRepository").GameWithId} GameWithId */

const { Game } = require("../../entities/Game");

/**
 * @implements {GameRepository}
 */
exports.FakeGameRepository = class FakeGameRepository {
    /** @type {Map<string, GameWithId>} */
    #games;

    constructor() {
        this.#games = new Map();
    }

    /**
     *
     * @param {string} gameId
     */
    async get(gameId) {
        return this.#games.get(gameId);
    }

    /**
     *
     * @param {Game} game
     * @returns {Promise<GameWithId>}
     */
    async add(game) {
        game.id = `FakeGame: ${this.#games.size}`;
        const gameWithId = /** @type {GameWithId} */ (game);
        this.#games.set(game.id, gameWithId);
        return gameWithId;
    }

    /**
     *
     * @param {GameWithId} game
     */
    async replace(game) {
        this.#games.set(game.id, game);
    }
};
