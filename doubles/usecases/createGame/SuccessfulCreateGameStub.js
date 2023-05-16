const { User } = require("../../../src/entities/User");
const { GameCreated } = require("../../../src/usecases/createGame/GameCreated");

/**
 * {@link UseCases.GameCreation}
 * @implements {UseCases.GameCreation}
 */
exports.SuccessfulCreateGameStub = class SuccessfulCreateGameStub {
	/**
	 *
	 * @param {string} createdGameId
	 */
	constructor(createdGameId) {
		this.createdGameId = createdGameId;
	}

	/**
	 * {@link UseCases.GameCreation.createGame}
	 *
	 * @param {string} creatorId
	 *
	 * @returns {Promise<GameCreated>}
	 */
	async createGame(creatorId) {
		const user = /** @type {User & {id: string}} */ (new User({ id: creatorId }));
		return new GameCreated(this.createdGameId, user);
	}
};
