const { GameCreated } = require("../../../src/usecases/createGame/GameCreated");

/**
 * {@link UseCases.GameCreation}
 * @implements {UseCases.GameCreation}
 */
exports.FailingCreateGameStub = class FailingCreateGameStub {
	/**
	 *
	 * @param {any} [failure]
	 */
	constructor(failure) {
		this.failure = failure || new Error("Expected failure");
	}

	reset() {
		this.failure = new Error("Expected failure");
	}

	/**
	 * {@link UseCases.GameCreation.createGame}
	 *
	 * @param {string} creatorId
	 *
	 * @returns {Promise<GameCreated>}
	 */
	async createGame(creatorId) {
		throw this.failure;
	}
};
