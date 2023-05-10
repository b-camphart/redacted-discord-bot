const { FakeGameRepository } = require("../../repositories/FakeGameRepository");
const { DumbPlayerNotifier } = require("../../repositories/PlayerNotifierDoubles");
const { DumbSubscribedPlayerRepository } = require("../../repositories/SubscribedPlayerRepositoryDoubles");

/**
 * @this {import("./StartStoryContext").StartStoryContext}
 * @param {any} [gameId]
 * @param {any} [playerId]
 * @param {any} [content]
 * @returns
 */
function startStory(gameId, playerId, content) {
    const { StartStory } = require("../../../src/usecases");
    const games = (this.games && this.games()) || new FakeGameRepository();
    const subscriptions = (this.subscriptions && this.subscriptions()) || new DumbSubscribedPlayerRepository();
    const playerNotifier = (this.playerNotifier && this.playerNotifier()) || new DumbPlayerNotifier();
    const useCase = new StartStory(games, subscriptions, playerNotifier);
    return useCase.startStory(gameId, playerId, content);
}

exports.startStory = startStory;
/**
 *
 * @param {import("./StartStoryContext").StartStoryContext} context
 * @returns
 */
exports.makeStartStory = (context) => {
    return startStory.bind(context);
};
