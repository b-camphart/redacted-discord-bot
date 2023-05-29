const { ClientError } = require("../HttpResponseStatusCodes");
/**
 * @template {import("../types").HttpResponse} T
 * @typedef {import("./types").RequestValidator<T>} RequestValidator<T>
 */
/**
 * @template {import("../types").HttpResponse} T
 * @param {import("./types").RequestAuthorizer<T>} authorizer
 * @param {import("../types").HttpRequest} request
 *
 * @returns {string | T}
 */
exports.getUserId = (authorizer, request) => {
	const userId = request.session?.id;
	if (userId == null) return authorizer.responseTypes().sendStatus(ClientError.Unauthorized);
	return "" + userId;
};

/**
 *
 * @template {import("../types").HttpResponse} T
 * @param {import("./types").RequestValidator<T>} validator
 * @param {import("../types").HttpRequest} request
 *
 * @returns {string | null}
 */
exports.getGameId = (validator, request) => {
	const gameId = request.params.gameId;
	if (gameId == null) {
		validator.invalid("Missing required param: gameId");
		return null;
	}
	return "" + gameId;
};

/**
 *
 * @template {import("../types").HttpResponse} T
 * @param {import("./types").RequestValidator<T>} validator
 * @param {import("../types").HttpRequest} request
 *
 * @returns {number | null}
 */
exports.getStoryIndex = (validator, request) => {
	const storyIndex = request.params.storyIndex;
	if (storyIndex == null) {
		validator.invalid("Missing required field: storyIndex");
		return null;
	}

	/** @type {number} */
	let storyIndexNum = NaN;
	try {
		if (storyIndex !== undefined) {
			storyIndexNum = Number.parseInt(storyIndex);
			if (Number.isNaN(storyIndexNum)) validator.invalid("Invalid format for storyIndex.  Must be number.");
		}
	} catch (error) {
		validator.invalid("Invalid format for storyIndex.  Must be number.");
	}
	return storyIndexNum;
};

/**
 * @template {import("../types").HttpResponse} T
 * @implements {RequestValidator<T>}
 */
exports.RequestValidatorImpl = class RequestValidatorImpl {
	/** @type {string[]} */
	#badRequests;
	#responseTypes;

	/**
	 * @param {import("../types").ResponseTypes<T>} responseTypes
	 */
	constructor(responseTypes) {
		this.#badRequests = [];
		this.#responseTypes = responseTypes;
	}

	/**
	 *
	 * @param {string} badRequest
	 */
	invalid(badRequest) {
		this.#badRequests.push(badRequest);
	}

	badRequest() {
		if (this.#badRequests.length > 0) {
			const body = {
				errors: this.#badRequests,
			};
			return this.#responseTypes.sendStatusWithBody({
				status: ClientError["Bad Request"],
				body: JSON.stringify(body),
				contentType: "application/json",
			});
		}
		return null;
	}
};
