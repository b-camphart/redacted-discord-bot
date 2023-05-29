const {
	UnauthorizedGameModification,
	GameAlreadyStarted,
	InsufficientPlayers,
} = require("../../../src/entities/Game.Exceptions");
const { UnauthorizedStoryModification } = require("../../../src/entities/Game.Story.Exceptions");
const { GameNotFound } = require("../../../src/repositories/GameRepositoryExceptions");
const { PlayerNotFound } = require("../../../src/repositories/UserRepositoryExceptions");
const { NotEnoughPlayersToStartGame } = require("../../../src/usecases/startGame/validation");
const { ClientError } = require("../HttpResponseStatusCodes");

/**
 * {@link Promise.catch}
 *
 * @template {import("../types").HttpResponse} T
 */
exports.HttpUseCaseErrorHandler = class HttpUseCaseErrorHandler {
	#responseTypes;
	/**
	 * @param {import("../types").ResponseTypes<T>} responseTypes
	 */
	constructor(responseTypes) {
		this.#responseTypes = responseTypes;
	}

	/**
	 *
	 * @param {any} reason
	 */
	handle = (reason) => {
		if (reason instanceof NotImplemented) return this.#responseTypes.sendStatus(418);

		console.error(reason);
		if (reason instanceof TypeError) return this.#responseTypes.sendStatus(ClientError["Bad Request"]);
		if (reason instanceof UnauthorizedGameModification) return this.#responseTypes.sendStatus(403);
		if (reason instanceof PlayerNotFound) return this.#responseTypes.sendStatus(403);
		if (reason instanceof UnauthorizedStoryModification) return this.#responseTypes.sendStatus(403);
		if (reason instanceof GameNotFound) return this.#responseTypes.sendStatus(404);
		if (reason instanceof InsufficientPlayers) return this.#responseTypes.sendStatus(424, "Insufficient Players");
		if (reason instanceof GameAlreadyStarted) return this.#responseTypes.sendStatus(409, "Game already started");

		return this.#responseTypes.sendStatus(500);
	};
};

class NotImplemented extends Error {
	constructor() {
		super("Not implemented");
	}
}
exports.NotImplemented = NotImplemented;
