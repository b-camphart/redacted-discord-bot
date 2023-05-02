const { Game } = require("../entities/Game");
const { GameNotFound } = require("../repositories/GameRepository");
const { UserNotInGame } = require("./validation");

/**
 * @interface
 * @typedef {Object} StartGame
 * @property {(gameId: string, playerId: string) => Promise<Game>} startGame
 */

/**
 * @implements {StartGame}
 */
class StartGameUseCase {
    #gameRepository;
    #playerNotifier;

    /**
     *
     * @param {import("../repositories/GameRepository").GameRepository} gameRepository
     * @param {import("../repositories/PlayerNotifier").PlayerNotifier} playerNotifier
     */
    constructor(gameRepository, playerNotifier) {
        this.#gameRepository = gameRepository;
        this.#playerNotifier = playerNotifier;
    }

    /**
     *
     * @param {string} gameId
     * @param {string} playerId
     * @returns {Promise<Game>}
     * @throws {GameNotFound} if the game does not exist
     * @throws {UserNotInGame} if the user is not part of the game
     * @throws {NotEnoughPlayersInGame} if there are less than 4 players in the game
     */
    async startGame(gameId, playerId) {
        const game = await this.#getGame(gameId);
        if (!game.hasUser(playerId)) throw new UserNotInGame(gameId, playerId);
        game.start();
        this.#gameRepository.replace(game);
        await this.#notifyPlayers(game);
        return game;
    }

    /**
     *
     * @param {import("../repositories/GameRepository").GameWithId} game
     */
    async #notifyPlayers(game) {
        const notification = new GameStarted(game.id);
        const emissions = game
            .getUsers()
            .map((userId) =>
                this.#playerNotifier.notifyPlayer(userId, notification)
            );
        await Promise.allSettled(emissions);
    }

    /**
     *
     * @param {string} gameId
     * @returns {Promise<import("./addPlayerToGame/AddPlayerToGameUseCase").GameWithId>}
     * @throws {GameNotFound} if the game does not exist
     */
    async #getGame(gameId) {
        const game = await this.#gameRepository.get(gameId);
        if (game === undefined) throw new GameNotFound(gameId);
        return game;
    }
}

class GameStarted {
    /**
     *
     * @param {string} gameId
     */
    constructor(gameId) {
        this.gameId = gameId;
    }
}

module.exports = { StartGameUseCase, GameStarted };
