const { FakeGameRepository } = require("../../../repositories/FakeGameRepository");
const { DumbPlayerNotifier } = require("../../../repositories/PlayerNotifierDoubles");
const { DumbSubscribedPlayerRepository } = require("../../../repositories/SubscribedPlayerRepositoryDoubles");

/**
 *
 * @this {import("./types").RepairTruncatedStoryContext}
 * @param {any} [gameId]
 * @param {any} [playerId]
 * @param {any} [storyIndex]
 * @param {any} [replacement]
 * @returns
 */
function repairTruncatedStory(gameId, playerId, storyIndex, replacement) {
    const { RepairStory } = require("../../../../src/usecases");
    const games = (this?.games && this.games()) || new FakeGameRepository();
    const subscriptions = (this.subscriptions && this.subscriptions()) || new DumbSubscribedPlayerRepository();
    const playerNotifier = (this.playerNotifier && this.playerNotifier()) || new DumbPlayerNotifier();
    const useCase = new RepairStory(games, subscriptions, playerNotifier);
    return useCase.repairStory(gameId, playerId, storyIndex, replacement);
}

exports.repairTruncatedStory = repairTruncatedStory;

/**
 *
 * @param {import("./types").RepairTruncatedStoryContext} context
 */
exports.make = (context) => {
    return repairTruncatedStory.bind(context);
};
