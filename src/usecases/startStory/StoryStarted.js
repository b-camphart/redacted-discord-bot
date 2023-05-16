exports.StoryStarted = class StoryStarted {
	/**
	 *
	 * @param {string} gameId
	 * @param {string} startedBy
	 * @param {number} storyIndex
	 * @param {string} content
	 */
	constructor(gameId, startedBy, storyIndex, content) {
		this.gameId = gameId;
		this.startedBy = startedBy;
		this.storyIndex = storyIndex;
		this.content = content;
	}
};
