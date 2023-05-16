exports.GameStarted = class GameStarted {
	/**
	 *
	 * @param {string} gameId
	 * @param {string} startedBy
	 */
	constructor(gameId, startedBy) {
		this.gameId = gameId;
		this.startedBy = startedBy;
	}
};
