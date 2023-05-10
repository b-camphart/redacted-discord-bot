const { FakeGameRepository } = require("../../repositories/FakeGameRepository");
const { DumbPlayerNotifier } = require("../../repositories/PlayerNotifierDoubles");
const { DumbSubscribedPlayerRepository } = require("../../repositories/SubscribedPlayerRepositoryDoubles");

/**
 * @this {import("./TruncateStoryContext").TruncateStoryContext}
 * @param {any} [gameId]
 * @param {any} [playerId]
 * @param {any} [storyIndex]
 * @param {any} [truncationCount]
 * @returns
 */
function truncateStory(gameId, playerId, storyIndex, truncationCount) {
    const { RedactStory } = require("../../../src/usecases");
    const games = (this.games && this.games()) || new FakeGameRepository();
    const subscriptions = (this.subscriptions && this.subscriptions()) || new DumbSubscribedPlayerRepository();
    const playerNotifier = (this.playerNotifier && this.playerNotifier()) || new DumbPlayerNotifier();
    const useCase = new RedactStory(games, subscriptions, playerNotifier);
    return useCase.truncateStory(gameId, playerId, storyIndex, truncationCount);
}

exports.truncateStory = truncateStory;
/**
 *
 * @param {import("./TruncateStoryContext").TruncateStoryContext} context
 * @returns
 */
exports.makeTruncateStory = (context) => {
    return truncateStory.bind(context);
};
