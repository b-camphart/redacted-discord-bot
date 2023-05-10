const { FakeGameRepository } = require("../../repositories/FakeGameRepository");
const { DumbPlayerNotifier } = require("../../repositories/PlayerNotifierDoubles");
const { DumbSubscribedPlayerRepository } = require("../../repositories/SubscribedPlayerRepositoryDoubles");

/**
 * @this {import("./StartGameContext").StartGameContext}
 * @param {any} [gameId]
 * @param {any} [playerId]
 * @returns
 */
function startGame(gameId, playerId) {
    const { StartGame } = require("../../../src/usecases");
    const games = (this?.games && this.games()) || new FakeGameRepository();
    const subscriptions = (this?.subscriptions && this.subscriptions()) || new DumbSubscribedPlayerRepository();
    const playerNotifier = (this?.playerNotifier && this.playerNotifier()) || new DumbPlayerNotifier();
    const useCase = new StartGame(games, subscriptions, playerNotifier);
    return useCase.startGame(gameId, playerId);
}

exports.startGame = startGame;
/**
 *
 * @param {import("./StartGameContext").StartGameContext} context
 * @returns
 */
exports.makeStartGame = (context) => {
    return startGame.bind(context);
};
