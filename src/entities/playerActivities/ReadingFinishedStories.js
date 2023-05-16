/** @typedef {import("./types").PlayerActivity} PlayerActivity */

/**
 * {@link PlayerActivity}
 *
 * @implements {PlayerActivity}
 */
class ReadingFinishedStories {
	/**
	 *
	 * @param {import("./types").FinishedStory[]} stories
	 */
	constructor(stories) {
		this.stories = stories;
	}

	/**
	 * @template T
	 * @param {import("./types").PlayerActivityVisitor<T>} visitor
	 */
	accept(visitor) {
		return visitor.readingFinishedStories(this.stories);
	}
}
exports.ReadingFinishedStories = ReadingFinishedStories;
