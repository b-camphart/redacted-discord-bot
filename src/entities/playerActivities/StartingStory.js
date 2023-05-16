/** @typedef {import("./types").PlayerActivity} PlayerActivity */

/**
 * {@link PlayerActivity}
 *
 * @type {PlayerActivity}
 */
const StartingStory = {
	/**
	 * @template T
	 * @param {import("./types").PlayerActivityVisitor<T>} visitor
	 */
	accept(visitor) {
		return visitor.startingStory();
	},
};
exports.StartingStory = StartingStory;
