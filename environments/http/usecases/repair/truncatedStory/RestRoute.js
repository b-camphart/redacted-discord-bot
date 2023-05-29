const { RouteRejection } = require("../../../RouteRejection");
const { rejectRequestRoutingIfQueryCommandNotMatching } = require("../../../rest/RestRouteRejection");
const { RepairTruncatedStoryController } = require("./RepairTruncatedStoryController");

const method = "patch";
const path = "/api/v1/game/{gameId}/story/{storyIndex}/entry";
const command = "repairTruncation";

/** @typedef {import("./RepairTruncatedStoryController").ExpectedParams} ExpectedParams */
/** @typedef {import("./RepairTruncatedStoryController").ExpectedBody} ExpectedBody */

/**
 * @type {import("../../../rest/types").RestRoute<ExpectedParams, ExpectedBody>}
 */
const route = {
	createValidRequest: (userId, params, body) => {
		return {
			...RepairTruncatedStoryController.request(params, userId, body),
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
