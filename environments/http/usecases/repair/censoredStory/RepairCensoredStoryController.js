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
 * @prop {string[]} replacements
 */

/**
 * @template {HttpResponse} T
 * @implements {Controller<T>}
 * @implements {RequestAuthorizer<T>}
 */
exports.RepairCensoredStoryController = class RepairCensoredStoryController {
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
	 * @param {UseCases.CensoredStoryRepair} usecase
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
		const replacements = request.body?.replacements;
		if (replacements == null) validator.invalid("Missing required field in body: replacements");

		const badRequest = validator.badRequest();
		if (badRequest != null) return badRequest;

		const userId = getUserId(this, request);
		if (typeof userId !== "string") return userId;

		return await this.#usecase
			.repairCensoredStory(
				/** @type {string} */ (gameId),
				/** @type {number} */ (storyIndex),
				userId,
				replacements
			)
			.then((event) => this.#responseTypes.sendStatus(Successful.OK, JSON.stringify(event)))
			.catch(new HttpUseCaseErrorHandler(this.#responseTypes).handle);
	}
};
