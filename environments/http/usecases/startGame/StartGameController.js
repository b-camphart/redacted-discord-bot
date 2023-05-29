/** @typedef {import("../../types").HttpResponse} HttpResponse */
/**
 * @template {HttpResponse} T
 * @typedef {import("../../types").Controller<T>} Controller<T>
 */
/**
 * @template {HttpResponse} T
 * @typedef {import("../types").RequestAuthorizer<T>} RequestAuthorizer<T>
 */

const { Successful } = require("../../HttpResponseStatusCodes");
const { HttpUseCaseErrorHandler } = require("../HttpUseCaseErrorHandler");
const { getUserId, getGameId, RequestValidatorImpl } = require("../getUserId");

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
exports.StartGameController = class StartGameController {
	/**
	 *
	 * @param {ExpectedParams} params
	 * @param {string} userId
	 */
	static request(params, userId) {
		return {
			params,
			session: { id: userId },
		};
	}

	#responseTypes;
	#usecase;
	/**
	 * @param {import("../../types").ResponseTypes<T>} responseTypes
	 * @param {UseCases.GameStart} usecase
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
	 */
	async handle(request) {
		const validator = new RequestValidatorImpl(this.#responseTypes);

		const gameId = getGameId(validator, request);

		const badRequest = validator.badRequest();
		if (badRequest != null) {
			return badRequest;
		}

		const userId = getUserId(this, request);
		if (typeof userId !== "string") {
			return userId;
		}

		return await this.#usecase
			.startGame(/** @type {string} */ (gameId), userId)
			.then((event) => this.#responseTypes.sendStatus(Successful.OK, JSON.stringify(event)))
			.catch(new HttpUseCaseErrorHandler(this.#responseTypes).handle);
	}
};
