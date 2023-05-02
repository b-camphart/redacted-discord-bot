const { Game } = require("../../entities/Game");
const { GameNotFound } = require("../../repositories/GameRepository");
const { UserNotFound } = require("../../repositories/UserRepository");
const { UserAlreadyInGame } = require("./UserAlreadyInGame");
/** @typedef {import("./AddPlayerToGame").AddPlayerToGame} AddPlayerToGame */

/**
 * @implements {AddPlayerToGame}
 */
exports.AddPlayerToGameUseCase = class AddPlayerToGameUseCase {
    #gameRepository;
    #userRepository;

    /**
     *
     * @param {import("../../repositories/GameRepository").GameRepository} gameRepository
     * @param {import("../../repositories/UserRepository").UserRepository} userRepository
     */
    constructor(gameRepository, userRepository) {
        this.#gameRepository = gameRepository;
        this.#userRepository = userRepository;
    }

    /**
     *
     * @param {string} gameId
     * @param {string} userId
     * @returns {Promise<Game>}
     * @throws {GameNotFound} if the game does not exist
     * @throws {UserNotFound} if the user does not exist
     */
    async addPlayer(gameId, userId) {
        const game = await this.#getGame(gameId);
        if (game.hasUser(userId)) throw new UserAlreadyInGame(gameId, userId);
        const user = await this.#getUser(userId);
        game.addUser(user.id);
        this.#gameRepository.replace(game);
        return game;
    }

    /**
     *
     * @param {string} gameId
     * @returns {Promise<Game>}
     * @throws {GameNotFound} if the game does not exist
     */
    async #getGame(gameId) {
        const game = await this.#gameRepository.get(gameId);
        if (game === undefined) throw new GameNotFound(gameId);
        return game;
    }

    /**
     *
     * @param {string} userId
     * @returns {Promise<import("../../repositories/UserRepository").UserWithId>}
     * @throws {UserNotFound} if the user does not exist
     */
    async #getUser(userId) {
        const user = await this.#userRepository.get(userId);
        if (user === undefined) throw new UserNotFound(userId);
        return user;
    }
};
