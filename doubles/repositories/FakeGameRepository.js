/** @typedef {import("../../repositories/GameRepository").GameRepository} GameRepository */

/**
 * @implements {GameRepository}
 */
exports.FakeGameRepository = class FakeGameRepository {
    #games;

    constructor() {
        this.#games = new Map();
    }

    async get(gameId) {
        return this.#games.get(gameId);
    }

    async add(game) {
        game.id = `${this.#games.size}`;
        this.#games.set(game.id, game);
        return game;
    }
};
