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
const { RequestValidatorImpl, getGameId, getUserId } = require("../getUserId");

/**
 * @typedef {object} ExpectedParams
 * @prop {string} gameId
 */

/**
 * @typedef {object} ExpectedBody
 * @prop {string} content
 */

/**
 * @template {HttpResponse} T
 * @implements {Controller<T>}
 * @implements {RequestAuthorizer<T>}
 */
exports.StartStoryController = class StartStoryController {
	/**
	 *
	 * @param {ExpectedParams} params
	 * @param {string} userId
	 * @param {ExpectedBody} body
	 */
	static request(params, userId, body) {
		return {
			params,
			body,
			session: { id: userId },
		};
	}

	#responseTypes;
	#usecase;
	/**
	 * @param {import("../../types").ResponseTypes<T>} responseTypes
	 * @param {UseCases.StoryStart} usecase
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
		/** @type {import("../types").RequestValidator<T>} */
		const validator = new RequestValidatorImpl(this.#responseTypes);

		const gameId = getGameId(validator, request);
		const content = request.body?.content;
		if (content == null) validator.invalid("Missing required field in body: content");

		const badRequest = validator.badRequest();
		if (badRequest != null) return badRequest;

		const userId = getUserId(this, request);
		if (typeof userId !== "string") return userId;

		return await this.#usecase
			.startStory(/** @type {string} */ (gameId), userId, content)
			.then((event) => this.#responseTypes.sendStatus(Successful.Created, JSON.stringify(event)))
			.catch(new HttpUseCaseErrorHandler(this.#responseTypes).handle);
	}
};
