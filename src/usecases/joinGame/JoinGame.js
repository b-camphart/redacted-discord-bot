const { PlayerNotFound } = require("../../repositories/UserRepositoryExceptions");
const { UpdateGameUseCase } = require("../abstractUseCases/UpdateGameUseCase");
const { PlayerJoinedGame } = require("./PlayerJoinedGame");
const { GameAlreadyStarted } = require("../../entities/Game.Exceptions");
const { param } = require("../../validation");
/**
 * @template {string | undefined} T
 * @typedef {import("../../entities/types").Game<T>} Game<T>
 */

/**
 * @implements {UseCases.GameJoining}
 */
exports.JoinGame = class JoinGame extends UpdateGameUseCase {
	#userRepository;
	#playerNotifier;

	/**
	 *
	 * @param {import("../../repositories/GameRepository").UpdateGameRepository} gameRepository
	 * @param {import("../../repositories/UserRepository").ReadOnlyUserRepository} userRepository
	 * @param {import("../../repositories/PlayerNotifier").PlayerNotifier} playerNotifier
	 */
	constructor(gameRepository, userRepository, playerNotifier) {
		super(gameRepository);
		this.#userRepository = userRepository;
		this.#playerNotifier = playerNotifier;
	}

	/**
	 *
	 * See - {@link UseCases.GameJoining.joinGame}
	 *
	 * @param {string} gameId
	 * @param {string} playerId
	 */
	joinGame = async (gameId, playerId) => {
		param("gameId", gameId).isRequired().mustBeString();
		param("playerId", playerId).isRequired().mustBeString();
		const game = await this._getGameOrThrow(gameId);
		if (game.isStarted) throw new GameAlreadyStarted(gameId);
		const user = await this.#getUser(playerId);

		if (game.addPlayer(user.id) === undefined) return;

		this._games.replace(game);
		return new PlayerJoinedGame(gameId, playerId);
	};

	/**
	 *
	 * @param {string} userId
	 * @throws {UserNotFound} if the user does not exist
	 */
	async #getUser(userId) {
		const user = await this.#userRepository.get(userId);
		if (user === undefined) throw new PlayerNotFound(userId);
		return user;
	}
};
