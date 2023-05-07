const { UserNotInGame } = require("../../entities/Game");
const { GameNotFound } = require("../../repositories/GameRepositoryExceptions");

/**
 * @template T
 * @param {Promise<T>} action
 * @param {string} expectedGameId
 */
exports.expectActionToThrowGameNotFound = async (action, expectedGameId) => {
    const rejection = expect(action).rejects;
    await rejection.toThrow(GameNotFound);
    await rejection.toThrow(`Game <${expectedGameId}> was not found.`);
    await rejection.toHaveProperty("gameId", expectedGameId);
};
/**
 * @template T
 * @param {Promise<T>} action
 * @param {string} expectedUserId
 * @param {string} expectedGameId
 */
exports.expectActionToThrowUserNotInGame = async (action, expectedUserId, expectedGameId) => {
    await expect(action).rejects.toThrow(UserNotInGame);
    await expect(action).rejects.toThrow(`User ${expectedUserId} not in game ${expectedGameId}`);
    await expect(action).rejects.toHaveProperty("gameId", expectedGameId);
    await expect(action).rejects.toHaveProperty("userId", expectedUserId);
};
