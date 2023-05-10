const { UserNotInGame } = require("../entities/Game.Exceptions");
const { PlayerInGameUseCase } = require("./abstractUseCases/PlayerInGameUseCase");

class PlayerActivityService extends PlayerInGameUseCase {
    #subscribedPlayers;

    /**
     *
     * @param {import("../repositories/GameRepository").ReadOnlyGameRepository} games
     * @param {import("../repositories/SubscribedPlayerRepository").SubscribedPlayerRepository} subscribedPlayers
     */
    constructor(games, subscribedPlayers) {
        super(games);
        this.#subscribedPlayers = subscribedPlayers;
    }

    /**
     *
     * @param {string} gameId
     * @param {string} playerId
     * @returns
     */
    async getPlayerActivity(gameId, playerId) {
        this._validateGameId(gameId);
        this._validatePlayerId(playerId);
        const game = await this._getGameOrThrow(gameId);

        const activity = game.playerActivity(playerId);
        if (activity === undefined) throw new UserNotInGame(gameId, playerId);
        return activity;
    }

    /**
     *
     * @param {string} gameId
     * @param {string} playerId
     */
    async trackActivity(gameId, playerId) {
        const game = await this._getGameOrThrow(gameId);
        if (!game.hasPlayer(playerId)) throw new UserNotInGame(gameId, playerId);
        this.#subscribedPlayers.add({ gameId, playerId });
    }
}

exports.PlayerActivityService = PlayerActivityService;
