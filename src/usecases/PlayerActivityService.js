const { UserNotInGame } = require("../entities/Game.Exceptions");
const { PlayerInGameUseCase } = require("./abstractUseCases/PlayerInGameUseCase");

class PlayerActivityService extends PlayerInGameUseCase {
    /**
     *
     * @param {import("../repositories/GameRepository").ReadOnlyGameRepository} games
     */
    constructor(games) {
        super(games);
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
}

exports.PlayerActivityService = PlayerActivityService;
