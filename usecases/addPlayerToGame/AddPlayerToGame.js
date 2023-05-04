const { Game } = require("../../entities/Game");
const { User } = require("../../entities/User");
const { GameNotFound } = require("../../repositories/GameRepositoryExceptions");
const { UserNotFound } = require("../../repositories/UserRepositoryExceptions");
const { PlayerAddedToGame } = require("./PlayerAddedToGame");
const { UserAlreadyInGame } = require("./UserAlreadyInGame");

/**
 * @typedef {Game & { id: string }} GameWithId
 */

/**
 * @typedef {Object} GameRepository
 * @property {(gameId: string) => Promise<GameWithId | undefined>} get
 * @property {(game: GameWithId) => Promise<void>} replace
 */

/**
 * @typedef {User & { id: string }} UserWithId
 */

/**
 * @typedef {Object} UserRepository
 * @property {(userId: string) => Promise<UserWithId | undefined>} get
 */

/**
 * @typedef {Object} PlayerNotifier
 * @property {(playerId: string, notifiaction: any) => Promise<void>} notifyPlayer
 */

exports.AddPlayerToGame = class AddPlayerToGame {
    #gameRepository;
    #userRepository;
    #playerNotifier;

    /**
     *
     * @param {GameRepository} gameRepository
     * @param {UserRepository} userRepository
     * @param {PlayerNotifier} playerNotifier
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

        const preExistingPlayers = game.users().map((userInGame) => userInGame.id());

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
     * @throws {UserNotFound} if the user does not exist
     */
    async #getUser(userId) {
        const user = await this.#userRepository.get(userId);
        if (user === undefined) throw new UserNotFound(userId);
        return user;
    }
};
