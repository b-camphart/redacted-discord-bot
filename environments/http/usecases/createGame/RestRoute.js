const { CreateGameController } = require("./CreateGameController");

const method = "post";
const path = "/api/v1/game";

/** @typedef {import("./CreateGameController").ExpectedParams} ExpectedParams */
/** @typedef {import("./CreateGameController").ExpectedBody} ExpectedBody */

/**
 * @type {import("../../rest/types").RestRoute<ExpectedParams, ExpectedBody>}
 */
const route = {
	createValidRequest: (userId) => {
		return {
			...CreateGameController.request(userId),
			method: method.toUpperCase(),
			path,
			params: undefined,
		};
	},
	register: (routeRegistration, controller) => {
		routeRegistration[method](path, (request) => controller.handle(request));
	},
};

module.exports = route;
