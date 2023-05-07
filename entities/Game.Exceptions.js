class UserNotInGame extends Error {
    /**
     *
     * @param {string} gameId
     * @param {string} userId
     */
    constructor(gameId, userId) {
        super(`User ${userId} not in game ${gameId}`);
        this.gameId = gameId;
        this.userId = userId;
    }
}

class GameAlreadyStarted extends Error {
    /**
     *
     * @param {string} gameId The id of the game that was attempted to be started.
     */
    constructor(gameId) {
        super();
        this.gameId = gameId;
    }
}

class InvalidPlayerActivity extends Error {
    /**
     *
     * @param {any} [currentActivity]
     * @param {any} [requiredActivity]
     */
    constructor(currentActivity, requiredActivity) {
        super(
            `Player currently has ${JSON.stringify(currentActivity)}, but ${JSON.stringify(
                requiredActivity
            )} was required`
        );
    }
}

module.exports = {
    UserNotInGame,
    GameAlreadyStarted,
    InvalidPlayerActivity,
};
