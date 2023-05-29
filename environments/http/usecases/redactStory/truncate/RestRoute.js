const { RouteRejection } = require("../../../RouteRejection");
const { rejectRequestRoutingIfQueryCommandNotMatching } = require("../../../rest/RestRouteRejection");
const { TruncateStoryController } = require("./TruncateStoryController");

const method = "patch";
const path = "/api/v1/game/{gameId}/story/{storyIndex}/entry";
const command = "truncate";

/** @typedef {import("./TruncateStoryController").ExpectedParams} ExpectedParams */
/** @typedef {import("./TruncateStoryController").ExpectedBody} ExpectedBody */

/**
 * @type {import("../../../rest/types").RestRoute<ExpectedParams, ExpectedBody>}
 */
const route = {
	createValidRequest: (userId, params, body) => {
		return {
			...TruncateStoryController.request(params, userId, body),
			method: method.toUpperCase(),
			path:
				path.replace("{gameId}", params.gameId).replace("{storyIndex}", "" + params.storyIndex) +
				`?command=${command}`,
			query: {
				command,
			},
		};
	},
	register: (routeRegistration, controller) => {
		routeRegistration[method](path, async (request) => {
			rejectRequestRoutingIfQueryCommandNotMatching(request, command);
			return await controller.handle(request);
		});
	},
};

module.exports = route;
