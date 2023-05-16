const { User } = require("../../../src/entities/User");
const { GameCreated } = require("../../../src/usecases/createGame/GameCreated");
const { FailingCreateGameStub } = require("./FailingCreateGameStub");

/**
 * {@link UseCases.GameCreation}
 * @implements {UseCases.GameCreation}
 */
exports.CreateGameSpy = class CreateGameSpy {
	#backingBehavior;

	/**
	 *
	 * @param {UseCases.GameCreation} [backingBehavior]
	 */
	constructor(backingBehavior = new FailingCreateGameStub()) {
		this.#backingBehavior = backingBehavior;
	}

	/**
	 * {@link UseCases.GameCreation.createGame}
	 *
	 * @param {string} creatorId
	 *
	 * @returns {Promise<GameCreated>}
	 */
	createGame(creatorId) {
		this.spiedCreatorId = creatorId;
		return this.#backingBehavior.createGame(creatorId);
	}
};
