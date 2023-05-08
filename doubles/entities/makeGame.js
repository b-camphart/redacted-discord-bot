const { Game, UserInGame } = require("../../src/entities/Game");
const { PlayerActivity } = require("../../src/entities/Game.PlayerActivity");

/**
 *
 * @param {object} params
 * @param {string | undefined} [params.id]
 * @param {string[]} [params.userIds]
 * @param {boolean} [params.isStarted]
 * @returns {Game}
 */
exports.makeGame = (params = {}) => {
    return new Game(params.id || undefined, params.userIds, params.isStarted, []);
};
