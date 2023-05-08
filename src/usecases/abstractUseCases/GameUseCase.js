const { Game } = require("../../entities/Game");
const { GameNotFound } = require("../../repositories/GameRepositoryExceptions");
const { param } = require("../../validation");

class GameUseCase {
    #games;

    /** @param {import("../../repositories/GameRepository").ReadOnlyGameRepository} games */
    constructor(games) {
        this.#games = games;
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
     * @returns {Promise<Game & {id:string} | undefined>}
     */
    async _getGame(gameId) {
        return await this.#games.get(gameId);
    }

    /**
     * @protected
     * @param {string} gameId
     * @throws {GameNotFound} if the game with the specified id does not exist.
     * @returns {Promise<Game & {id:string}>}
     */
    async _getGameOrThrow(gameId) {
        const game = await this._getGame(gameId);
        if (game === undefined) throw new GameNotFound(gameId);
        return game;
    }
}

exports.GameUseCase = GameUseCase;
