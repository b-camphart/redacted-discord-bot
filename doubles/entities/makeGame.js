const { Game } = require("../../entities/Game");

/**
 *
 * @param {object} params
 * @param {string | undefined} [params.id]
 * @param {Set<string>} [params.userIds]
 * @param {import("../../entities/Game").GameStatus} [params.status]
 * @returns
 */
exports.makeGame = (params = {}) => {
    return new Game(
        params.id || undefined,
        params.userIds || new Set(),
        params.status || "pending"
    );
};
