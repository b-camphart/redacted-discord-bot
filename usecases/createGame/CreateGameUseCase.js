const { UserNotFound } = require("../../repositories/UserRepository");
/** @typedef {import("../../repositories/UserRepository").UserRepository} UserRepository */
/** @typedef {import("../../repositories/GameRepository").GameRepository} GameRepository */
const { Game } = require("../../entities/Game");
/** @typedef {import("./CreateGame").CreateGame} CreateGame */

/**
 * @implements {CreateGame}
 */
exports.CreateGameUseCase = class CreateGameUseCase {
    /** @type {UserRepository} */
    #users;
    /** @type {GameRepository} */
    #games;

    /**
     * @param {UserRepository} users
     * @param {GameRepository} games
     */
    constructor(users, games) {
        this.#users = users;
        this.#games = games;
    }

    /**
     *
     * @param {string} userId
     * @returns {Promise<Game>}
     */
    async create(userId) {
        const creator = await this.#users.get(userId);
        if (creator === undefined) throw new UserNotFound(userId);
        const game = new Game();
        // @ts-ignore
        game.addUser(creator.id);

        const savedGame = await this.#games.add(game);
        return savedGame;
    }
};
