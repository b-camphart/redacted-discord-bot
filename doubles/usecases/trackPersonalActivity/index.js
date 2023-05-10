const { FakeGameRepository } = require("../../repositories/FakeGameRepository");
const { DumbSubscribedPlayerRepository } = require("../../repositories/SubscribedPlayerRepositoryDoubles");

/**
 * @this {import("./TrackPersonalActivityContext").TrackPersonalActivityContext}
 * @param {any} [gameId]
 * @param {any} [playerId]
 * @returns
 */
function trackPersonalActivity(gameId, playerId) {
    const { PlayerActivityService } = require("../../../src/usecases/PlayerActivityService");
    const games = (this?.games && this.games()) || new FakeGameRepository();
    const subscriptions = (this?.subscriptions && this.subscriptions()) || new DumbSubscribedPlayerRepository();
    const useCase = new PlayerActivityService(games, subscriptions);
    return useCase.trackActivity(gameId, playerId);
}

exports.trackPersonalActivity = trackPersonalActivity;

/**
 *
 * @param {import("./TrackPersonalActivityContext").TrackPersonalActivityContext} context
 * @returns
 */
exports.makeTrackPersonalActivity = (context) => {
    return trackPersonalActivity.bind(context);
};
