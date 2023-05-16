const { PlayerNotFound } = require("../../repositories/UserRepositoryExceptions");
const { Game } = require("../../entities/Game");
const { GameCreated } = require("./GameCreated");
const { param } = require("../../validation");
/** @typedef {import("../../repositories/UserRepository").UserWithId} UserWithId */

/**
 * See {@link UseCases.GameCreation}
 * @implements {UseCases.GameCreation}
 */
exports.CreateGame = class CreateGame {
	#users;
	#games;

	/**
	 *
	 * @param {import("../../repositories/UserRepository").ReadOnlyUserRepository} users
	 * @param {import("../../repositories/GameRepository").CreateGameRepository} games
	 */
	constructor(users, games) {
		this.#users = users;
		this.#games = games;
	}

	/**
	 *
	 * See {@link UseCases.GameCreation.createGame}
	 *
	 * @param {string} userId
	 * @returns {Promise<GameCreated>}
	 */
	async createGame(userId) {
		CreateGame.#validateUserId(userId);
		const creator = await this.#getCreator(userId);
		const game = CreateGame.#createGameWithCreator(creator);
		const savedGame = await this.#saveGame(game);
		return new GameCreated(savedGame.id, creator);
	}

	/**
	 *
	 * @param {string} creatorId
	 * @returns {Promise<UserWithId>}
	 */
	async #getCreator(creatorId) {
		const creator = await this.#users.get(creatorId);
		if (creator === undefined) throw new PlayerNotFound(creatorId);
		return creator;
	}

	/**
	 *
	 * @param {UserWithId} creator
	 * @returns {Game<*>}
	 */
	static #createGameWithCreator(creator) {
		const game = new Game();
		game.addPlayer(creator.id);
		return game;
	}

	/**
	 *
	 * @param {Game<undefined>} game
	 */
	async #saveGame(game) {
		return await this.#games.add(game);
	}

	/**
	 *
	 * @param {any} userId
	 */
	static #validateUserId(userId) {
		param("userId", userId).isRequired().mustBeString();
	}
};
