/** @typedef {import("./types").PlayerActivity} PlayerActivity */
const { Range } = require("../../utils/range");

/**
 * {@link PlayerActivity}
 *
 * @implements {PlayerActivity}
 */
class RepairingCensoredStory {
	/**
	 *
	 * @param {number} storyIndex
	 * @param {string} censoredContent
	 * @param {Range[]} censors
	 */
	constructor(storyIndex, censoredContent, censors) {
		this.storyIndex = storyIndex;
		this.content = censoredContent;
		this.censors = censors;
	}

	/**
	 * @template T
	 * @param {import("./types").PlayerActivityVisitor<T>} visitor
	 */
	accept(visitor) {
		return visitor.repairingCensor(this.content, this.censors, this.storyIndex);
	}
}
exports.RepairingCensoredStory = RepairingCensoredStory;
