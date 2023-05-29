/** @typedef {import("../../../types").HttpResponse} HttpResponse */
/**
 * @template {HttpResponse} T
 * @typedef {import("../../../types").Controller<T>} Controller<T>
 */
/**
 * @template {HttpResponse} T
 * @typedef {import("../../types").RequestAuthorizer<T>} RequestAuthorizer<T>
 */

const { Successful } = require("../../../HttpResponseStatusCodes");
const { HttpUseCaseErrorHandler } = require("../../HttpUseCaseErrorHandler");
const { getUserId, RequestValidatorImpl, getGameId, getStoryIndex } = require("../../getUserId");

/**
 * @typedef {object} ExpectedParams
 * @prop {string} gameId
 * @prop {number} storyIndex
 */

/**
 * @typedef {object} ExpectedBody
 * @prop {number} truncationCount
 */

/**
 * @template {HttpResponse} T
 * @implements {Controller<T>}
 * @implements {RequestAuthorizer<T>}
 */
exports.TruncateStoryController = class TruncateStoryController {
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
	 * @param {import("../../../types").ResponseTypes<T>} responseTypes
	 * @param {UseCases.StoryTruncation} usecase
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
	 * @param {import("../../../types").HttpRequest} request
	 */
	async handle(request) {
		/** @type {import("../../types").RequestValidator<T>} */
		const validator = new RequestValidatorImpl(this.#responseTypes);

		const gameId = getGameId(validator, request);
		const storyIndex = getStoryIndex(validator, request);
		const truncationCount = request.body.truncationCount;
		if (truncationCount === undefined) validator.invalid("Missing required field in body: truncationCount");

		const badRequest = validator.badRequest();
		if (badRequest != null) return badRequest;

		const userId = getUserId(this, request);
		if (typeof userId !== "string") return userId;

		return await this.#usecase
			.truncateStory(/** @type {string} */ (gameId), /** @type {number} */ (storyIndex), userId, truncationCount)
			.then((event) => this.#responseTypes.sendStatus(Successful.OK, JSON.stringify(event)))
			.catch(new HttpUseCaseErrorHandler(this.#responseTypes).handle);
	}
};
