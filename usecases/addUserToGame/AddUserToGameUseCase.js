/**
 * @typedef {import('../../entities/Game').Game} Game
 * @typedef {import('../../entities/User').User} User
 * @typedef {import('./AddUserToGame').AddUserToGame} AddUserToGame
 */

const { UserNotFound } = require("../../repositories/UserRepository");
const { GameNotFound } = require("../../repositories/GameRepository");
const { UserAlreadyInGame } = require("./UserAlreadyInGame");

/**
 * AddUserToGame is a use case that adds a user to a game.
 * @implements {AddUserToGame}
 */
class AddUserToGameUseCase {
    #userRepository;
    #gameRepository;

    /**
     * @param {import('../../repositories/UserRepository').UserRepository} userRepository - The user repository to use for getting the user.
     * @param {import('../../repositories/GameRepository').GameRepository} gameRepository - The game repository to use for getting and saving the game.
     */
    constructor(userRepository, gameRepository) {
        this.#userRepository = userRepository;
        this.#gameRepository = gameRepository;
    }

    /**
     * Adds the user with the given userId to the game with the given gameId, and saves the updated game to the repository.
     * @param {string} userId - The id of the user to add to the game.
     * @param {string} gameId - The id of the game to add the user to.
     * @returns {Promise<Game>} The updated game with the new user added.
     * @throws {UserNotFoundError} If the user does not exist.
     * @throws {GameNotFoundError} If the game does not exist.
     * @throws {UserAlreadyInGameError} If the user is already in the game.
     */
    async addUser(userId, gameId) {
        await this.#checkUserExists(userId);
        const game = await this.#getGame(gameId);
        this.#execute(game, userId);
        await this.#gameRepository.replace(game);
        return game;
    }

    /**
     * Throws a UserAlreadyInGameError if the user is already in the game.
     * Otherwise, adds the user to the game.
     * @param {Game} game - The game to add the user to.
     * @param {string} userId - The id of the user to add to the game.
     * @throws {UserAlreadyInGameError} If the user is already in the game.
     */
    #execute(game, userId) {
        if (game.hasUser(userId)) {
            throw new UserAlreadyInGame(userId, game.id);
        }

        game.addUser(userId);
    }

    /**
     * Gets the game with the given gameId from the game repository.
     * @param {string} gameId - The id of the game to get.
     * @returns {Promise<Game>} The game with the given gameId.
     * @throws {GameNotFoundError} If the game does not exist.
     */
    async #getGame(gameId) {
        const game = await this.#gameRepository.get(gameId);
        if (!game) {
            throw new GameNotFound(gameId);
        }
        return game;
    }

    /**
     * Checks if the user with the given userId exists in the user repository.
     * @param {string} userId - The id of the user to check.
     * @throws {UserNotFoundError} If the user does not exist.
     */
    async #checkUserExists(userId) {
        const user = await this.#userRepository.get(userId);
        if (!user) {
            throw new UserNotFound(userId);
        }
    }
}

module.exports = { AddUserToGameUseCase };
