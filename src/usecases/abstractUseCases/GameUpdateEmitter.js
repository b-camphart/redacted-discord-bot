const { PlayerActivity } = require("../../entities/Game.PlayerActivity");
const { PlayerActivityChanged } = require("../applicationEvents");

/**
 *
 * @param {import("../../entities/types").Game<string>} game
 * @param {string} updateId
 * @param {import("../../repositories/SubscribedPlayerRepository").ReadOnlySubscribedPlayerRepository} subscriberRepo
 * @param {import("../../repositories/PlayerNotifier").PlayerNotifier} notifier
 */
exports.emitGameUpdate = async (game, updateId, subscriberRepo, notifier) => {
    const subscribedPlayers = await subscriberRepo.playersSubscribedToGame(game.id);
    subscribedPlayers.forEach((subscribedPlayer) => {
        const activity = game.playerActivity(subscribedPlayer);
        if (subscribedPlayer !== updateId && activity === PlayerActivity.AwaitingStory) return;
        notifier.notifyPlayer(subscribedPlayer, new PlayerActivityChanged(game.id, subscribedPlayer, activity));
    });
};
