const { User } = require("../../entities/User");

exports.GameCreated = class GameCreated {
    /**
     *
     * @param {string} gameId
     * @param {User & { id: string }} createdBy
     */
    constructor(gameId, createdBy) {
        this.gameId = gameId;
        this.createdBy = {
            playerId: createdBy.id,
        };
    }
};
