const { RouteRejection } = require("../RouteRejection");

/**
 *
 * @param {import("../types").HttpRequest} request
 * @param {string} [message]
 */
const rejectRequestRoutingIfQueryMissing = (request, message) => {
	if (request.query == null) {
		throw new RouteRejection(message || "Missing query.");
	}
};

/**
 *
 * @param {import("../types").HttpRequest} request
 * @param {string} paramName
 * @param {string} [message]
 */
const rejectRequestRoutingIfQueryMissingParam = (request, paramName, message) => {
	const errorMessage = message || "Missing required query parameter: " + paramName;
	rejectRequestRoutingIfQueryMissing(request, errorMessage);
	if (request.query[paramName] == null) {
		throw new RouteRejection(errorMessage);
	}
};

/**
 *
 * @param {import("../types").HttpRequest} request
 * @param {string} command
 */
const rejectRequestRoutingIfQueryCommandNotMatching = (request, command) => {
	rejectRequestRoutingIfQueryMissingParam(request, "command");

	if (request.query.command !== command) {
		throw new RouteRejection("Invalid command value: " + request.query.command);
	}
};

exports.rejectRequestRoutingIfQueryCommandNotMatching = rejectRequestRoutingIfQueryCommandNotMatching;
