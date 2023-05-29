/** @typedef {import("../../types").HttpResponse} HttpResponse */
/**
 * @template {HttpResponse} T
 * @typedef {import("../../types").Controller<T>} Controller<T>
 */
/**
 * @template {HttpResponse} T
 * @typedef {import("../types").RequestAuthorizer<T>} RequestAuthorizer<T>
 */

const { PlayerJoinedGame } = require("../../../../src/usecases/joinGame/PlayerJoinedGame");
const { Successful } = require("../../HttpResponseStatusCodes");
const { HttpUseCaseErrorHandler } = require("../HttpUseCaseErrorHandler");
const { getUserId, RequestValidatorImpl, getGameId } = require("../getUserId");

/**
 * @typedef {object} ExpectedParams
 * @prop {string} gameId
 */

/**
 * @typedef {undefined} ExpectedBody
 */

/**
 * @template {HttpResponse} T
 * @implements {Controller<T>}
 * @implements {RequestAuthorizer<T>}
 */
class JoinGameController {
	/**
	 *
	 * @param {ExpectedParams} params
	 * @param {string} userId
	 */
	static request(params, userId) {
		return {
			params,
			session: {
				id: userId,
			},
		};
	}

	#responseTypes;
	#usecase;
	/**
	 * @param {import("../../types").ResponseTypes<T>} responseTypes
	 * @param {UseCases.GameJoining} usecase
	 */
	constructor(responseTypes, usecase) {
		this.#responseTypes = responseTypes;
		this.#usecase = usecase;
	}

	responseTypes() {
		return this.#responseTypes;
	}

	/**
	 *
	 * @param {import("../../types").HttpRequest} request
	 *
	 * @returns {Promise<T>}
	 */
	async handle(request) {
		const validator = new RequestValidatorImpl(this.#responseTypes);

		let gameId = getGameId(validator, request);

		const badRequest = validator.badRequest();
		if (badRequest != null) {
			return badRequest;
		}
		gameId = /** @type {string} */ (gameId);

		const userId = getUserId(this, request);
		if (typeof userId !== "string") return userId;

		return await this.#executeUseCase(gameId, userId);
	}

	/**
	 *
	 * @param {string} gameId
	 * @param {string} userId
	 * @returns
	 */
	#executeUseCase(gameId, userId) {
		return this.#usecase
			.joinGame(gameId, userId)
			.then((output) => this.#convertOutputToResponse(output))
			.catch(new HttpUseCaseErrorHandler(this.#responseTypes).handle);
	}

	/**
	 *
	 * @param {PlayerJoinedGame | void} output
	 * @returns
	 */
	#convertOutputToResponse(output) {
		const response = {
			status: Successful.OK,
			body: JSON.stringify(output),
			contentType: "application/json",
		};
		if (typeof output !== "object") response.status = Successful["Already Reported"];
		return this.#responseTypes.sendStatusWithBody(response);
	}
}

exports.JoinGameController = JoinGameController;
