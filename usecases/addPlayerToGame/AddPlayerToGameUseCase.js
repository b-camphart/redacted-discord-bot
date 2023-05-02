const { Game } = require("../../entities/Game");
const { GameNotFound } = require("../../repositories/GameRepository");
const { UserNotFound } = require("../../repositories/UserRepository");
const { PlayerAddedToGame } = require("./PlayerAddedToGame");
const { UserAlreadyInGame } = require("./UserAlreadyInGame");
/** @typedef {import("./AddPlayerToGame").AddPlayerToGame} AddPlayerToGame */
/** @typedef {import("../../repositories/GameRepository").GameWithId} GameWithId */

/**
 * @implements {AddPlayerToGame}
 */
exports.AddPlayerToGameUseCase = class AddPlayerToGameUseCase {
    #gameRepository;
    #userRepository;
    #playerNotifier;

    /**
     *
     * @param {import("../../repositories/GameRepository").GameRepository} gameRepository
     * @param {import("../../repositories/UserRepository").UserRepository} userRepository
     * @param {import("../../repositories/PlayerNotifier").PlayerNotifier} playerNotifier
     */
    constructor(gameRepository, userRepository, playerNotifier) {
        this.#gameRepository = gameRepository;
        this.#userRepository = userRepository;
        this.#playerNotifier = playerNotifier;
    }

    /**
     *
     * @param {string} gameId
     * @param {string} userId
     * @returns {Promise<Game>}
     * @throws {GameNotFound} if the game does not exist
     * @throws {UserNotFound} if the user does not exist
     * @throws {UserAlreadyInGame} if the user is already in the game
     */
    async addPlayer(gameId, userId) {
        const game = await this.#getGame(gameId);
        this.#assertUserNotInGame(game, userId);
        const user = await this.#getUser(userId);

        const preExistingPlayers = game.getUsers();

        game.addUser(user.id);
        this.#gameRepository.replace(game);

        await this.#notifyExistingPlayers(gameId, userId, preExistingPlayers);

        return game;
    }

    /**
     *
     * @param {GameWithId} game
     * @param {string} userId
     */
    #assertUserNotInGame(game, userId) {
        if (game.hasUser(userId)) throw new UserAlreadyInGame(game.id, userId);
    }

    /**
     *
     * @param {string} gameId
     * @param {string} userId
     * @param {string[]} preExistingPlayers
     * @returns {Promise<void>}
     */
    async #notifyExistingPlayers(gameId, userId, preExistingPlayers) {
        const notification = new PlayerAddedToGame(gameId, userId);
        const notifications = preExistingPlayers.map((preExistingPlayerId) =>
            this.#playerNotifier.notifyPlayer(preExistingPlayerId, notification)
        );
        await Promise.allSettled(notifications);
    }

    /**
     *
     * @param {string} gameId
     * @returns {Promise<GameWithId>}
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
