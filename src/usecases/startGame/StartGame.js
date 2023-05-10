const { UserNotInGame } = require("../../entities/Game.Exceptions");
const { PlayerActivity } = require("../../entities/Game.PlayerActivity");
const { emitGameUpdate } = require("../abstractUseCases/GameUpdateEmitter");
const { PlayerInGameUpdatesGameUseCase } = require("../abstractUseCases/PlayerInGameUpdatesGameUseCase");
const { PlayerActivityChanged } = require("../applicationEvents");
const { NotEnoughPlayersToStartGame } = require("./validation");
/**
 * @template {string | undefined} T
 * @typedef {import("../../entities/types").Game<T>} Game<T>
 */

class StartGame extends PlayerInGameUpdatesGameUseCase {
    #subscribedPlayers;
    #playerNotifier;

    /**
     *
     * @param {import("../../repositories/GameRepository").UpdateGameRepository} gameRepository
     * @param {import("../../repositories/SubscribedPlayerRepository").ReadOnlySubscribedPlayerRepository} subscribedPlayers
     * @param {import("../../repositories/PlayerNotifier").PlayerNotifier} playerNotifier
     */
    constructor(gameRepository, subscribedPlayers, playerNotifier) {
        super(gameRepository);
        this.#subscribedPlayers = subscribedPlayers;
        this.#playerNotifier = playerNotifier;
    }

    /**
     *
     * @param {string} gameId
     * @param {string} playerId
     * @param {number} [maxEntries]
     * @throws {GameNotFound} if the game does not exist
     * @throws {UserNotInGame} if the user is not part of the game
     * @throws {NotEnoughPlayersInGame} if there are less than 4 players in the game
     */
    async startGame(gameId, playerId, maxEntries) {
        this._validateGameId(gameId);
        this._validatePlayerId(playerId);
        const game = await this._getGameOrThrow(gameId);
        if (!game.hasPlayer(playerId)) throw new UserNotInGame(gameId, playerId);
        if (game.playerIds.length < 4) throw new NotEnoughPlayersToStartGame(game.id, game.playerIds.length);
        game.start(maxEntries);
        this._saveUpdate(game);
        emitGameUpdate(game, playerId, this.#subscribedPlayers, this.#playerNotifier);
    }
}

module.exports = { StartGame };
