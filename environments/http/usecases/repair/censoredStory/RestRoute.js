const { RouteRejection } = require("../../../RouteRejection");
const { rejectRequestRoutingIfQueryCommandNotMatching } = require("../../../rest/RestRouteRejection");
const { RepairCensoredStoryController } = require("./RepairCensoredStoryController");

const method = "patch";
const path = "/api/v1/game/{gameId}/story/{storyIndex}/entry";
const command = "repairCensored";

/** @typedef {import("./RepairCensoredStoryController").ExpectedParams} ExpectedParams */
/** @typedef {import("./RepairCensoredStoryController").ExpectedBody} ExpectedBody */

/**
 *
 * @type {import("../../../rest/types").RestRoute<ExpectedParams, ExpectedBody>}
 */
const route = {
	createValidRequest: (userId, params, body) => {
		return {
			...RepairCensoredStoryController.request(params, userId, body),
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
