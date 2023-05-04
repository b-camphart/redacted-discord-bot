const { UserNotFound } = require("../../repositories/UserRepositoryExceptions");
const { Game } = require("../../entities/Game");
const { User } = require("../../entities/User");
const { GameCreated } = require("./GameCreated");

/**
 * @typedef {User & { id: string }} UserWithId
 */

/**
 * @typedef {Object} UserRepository
 * @property {(userId: string) => Promise<(UserWithId) | undefined>} get
 */

/**
 * @typedef {Game & { id: string }} GameWithId
 */

/**
 * @typedef {Object} GameRepository
 * @property {(game: Game) => Promise<GameWithId>} add
 */

exports.CreateGame = class CreateGame {
    #users;
    #games;

    /**
     *
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
     * @returns {Promise<GameCreated>}
     */
    async create(userId) {
        CreateGame.#validateUserId(userId);
        const creator = await this.#getCreator(userId);
        const game = CreateGame.#createGameWithCreator(creator);
        const savedGame = await this.#saveGame(game);
        return new GameCreated(savedGame.id, creator);
    }

    /**
     *
     * @param {string} creatorId
     * @returns {Promise<UserWithId>}
     */
    async #getCreator(creatorId) {
        const creator = await this.#users.get(creatorId);
        if (creator === undefined) throw new UserNotFound(creatorId);
        return creator;
    }

    /**
     *
     * @param {UserWithId} creator
     * @returns {Game}
     */
    static #createGameWithCreator(creator) {
        const game = new Game();
        game.addUser(creator.id);
        return game;
    }

    /**
     *
     * @param {Game} game
     * @returns {Promise<GameWithId>}
     */
    async #saveGame(game) {
        return await this.#games.add(game);
    }

    /**
     *
     * @param {any} userId
     */
    static #validateUserId(userId) {
        if (typeof userId !== "string") throw TypeError("userId must be a string.");
    }
};
