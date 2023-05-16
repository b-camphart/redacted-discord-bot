const { FakeGameRepository } = require("../../repositories/FakeGameRepository");
const { DumbPlayerNotifier } = require("../../repositories/PlayerNotifierDoubles");
const { DumbSubscribedPlayerRepository } = require("../../repositories/SubscribedPlayerRepositoryDoubles");

/**
 * @this {import("./types").ContinueStoryContext}
 * @param {any} [gameId]
 * @param {any} [playerId]
 * @param {any} [storyIndex]
 * @param {any} [content]
 * @returns
 */
function continueStory(gameId, playerId, storyIndex, content) {
	const { ContinueStory } = require("../../../src/usecases");
	const games = (this?.games && this.games()) || new FakeGameRepository();
	const subscriptions = (this?.subscriptions && this.subscriptions()) || new DumbSubscribedPlayerRepository();
	const playerNotifier = (this?.playerNotifier && this.playerNotifier()) || new DumbPlayerNotifier();
	const useCase = new ContinueStory(games, subscriptions, playerNotifier);
	return useCase.continueStory(gameId, storyIndex, playerId, content);
}

exports.continueStory = continueStory;

/**
 *
 * @param {import("./types").ContinueStoryContext} context
 * @returns
 */
exports.make = (context) => {
	return continueStory.bind(context);
};
