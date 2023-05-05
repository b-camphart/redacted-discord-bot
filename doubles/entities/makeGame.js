const { Game, UserInGame } = require("../../entities/Game");
const { PlayerActivity } = require("../../entities/Game.PlayerActivity");

/**
 *
 * @param {object} params
 * @param {string | undefined} [params.id]
 * @param {string[]} [params.userIds]
 * @param {import("../../entities/Game").GameStatus} [params.status]
 * @returns {Game}
 */
exports.makeGame = (params = {}) => {
    return new Game(params.id || undefined, params.userIds, params.status || "pending", []);
};
