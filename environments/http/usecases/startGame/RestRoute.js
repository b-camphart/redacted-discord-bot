const { StartGameController } = require("./StartGameController");

const method = "patch";
const path = "/api/v1/game/{gameId}";

/** @typedef {import("./StartGameController").ExpectedParams} ExpectedParams */
/** @typedef {import("./StartGameController").ExpectedBody} ExpectedBody */

/**
 * @type {import("../../rest/types").RestRoute<ExpectedParams, ExpectedBody>}
 */
const route = {
	createValidRequest: (userId, params) => {
		return {
			...StartGameController.request(params, userId),
			method: method.toUpperCase(),
			path: path.replace("{gameId}", params.gameId),
		};
	},
	register: (routeRegistration, controller) => {
		routeRegistration[method](path, (request) => controller.handle(request));
	},
};

module.exports = route;
