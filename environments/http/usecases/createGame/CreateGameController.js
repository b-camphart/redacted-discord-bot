/** @typedef {import("../../types").HttpResponse} HttpResponse */
/**
 * @template {HttpResponse} T
 * @typedef {import("../../types").Controller<T>} Controller<T>
 */
/**
 * @template {HttpResponse} T
 * @typedef {import("../types").RequestAuthorizer<T>} RequestAuthorizer<T>
 */

const { GameCreated } = require("../../../../src/usecases/createGame/GameCreated");
const { ClientError, Successful } = require("../../HttpResponseStatusCodes");
const { HttpUseCaseErrorHandler } = require("../HttpUseCaseErrorHandler");

/**
 * @typedef {undefined} ExpectedParams
 */

/**
 * @typedef {undefined} ExpectedBody
 */

/**
 * @template {HttpResponse} T
 * @implements {Controller<T>}
 */
class CreateGameController {
	/**
	 *
	 * @param {string} userId
	 */
	static request(userId) {
		return {
			session: {
				id: userId,
			},
		};
	}

	#responseTypes;
	#usecase;
	/**
	 * @param {import("../../types").ResponseTypes<T>} responseTypes
	 * @param {UseCases.GameCreation} usecase
	 */
	constructor(responseTypes, usecase) {
		this.#responseTypes = responseTypes;
		this.#usecase = usecase;
	}

	/**
	 *
	 * @param {import("../../types").HttpRequest} request
	 */
	async handle(request) {
		const userId = request.session?.id;
		if (typeof userId !== "string") return this.#responseTypes.sendStatus(ClientError.Unauthorized);

		return await this.#executeUseCase(userId);
	}

	/**
	 *
	 * @param {string} userId
	 * @returns
	 */
	#executeUseCase(userId) {
		return this.#usecase
			.createGame(userId)
			.then((event) => this.#respondWithEvent(event))
			.catch(new HttpUseCaseErrorHandler(this.#responseTypes).handle);
	}

	/**
	 *
	 * @param {GameCreated} event
	 * @returns
	 */
	#respondWithEvent(event) {
		return this.#responseTypes.sendStatusWithBody({
			status: Successful.Created,
			body: this.#convertEventToJSON(event),
			contentType: "application/json",
		});
	}

	/**
	 *
	 * @param {GameCreated} event
	 */
	#convertEventToJSON(event) {
		return JSON.stringify({
			gameId: event.gameId,
			gameUrl: `/game/${event.gameId}`,
			createdBy: event.createdBy.playerId,
		});
	}
}

exports.CreateGameController = CreateGameController;
