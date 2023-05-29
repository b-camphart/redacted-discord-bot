const { UnauthorizedGameModification, InsufficientPlayers } = require("../../entities/Game.Exceptions");
const { emitGameUpdate } = require("../abstractUseCases/GameUpdateEmitter");
const { PlayerInGameUpdatesGameUseCase } = require("../abstractUseCases/PlayerInGameUpdatesGameUseCase");
const { GameStarted } = require("./GameStarted");
/**
 * @template {string | undefined} T
 * @typedef {import("../../entities/types").Game<T>} Game<T>
 */

/**
 * {@link UseCases.GameStart}
 * @implements {UseCases.GameStart}
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
	 * See - {@link UseCases.GameStart.startGame}
	 *
	 * @param {string} gameId
	 * @param {string} playerId
	 * @param {number} [maxEntries]
	 */
	async startGame(gameId, playerId, maxEntries) {
		this._validateGameId(gameId);
		this._validatePlayerId(playerId);
		const game = await this._getGameOrThrow(gameId);
		if (!game.hasPlayer(playerId)) throw new UnauthorizedGameModification(gameId, playerId);
		if (game.playerIds.length < 4) throw new InsufficientPlayers(gameId, 4, game.playerIds.length);
		if (game.start(maxEntries) === undefined) return;
		this._saveUpdate(game);
		emitGameUpdate(game, playerId, this.#subscribedPlayers, this.#playerNotifier);
		return new GameStarted(gameId, playerId);
	}
}

module.exports = { StartGame };
