const { InvalidWordCount } = require("../../entities/Game.Story.Exceptions");
const { censorableWords } = require("../../entities/Words");
const { param } = require("../../validation");
const { eachValueOf } = require("../../validation/arrays");
const { mustBeLessThanOrEqualTo } = require("../../validation/numbers");
const { mustNotBeBlank } = require("../../validation/strings");
const { emitGameUpdate } = require("../abstractUseCases/GameUpdateEmitter");
const { PlayerInGameUpdatesStoryUseCase } = require("../abstractUseCases/PlayerInGameUpdatesStoryUseCase");

/**
 * {@link UseCases.CensoredStoryRepair}
 * {@link UseCases.TruncatedStoryRepair}
 *
 * @implements {UseCases.CensoredStoryRepair}
 * @implements {UseCases.TruncatedStoryRepair}
 */
exports.RepairStory = class RepairStory extends PlayerInGameUpdatesStoryUseCase {
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
		param("subscribedPlayers", subscribedPlayers).isRequired();
		param("playerNotifier", playerNotifier).isRequired();
		this.#subscribedPlayers = subscribedPlayers;
		this.#playerNotifier = playerNotifier;
	}

	/**
	 * {@link UseCases.CensoredStoryRepair.repairCensoredStory}
	 *
	 * @param {string} gameId — the id of the game in which to repair the story
	 * @param {number} storyIndex — the story in the game to repair
	 * @param {string} playerId — the id of the player repairing the story
	 * @param {string[]} replacements — the words to replace each censor with
	 *
	 * @returns {Promise<UseCases.CensoredStoryRepaired>}
	 *
	 */
	repairCensoredStory = async (gameId, storyIndex, playerId, replacements) => {
		this._validateInputs(gameId, playerId, storyIndex);
		const replacementParam = param("replacements", replacements).isRequired().mustBeArray();
		eachValueOf(replacementParam, (it) => {
			it.mustBeString();

			mustNotBeBlank(it);
			mustBeLessThanOrEqualTo(it.mustHaveProperty("length").mustBeNumber(), 32);

			const wordCount = censorableWords(it.value).length;
			if (wordCount > 1) throw new InvalidWordCount(gameId, storyIndex, 1, wordCount);
		});

		const game = await this._getGameOrThrow(gameId);

		const trimmedReplacements = replacements.map((replacement) => replacement.trim());
		const repairedContent = game.repairCensoredStory(playerId, storyIndex, trimmedReplacements);
		await this._saveUpdate(game);

		emitGameUpdate(game, playerId, this.#subscribedPlayers, this.#playerNotifier);
		return { repairedContent };
	};

	/**
	 * {@link UseCases.TruncatedStoryRepair.repairTruncatedStory}
	 *
	 * @param {string} gameId — the id of the game in which to repair the story
	 * @param {number} storyIndex — the story in the game to repair
	 * @param {string} playerId — the id of the player repairing the story
	 * @param {string} replacement — the words to replace each censor with
	 */
	repairTruncatedStory = async (gameId, storyIndex, playerId, replacement) => {
		this._validateInputs(gameId, playerId, storyIndex);

		const game = await this._getGameOrThrow(gameId);

		const repairedContent = game.repairTruncatedStory(playerId, storyIndex, replacement);
		await this._saveUpdate(game);

		emitGameUpdate(game, playerId, this.#subscribedPlayers, this.#playerNotifier);

		return {
			repairedContent,
		};
	};
};
