const { UserNotInGame } = require("../../entities/Game.Exceptions");
const { PlayerInGameUpdatesGameUseCase } = require("../abstractUseCases/PlayerInGameUpdatesGameUseCase");
const { PlayerActivityChanged } = require("../applicationEvents");
const { NotEnoughPlayersToStartGame } = require("./validation");
/** @typedef {import("../../repositories/GameRepository").GameWithId} GameWithId */

class StartGame extends PlayerInGameUpdatesGameUseCase {
    #playerNotifier;

    /**
     *
     * @param {import("../../repositories/GameRepository").UpdateGameRepository} gameRepository
     * @param {import("../../repositories/PlayerNotifier").PlayerNotifier} playerNotifier
     */
    constructor(gameRepository, playerNotifier) {
        super(gameRepository);
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
        this._validateGameId(gameId);
        this._validatePlayerId(playerId);
        const game = await this._getGameOrThrow(gameId);
        if (!game.hasPlayer(playerId)) throw new UserNotInGame(gameId, playerId);
        if (game.playerIds().length < 4) throw new NotEnoughPlayersToStartGame(game.id, game.playerIds().length);
        game.start();
        this._games.replace(game);
        await this.#notifyPlayers(game);
    }

    /**
     *
     * @param {GameWithId} game
     */
    async #notifyPlayers(game) {
        const emissions = game.playerIds().map((/** @type {string} */ userId) => {
            const activity = game.playerActivity(userId);
            if (activity === undefined) throw "Activity for user in game is undefined.";
            this.#playerNotifier.notifyPlayer(userId, new PlayerActivityChanged(game.id, userId, activity));
        });
        await Promise.allSettled(emissions);
    }
}

module.exports = { StartGame };
