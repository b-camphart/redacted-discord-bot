const { StartStoryController } = require("./StartStoryController");

const method = "post";
const path = "/api/v1/game/{gameId}/story";

/** @typedef {import("./StartStoryController").ExpectedParams} ExpectedParams */
/** @typedef {import("./StartStoryController").ExpectedBody} ExpectedBody */

/**
 * @type {import("../../rest/types").RestRoute<ExpectedParams, ExpectedBody>}
 */
const route = {
	createValidRequest: (userId, params, body) => {
		return {
			...StartStoryController.request(params, userId, body),
			method: method.toUpperCase(),
			path: path.replace("{gameId}", params.gameId),
		};
	},
	register: (routeRegistration, controller) => {
		return routeRegistration[method](path, (request) => controller.handle(request));
	},
};

module.exports = route;
