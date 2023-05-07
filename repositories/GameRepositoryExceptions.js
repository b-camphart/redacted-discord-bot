const { NotFound } = require("./NotFound");

exports.GameNotFound = class GameNotFound extends NotFound {
    /**
     *
     * @param {string} gameId
     */
    constructor(gameId) {
        super(`Game <${gameId}> was not found.`);
        this.gameId = gameId;
    }
};
