/** @typedef {import("../../src/repositories/GameRepository").GameRepository} GameRepository */
/** @typedef {import("../../src/repositories/GameRepository").GameWithId} GameWithId */

const { Game } = require("../../src/entities/Game");

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
     * @returns {Promise<Game & {id:string} | undefined>}
     */
    async get(gameId) {
        const storedGame = this.#games.get(gameId);
        if (storedGame === undefined) return undefined;
        const gameCopy = new Game(
            gameId,
            storedGame.playerIds(),
            storedGame.isStarted,
            storedGame.stories(),
            storedGame.maxStoryEntries
        );
        return /** @type {GameWithId} */ (gameCopy);
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
