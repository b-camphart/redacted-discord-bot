/**
 * @abstract
 */
class GameException extends Error {
	/**
	 *
	 * @param {string} gameId
	 * @param {string} message
	 */
	constructor(gameId, message) {
		super(message);
		this.gameId = gameId;
	}
}
exports.GameException = GameException;

class GameNotStarted extends GameException {
	/**
	 *
	 * @param {string} gameId The id of the game that was attempted to be started.
	 */
	constructor(gameId) {
		super(gameId, `The game ${gameId} has not yet started.`);
	}
}
exports.GameNotStarted = GameNotStarted;

class UnauthorizedGameModification extends GameException {
	/**
	 *
	 * @param {string} gameId The id of the game that was attempted to be started.
	 * @param {string} playerId
	 */
	constructor(gameId, playerId) {
		super(gameId, `Player ${playerId} is not authorized to make modifications to the game ${gameId}`);
		this.playerId = playerId;
	}
}
exports.UnauthorizedGameModification = UnauthorizedGameModification;

class GameAlreadyStarted extends GameException {
	/**
	 *
	 * @param {string} gameId The id of the game that was attempted to be started.
	 */
	constructor(gameId) {
		super(gameId, `Game ${gameId} already started.`);
	}
}
exports.GameAlreadyStarted = GameAlreadyStarted;

class InsufficientPlayers extends GameException {
	/**
	 *
	 * @param {string} gameId
	 * @param {number} requiredPlayerCount
	 * @param {number} currentPlayerCount
	 */
	constructor(gameId, requiredPlayerCount, currentPlayerCount) {
		super(gameId, `Game ${gameId} has ${currentPlayerCount} players.  Required: ${requiredPlayerCount}`);
		this.requiredPlayerCount = requiredPlayerCount;
		this.currentPlayerCount = currentPlayerCount;
	}
}
exports.InsufficientPlayers = InsufficientPlayers;

class ConflictingStory extends GameException {
	/**
	 *
	 * @param {string} gameId
	 * @param {string} playerId
	 * @param {string} existingContent
	 * @param {string} attemptedContent
	 */
	constructor(gameId, playerId, existingContent, attemptedContent) {
		super(gameId, `Player ${playerId} already has a story.`);
		this.playerId = playerId;
		this.existingContent = existingContent;
		this.attemptedContent = attemptedContent;
	}
}
exports.ConflictingStory = ConflictingStory;
