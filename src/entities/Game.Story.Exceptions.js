const { GameException } = require("./Game.Exceptions");

/**
 * @abstract
 */
class StoryException extends GameException {
	/**
	 *
	 * @param {string} gameId
	 * @param {number} storyIndex
	 * @param {string} message
	 */
	constructor(gameId, storyIndex, message) {
		super(gameId, message);
		this.storyIndex = storyIndex;
	}
}
exports.StoryException = StoryException;

class StoryNotFound extends StoryException {
	/**
	 *
	 * @param {string} gameId
	 * @param {number} storyIndex
	 */
	constructor(gameId, storyIndex) {
		super(gameId, storyIndex, `Story ${storyIndex} was not found in game ${gameId}`);
	}
}
exports.StoryNotFound = StoryNotFound;

class InvalidWordCount extends StoryException {
	/**
	 *
	 * @param {string} gameId
	 * @param {number} storyIndex
	 * @param {number} requiredWordCount
	 * @param {number} attemptedWordCount
	 */
	constructor(gameId, storyIndex, requiredWordCount, attemptedWordCount) {
		super(
			gameId,
			storyIndex,
			`Story ${storyIndex} in game ${gameId} requires ${requiredWordCount} words.  Received: ${attemptedWordCount}.`
		);
		this.requiredWordCount = requiredWordCount;
		this.attemptedWordCount = attemptedWordCount;
	}
}
exports.InvalidWordCount = InvalidWordCount;

class UnauthorizedStoryModification extends StoryException {
	/**
	 *
	 * @param {string} gameId
	 * @param {number} storyIndex
	 * @param {string} playerId
	 */
	constructor(gameId, storyIndex, playerId) {
		super(
			gameId,
			storyIndex,
			`Player ${playerId} is not authorized to modify story ${storyIndex} in game ${gameId}.`
		);
		this.playerId = playerId;
	}
}
exports.UnauthorizedStoryModification = UnauthorizedStoryModification;

class IncorrectStoryModification extends StoryException {
	/**
	 *
	 * @param {string} gameId
	 * @param {number} storyIndex
	 * @param {string} playerId
	 * @param {string} requiredOperation
	 * @param {string} attemptedOperation
	 */
	constructor(gameId, storyIndex, playerId, requiredOperation, attemptedOperation) {
		super(
			gameId,
			storyIndex,
			`Player ${playerId} attempted ${attemptedOperation} in story ${storyIndex} in game ${gameId}.  But requires ${requiredOperation}.`
		);
		this.playerId = playerId;
		this.requiredOperation = requiredOperation;
		this.attemptedOperation = attemptedOperation;
	}
}
exports.IncorrectStoryModification = IncorrectStoryModification;
