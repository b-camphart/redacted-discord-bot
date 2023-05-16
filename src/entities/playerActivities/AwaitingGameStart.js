/** @typedef {import("./types").PlayerActivity} PlayerActivity */

/**
 * {@link PlayerActivity}
 *
 * @type {PlayerActivity}
 */
const AwaitingGameStart = {
	/**
	 * @template T
	 * @param {import("./types").PlayerActivityVisitor<T>} visitor
	 */
	accept(visitor) {
		return visitor.awaitingGameStart();
	},
};
exports.AwaitingGameStart = AwaitingGameStart;
