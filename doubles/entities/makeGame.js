const { Game, UserInGame, AWAITING_START } = require("../../entities/Game");

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
        Array.from(params.userIds || new Set()).map(
            (userId) => new UserInGame(userId, AWAITING_START)
        ),
        params.status || "pending"
    );
};
