const { NotFound } = require("./NotFound");

exports.PlayerNotFound = class PlayerNotFound extends NotFound {
	/**
	 *
	 * @param {string} playerId
	 */
	constructor(playerId) {
		super(`Player ${playerId} not found.`);
		this.playerId = playerId;
	}
};
