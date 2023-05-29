const { ContinueStoryController } = require("./ContinueStoryController");

const method = "post";
const path = "/api/v1/game/{gameId}/story/{storyIndex}/entry";

/** @typedef {import("./ContinueStoryController").ExpectedParams} ExpectedParams */
/** @typedef {import("./ContinueStoryController").ExpectedBody} ExpectedBody */

/**
 *
 * @type {import("../../rest/types").RestRoute<ExpectedParams, ExpectedBody>}
 */
const route = {
	createValidRequest: (userId, params, body) => {
		return {
			...ContinueStoryController.request(params, userId, body),
			method: method.toUpperCase(),
			path: path.replace("{gameId}", params.gameId).replace("{storyIndex}", "" + params.storyIndex),
		};
	},
	register: (routeRegistration, controller) => {
		routeRegistration[method](path, (request) => controller.handle(request));
	},
};
module.exports = route;
