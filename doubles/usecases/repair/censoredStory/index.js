const { FakeGameRepository } = require("../../../repositories/FakeGameRepository");
const { DumbPlayerNotifier } = require("../../../repositories/PlayerNotifierDoubles");
const { DumbSubscribedPlayerRepository } = require("../../../repositories/SubscribedPlayerRepositoryDoubles");

/**
 *
 * @this {import("./types").RepairCensoredStoryContext}
 * @param {any} [gameId]
 * @param {any} [playerId]
 * @param {any} [storyIndex]
 * @param {any} [replacements]
 * @returns
 */
function repairCensoredStory(gameId, playerId, storyIndex, replacements) {
    const { RepairStory } = require("../../../../src/usecases");
    const games = (this?.games && this.games()) || new FakeGameRepository();
    const subscriptions = (this.subscriptions && this.subscriptions()) || new DumbSubscribedPlayerRepository();
    const playerNotifier = (this.playerNotifier && this.playerNotifier()) || new DumbPlayerNotifier();
    const useCase = new RepairStory(games, subscriptions, playerNotifier);
    return useCase.repairStory(gameId, playerId, storyIndex, replacements);
}

exports.repairCensoredStory = repairCensoredStory;

/**
 *
 * @param {import("./types").RepairCensoredStoryContext} context
 */
exports.make = (context) => {
    return repairCensoredStory.bind(context);
};
