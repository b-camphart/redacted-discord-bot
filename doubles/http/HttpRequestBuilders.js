/**
 * @param {string} ipAddress
 * @param {object} params
 *
 * @returns {import("../../environments/http/types").HttpRequest}
 */
exports.createEmptyRequest = (ipAddress = "", params = {}) => {
	return {
		ipAddress,
		params,
	};
};

/**
 * @param {string} ipAddress
 * @param {object} params
 * @param {object} [body]
 *
 * @returns {import("../../environments/http/types").HttpRequest}
 */
exports.createUnauthenticatedRequest = (ipAddress = "", params = {}, body = undefined) => {
	return {
		ipAddress,
		params,
		body,
	};
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
	return {
		session,
		ipAddress,
		params,
		body,
	};
};
