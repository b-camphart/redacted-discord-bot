const { FakeGameRepository } = require("../../repositories/FakeGameRepository");
const { DumbPlayerNotifier } = require("../../repositories/PlayerNotifierDoubles");
const { DumbSubscribedPlayerRepository } = require("../../repositories/SubscribedPlayerRepositoryDoubles");

/**
 * @this {import("./CensorStoryContext").CensorStoryContext}
 * @param {any} [gameId]
 * @param {any} [playerId]
 * @param {any} [storyIndex]
 * @param {any} [wordIndices]
 * @returns
 */
function censorStory(gameId, playerId, storyIndex, wordIndices) {
    const { RedactStory } = require("../../../src/usecases");
    const games = (this.games && this.games()) || new FakeGameRepository();
    const subscriptions = (this.subscriptions && this.subscriptions()) || new DumbSubscribedPlayerRepository();
    const playerNotifier = (this.playerNotifier && this.playerNotifier()) || new DumbPlayerNotifier();
    const useCase = new RedactStory(games, subscriptions, playerNotifier);
    return useCase.censorStory(gameId, playerId, storyIndex, wordIndices);
}

exports.censorStory = censorStory;
/**
 *
 * @param {import("./CensorStoryContext").CensorStoryContext} context
 * @returns
 */
exports.makeCensorStory = (context) => {
    return censorStory.bind(context);
};
