const { Game, UserNotInGame } = require("../entities/Game");
const { GameNotFound } = require("../repositories/GameRepositoryExceptions");
const { param } = require("../validation");
const { PlayerActivityChanged } = require("./applicationEvents");
/** @typedef {import("../repositories/GameRepository").GameWithId} GameWithId */

class StartGame {
    #gameRepository;
    #playerNotifier;

    /**
     *
     * @param {import("../repositories/GameRepository").UpdateGameRepository} gameRepository
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
     * @throws {GameNotFound} if the game does not exist
     * @throws {UserNotInGame} if the user is not part of the game
     * @throws {NotEnoughPlayersInGame} if there are less than 4 players in the game
     */
    async startGame(gameId, playerId) {
        param("gameId", gameId).isRequired().mustBeString();
        param("playerId", playerId).isRequired().mustBeString();
        const game = await this.#getGame(gameId);
        if (!game.hasUser(playerId)) throw new UserNotInGame(gameId, playerId);
        game.start();
        this.#gameRepository.replace(game);
        await this.#notifyPlayers(game);
    }

    /**
     *
     * @param {GameWithId} game
     */
    async #notifyPlayers(game) {
        const emissions = game.users().map((userId) => {
            const activity = game.userActivity(userId);
            if (activity === undefined) throw "Activity for user in game is undefined.";
            this.#playerNotifier.notifyPlayer(userId, new PlayerActivityChanged(game.id, userId, activity));
        });
        await Promise.allSettled(emissions);
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
}

module.exports = { StartGame };
