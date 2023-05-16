const { InvalidWordCount } = require("../../entities/Game.Story.Exceptions");
const { censorableWords } = require("../../entities/Words");
const { param } = require("../../validation");
const { mustHaveLengthInRange } = require("../../validation/arrays");
const { exclusive, inclusive } = require("../../validation/numbers");
const { mustNotBeBlank } = require("../../validation/strings");
const { emitGameUpdate } = require("../abstractUseCases/GameUpdateEmitter");
const { PlayerInGameUpdatesGameUseCase } = require("../abstractUseCases/PlayerInGameUpdatesGameUseCase");
const { StoryStarted } = require("./StoryStarted");

/**
 * {@link UseCases.StoryStart}
 * @implements {UseCases.StoryStart}
 */
class StartStory extends PlayerInGameUpdatesGameUseCase {
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
	 *
	 * See: {@link UseCases.StoryStart.startStory}
	 *
	 * @param {string} gameId
	 * @param {string} playerId
	 * @param {string} content
	 * @returns {Promise<StoryStarted>}
	 */
	async startStory(gameId, playerId, content) {
		this.#validateInputs(gameId, playerId, content);
		const game = await this._getGameOrThrow(gameId);

		const storyIndex = game.startStory(playerId, content);
		await this._saveUpdate(game);

		emitGameUpdate(game, playerId, this.#subscribedPlayers, this.#playerNotifier);

		return new StoryStarted(gameId, playerId, storyIndex, content);
	}

	/**
	 *
	 * @param {any} gameId
	 * @param {any} playerId
	 * @param {any} content
	 */
	#validateInputs(gameId, playerId, content) {
		this._validateGameId(gameId);
		this._validatePlayerId(playerId);
		this.#validateContent(content, gameId);
	}

	/**
	 *
	 * @param {any} content
	 * @param {string} gameId
	 */
	#validateContent(content, gameId) {
		const contentParam = param("content", content).isRequired().mustBeString();
		mustNotBeBlank(contentParam);
		mustHaveLengthInRange(contentParam, exclusive(0), inclusive(256));
		const wordCount = censorableWords(content).length;
		if (wordCount <= 1) {
			// @ts-ignore
			throw new InvalidWordCount(gameId, undefined, 2, wordCount);
		}
	}
}
module.exports = { StartStory };
