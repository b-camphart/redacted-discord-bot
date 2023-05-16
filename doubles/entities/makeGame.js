const { Game } = require("../../src/entities/Game");
const { repeat } = require("../../src/utils/iteration");

/**
 *
 * @param {object} params
 * @param {string | undefined} [params.id]
 * @param {string[]} [params.userIds]
 * @param {boolean} [params.isStarted]
 * @returns {import("../../src/entities/types").Game<*>}
 */
exports.makeGame = (params = {}) => {
	return new Game(params.id || undefined, params.userIds, params.isStarted, []);
};

/**
 *
 * @param {object} [params]
 * @param {string[]} [params.includedPlayerIds]
 * @param {number} [params.maxStoryEntries]
 */
exports.createStartedGame = (params = {}) => {
	const game = this.makeGame();
	params?.includedPlayerIds?.forEach((playerId) => game.addPlayer(playerId));
	if (game.playerIds.length < 4) {
		repeat(4 - game.playerIds.length, (i) => game.addPlayer(`unique-player-id-${game.playerIds.length + i}`));
	}
	game.start(params?.maxStoryEntries);
	return game;
};
