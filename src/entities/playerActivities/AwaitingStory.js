/** @typedef {import("./types").PlayerActivity} PlayerActivity */

/**
 * {@link PlayerActivity}
 *
 * @type {PlayerActivity}
 */
const AwaitingStory = {
	/**
	 * @template T
	 * @param {import("./types").PlayerActivityVisitor<T>} visitor
	 */
	accept(visitor) {
		return visitor.awaitingStory();
	},
};
exports.AwaitingStory = AwaitingStory;
