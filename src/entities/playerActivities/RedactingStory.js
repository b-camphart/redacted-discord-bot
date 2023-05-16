const { censorableWords } = require("../Words");
/** @typedef {import("./types").PlayerActivity} PlayerActivity */

/**
 * {@link PlayerActivity}
 *
 * @implements {PlayerActivity}
 */
class RedactingStory {
	/**
	 *
	 * @param {number} storyIndex
	 * @param {string} entryContent
	 */
	constructor(storyIndex, entryContent) {
		this.storyIndex = storyIndex;
		this.entryContent = entryContent;
		this.wordBoundaries = censorableWords(entryContent);
	}

	/**
	 * @template T
	 * @param {import("./types").PlayerActivityVisitor<T>} visitor
	 */
	accept(visitor) {
		return visitor.redactingStory(this.entryContent, this.wordBoundaries, this.storyIndex);
	}
}
exports.RedactingStory = RedactingStory;
