exports.RouteRejection = class RouteRejection extends Error {
	/**
	 *
	 * @param {string} message
	 */
	constructor(message) {
		super(message);
	}
};
