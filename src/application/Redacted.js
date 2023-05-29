const { PlayerActivityService } = require("../../src/usecases/PlayerActivityService");
const UseCase = require("../../src/usecases");
/**
 * @typedef {import("./types").Redacted} IRedacted
 */

/**
 * @implements {IRedacted}
 */
class Redacted {
	#users;
	#games;
	#subscribedPlayers;
	#playerNotifier;

	/**
	 *
	 * @param {import("../../src/repositories/UserRepository").ReadOnlyUserRepository} userRepository
	 * @param {import("../../src/repositories/GameRepository").GameRepository} gameRepository
	 * @param {import("../repositories/SubscribedPlayerRepository").SubscribedPlayerRepository} subscribedPlayers
	 * @param {import("../../src/repositories/PlayerNotifier").PlayerNotifier} playerNotifier
	 */
	constructor(userRepository, gameRepository, subscribedPlayers, playerNotifier) {
		this.#users = userRepository;
		this.#games = gameRepository;
		this.#subscribedPlayers = subscribedPlayers;
		this.#playerNotifier = playerNotifier;
	}

	/**
	 * @see {@link UseCases.GameCreation.createGame}
	 *
	 * @param {string} userId
	 */
	async createGame(userId) {
		return await new UseCase.CreateGame(this.#users, this.#games).createGame(userId);
	}

	/**
	 *
	 * @param {string} gameId
	 * @param {string} playerId
	 */
	async getPlayerActivity(gameId, playerId) {
		return await new PlayerActivityService(this.#games, this.#subscribedPlayers).getPlayerActivity(
			gameId,
			playerId
		);
	}

	/**
	 *
	 * @param {string} gameId
	 * @param {string} playerId
	 */
	async trackActivity(gameId, playerId) {
		return await new PlayerActivityService(this.#games, this.#subscribedPlayers).trackActivity(gameId, playerId);
	}

	/**
	 *
	 * @param {string} gameId
	 * @param {string} playerId
	 */
	async joinGame(gameId, playerId) {
		return await new UseCase.JoinGame(this.#games, this.#users, this.#playerNotifier).joinGame(gameId, playerId);
	}

	/**
	 * @see {@link UseCases.GameStart.startGame}
	 *
	 * @param {string} gameId
	 * @param {string} playerId
	 * @param {number} [maxEntries]
	 */
	async startGame(gameId, playerId, maxEntries) {
		return await new UseCase.StartGame(this.#games, this.#subscribedPlayers, this.#playerNotifier).startGame(
			gameId,
			playerId,
			maxEntries
		);
	}

	/**
	 * @see {@link UseCases.StoryStart.startStory}
	 *
	 * @param {string} gameId
	 * @param {string} playerId
	 * @param {string} content
	 */
	async startStory(gameId, playerId, content) {
		return await new UseCase.StartStory(this.#games, this.#subscribedPlayers, this.#playerNotifier).startStory(
			gameId,
			playerId,
			content
		);
	}

	/**
	 *
	 * @param {string} gameId
	 * @param {number} storyIndex
	 * @param {string} playerId
	 * @param {number[]} wordIndices
	 */
	async censorStory(gameId, storyIndex, playerId, wordIndices) {
		return await new UseCase.RedactStory(this.#games, this.#subscribedPlayers, this.#playerNotifier).censorStory(
			gameId,
			storyIndex,
			playerId,
			wordIndices
		);
	}

	/**
	 *
	 * @param {string} gameId
	 * @param {number} storyIndex
	 * @param {string} playerId
	 * @param {number} truncateCount
	 */
	async truncateStory(gameId, storyIndex, playerId, truncateCount) {
		return await new UseCase.RedactStory(this.#games, this.#subscribedPlayers, this.#playerNotifier).truncateStory(
			gameId,
			storyIndex,
			playerId,
			truncateCount
		);
	}

	/**
	 *
	 * @param {string} gameId
	 * @param {number} storyIndex
	 * @param {string} playerId
	 * @param {string[]} replacements
	 */
	async repairCensoredStory(gameId, storyIndex, playerId, replacements) {
		return await new UseCase.RepairStory(
			this.#games,
			this.#subscribedPlayers,
			this.#playerNotifier
		).repairCensoredStory(gameId, storyIndex, playerId, replacements);
	}

	/**
	 *
	 * @param {string} gameId
	 * @param {number} storyIndex
	 * @param {string} playerId
	 * @param {string} replacement
	 */
	async repairTruncatedStory(gameId, storyIndex, playerId, replacement) {
		return await new UseCase.RepairStory(
			this.#games,
			this.#subscribedPlayers,
			this.#playerNotifier
		).repairTruncatedStory(gameId, storyIndex, playerId, replacement);
	}

	/**
	 *
	 * @param {string} gameId
	 * @param {number} storyIndex
	 * @param {string} playerId
	 * @param {string} content
	 */
	async continueStory(gameId, storyIndex, playerId, content) {
		return await new UseCase.ContinueStory(
			this.#games,
			this.#subscribedPlayers,
			this.#playerNotifier
		).continueStory(gameId, storyIndex, playerId, content);
	}
}

exports.Redacted = Redacted;
