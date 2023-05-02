exports.UserAlreadyInGame = class UserAlreadyInGame extends Error {
    /**
     *
     * @param {string} gameId
     * @param {string} userId
     */
    constructor(gameId, userId) {
        super();
        this.gameId = gameId;
        this.userId = userId;
    }
};
