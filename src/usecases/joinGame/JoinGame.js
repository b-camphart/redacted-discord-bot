const { User } = require("../../entities/User");
const { UserNotFound } = require("../../repositories/UserRepositoryExceptions");
const { UpdateGameUseCase } = require("../abstractUseCases/UpdateGameUseCase");
const { PlayerJoinedGame } = require("./PlayerJoinedGame");
const { UserAlreadyInGame } = require("./UserAlreadyInGame");
/**
 * @template {string | undefined} T
 * @typedef {import("../../entities/types").Game<T>} Game<T>
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

exports.JoinGame = class JoinGame extends UpdateGameUseCase {
    #userRepository;
    #playerNotifier;

    /**
     *
     * @param {import("../../repositories/GameRepository").UpdateGameRepository} gameRepository
     * @param {UserRepository} userRepository
     * @param {PlayerNotifier} playerNotifier
     */
    constructor(gameRepository, userRepository, playerNotifier) {
        super(gameRepository);
        this.#userRepository = userRepository;
        this.#playerNotifier = playerNotifier;
    }

    /**
     *
     * @param {string} gameId
     * @param {string} userId
     * @returns {Promise<Game<*>>}
     * @throws {GameNotFound} if the game does not exist
     * @throws {UserNotFound} if the user does not exist
     * @throws {UserAlreadyInGame} if the user is already in the game
     */
    async addPlayer(gameId, userId) {
        const game = await this._getGameOrThrow(gameId);
        this.#assertUserNotInGame(game, userId);
        const user = await this.#getUser(userId);

        const preExistingPlayers = game.playerIds;

        game.addPlayer(user.id);
        this._games.replace(game);

        await this.#notifyExistingPlayers(gameId, userId, preExistingPlayers);

        return game;
    }

    /**
     *
     * @param {Game<string>} game
     * @param {string} userId
     */
    #assertUserNotInGame(game, userId) {
        if (game.hasPlayer(userId)) throw new UserAlreadyInGame(game.id, userId);
    }

    /**
     *
     * @param {string} gameId
     * @param {string} userId
     * @param {readonly string[]} preExistingPlayers
     */
    async #notifyExistingPlayers(gameId, userId, preExistingPlayers) {
        const notification = new PlayerJoinedGame(gameId, userId);
        const notifications = preExistingPlayers.map((preExistingPlayerId) =>
            this.#playerNotifier.notifyPlayer(preExistingPlayerId, notification)
        );
        await Promise.allSettled(notifications);
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
