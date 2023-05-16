const { param } = require("../../validation");
const { emitGameUpdate } = require("../abstractUseCases/GameUpdateEmitter");
const { PlayerInGameUpdatesStoryUseCase } = require("../abstractUseCases/PlayerInGameUpdatesStoryUseCase");

/**
 * {@link UseCases.StoryContinuation}
 *
 * @implements {UseCases.StoryContinuation}
 */
class ContinueStory extends PlayerInGameUpdatesStoryUseCase {
	#subscribedPlayers;
	#playerNotifier;
	/**
	 *
	 * @param {import("../../repositories/GameRepository").UpdateGameRepository} games
	 * @param {import("../../repositories/SubscribedPlayerRepository").ReadOnlySubscribedPlayerRepository} subscribedPlayers
	 * @param {import("../../repositories/PlayerNotifier").PlayerNotifier} playerNotifier
	 */
	constructor(games, subscribedPlayers, playerNotifier) {
		super(games);
		param("subscribedPlayers", subscribedPlayers).isRequired();
		param("playerNotifier", playerNotifier).isRequired();
		this.#subscribedPlayers = subscribedPlayers;
		this.#playerNotifier = playerNotifier;
	}
	/**
	 * {@link UseCases.StoryContinuation.continueStory}
	 *
	 * @param {string} gameId
	 * @param {string} playerId
	 * @param {number} storyIndex
	 * @param {string} content
	 */
	async continueStory(gameId, storyIndex, playerId, content) {
		this._validateInputs(gameId, playerId, storyIndex, content);
		const game = await this._getGameOrThrow(gameId);
		game.continueStory(playerId, storyIndex, content);
		this._saveUpdate(game);
		await emitGameUpdate(game, playerId, this.#subscribedPlayers, this.#playerNotifier);
	}

	/**
	 *
	 * @param {any} gameId
	 * @param {any} playerId
	 * @param {any} storyIndex
	 * @param {any} content
	 */
	// @ts-ignore
	_validateInputs(gameId, playerId, storyIndex, content) {
		super._validateInputs(gameId, playerId, storyIndex);
		this._validateContent(content);
	}

	/**
	 *
	 * @param {any} content
	 */
	_validateContent(content) {
		param("content", content).isRequired().mustBeString();
	}
}

exports.ContinueStory = ContinueStory;
