const { GameNotFound } = require("../../repositories/GameRepositoryExceptions");
const { param } = require("../../validation");

class GameUseCase {
    /** @protected DO NOT ACCESS OUTSIDE OF SUBCLASSES */
    _games;

    /** @param {import("../../repositories/GameRepository").ReadOnlyGameRepository} games */
    constructor(games) {
        this._games = games;
    }

    /**
     * @protected
     * @param {any} gameId
     */
    _validateGameId(gameId) {
        param("gameId", gameId).isRequired().mustBeString();
    }

    /**
     * @protected
     * @param {string} gameId
     * @throws {GameNotFound} if the game with the specified id does not exist.
     * @returns {Promise<import("../../repositories/GameRepository").GameWithId>}
     */
    async _getGameOrThrow(gameId) {
        const game = await this._games.get(gameId);
        if (game === undefined) throw new GameNotFound(gameId);
        return game;
    }
}

exports.GameUseCase = GameUseCase;
