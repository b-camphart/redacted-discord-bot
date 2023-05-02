exports.PlayerActivityChanged = class PlayerActivityChanged {
    /**
     *
     * @param {string} gameId - The id of the game for which the player activity changed
     * @param {string} playerId - The id of the player for which the activity changed
     * @param {import("../entities/Game").PlayerActivity} activity - The new activity for the player in the game
     */
    constructor(gameId, playerId, activity) {
        this.gameId = gameId;
        this.playerId = playerId;
        this.activity = activity;
    }
};
