/** @typedef {import("./types").PlayerActivity} PlayerActivity */

/**
 * {@link PlayerActivity}
 *
 * @implements {PlayerActivity}
 */
class RepairingTruncatedStory {
	/**
	 *
	 * @param {number} storyIndex
	 * @param {string} censoredContent
	 * @param {number} truncationIndex
	 */
	constructor(storyIndex, censoredContent, truncationIndex) {
		this.storyIndex = storyIndex;
		this.content = censoredContent;
		this.truncationIndex = truncationIndex;
	}

	/**
	 * @template T
	 * @param {import("./types").PlayerActivityVisitor<T>} visitor
	 */
	accept(visitor) {
		return visitor.repairingTruncation(this.content, this.truncationIndex, this.storyIndex);
	}
}
exports.RepairingTruncatedStory = RepairingTruncatedStory;
