exports.PlayerJoinedGame = class PlayerJoinedGame {
    /**
     *
     * @param {string} gameId The id of the game that the player was added to.
     * @param {string} playerId The id of the player that was added.
     */
    constructor(gameId, playerId) {
        this.gameId = gameId;
        this.addedPlayerId = playerId;
    }
};
