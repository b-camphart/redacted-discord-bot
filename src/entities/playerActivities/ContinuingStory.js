/** @typedef {import("./types").PlayerActivity} PlayerActivity */

/**
 * {@link PlayerActivity}
 *
 * @implements {PlayerActivity}
 */
class ContinuingStory {
	/**
	 *
	 * @param {number} storyIndex
	 * @param {string} repairedContent
	 */
	constructor(storyIndex, repairedContent) {
		this.storyIndex = storyIndex;
		this.repairedContent = repairedContent;
	}

	/**
	 * @template T
	 * @param {import("./types").PlayerActivityVisitor<T>} visitor
	 */
	accept(visitor) {
		return visitor.continuingStory(this.repairedContent, this.storyIndex);
	}
}
exports.ContinuingStory = ContinuingStory;
