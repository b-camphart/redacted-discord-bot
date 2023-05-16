const { UserNotInGame, UnauthorizedGameModification } = require("../../src/entities/Game.Exceptions");
const { GameNotFound } = require("../../src/repositories/GameRepositoryExceptions");

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
	await expect(action).rejects.toThrow(UnauthorizedGameModification);
	await expect(action).rejects.toThrow(
		`Player ${expectedUserId} is not authorized to make modifications to the game ${expectedGameId}`
	);
	await expect(action).rejects.toHaveProperty("gameId", expectedGameId);
	await expect(action).rejects.toHaveProperty("playerId", expectedUserId);
};
