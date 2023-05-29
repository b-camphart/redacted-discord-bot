/**
 * @param {string} ipAddress
 * @param {object} params
 *
 * @returns {import("../../environments/http/types").HttpRequest}
 */
exports.createEmptyRequest = (ipAddress = "", params = {}) => {
	return httpRequest({
		ipAddress,
		params,
	});
};

/**
 * @param {string} ipAddress
 * @param {object} params
 * @param {object} [body]
 *
 * @returns {import("../../environments/http/types").HttpRequest}
 */
exports.createUnauthenticatedRequest = (ipAddress = "", params = {}, body = undefined) => {
	return httpRequest({
		ipAddress,
		params,
		body,
	});
};

/**
 * @param {object} session
 * @param {string} ipAddress
 * @param {object} params
 * @param {object} [body]
 *
 * @returns {import("../../environments/http/types").HttpRequest}
 */
exports.createSessionedRequest = (session, ipAddress = "", params = {}, body = undefined) => {
	return httpRequest({
		session,
		ipAddress,
		params,
		body,
	});
};

/**
 * @param {Partial<import("../../environments/http/types").HttpRequest>} params
 *
 * @returns {import("../../environments/http/types").HttpRequest}
 */
const httpRequest = ({ method, path, ipAddress, session, params, body } = {}) => {
	return {
		method: method || "GET",
		path: path || "/",
		ipAddress,
		session,
		params,
		body,
	};
};
exports.httpRequest = httpRequest;
