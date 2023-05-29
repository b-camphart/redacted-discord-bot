const { JoinGameController } = require("./JoinGameController");

const method = "post";
const path = "/api/v1/game/{gameId}/player";

/** @typedef {import("./JoinGameController").ExpectedParams} ExpectedParams */
/** @typedef {import("./JoinGameController").ExpectedBody} ExpectedBody */

/**
 * @type {import("../../rest/types").RestRoute<ExpectedParams, ExpectedBody>}
 */
const route = {
	createValidRequest: (userId, params) => {
		return {
			...JoinGameController.request(params, userId),
			method: method.toUpperCase(),
			path: path.replace("{gameId}", params.gameId),
		};
	},
	register: (routeRegistration, controller) => {
		routeRegistration[method](path, (request) => controller.handle(request));
	},
};

module.exports = route;
