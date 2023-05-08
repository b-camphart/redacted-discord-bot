const { GameNotFound } = require("../../repositories/GameRepositoryExceptions");
const { param } = require("../../validation");
/**
 * @template {string | undefined} T
 * @typedef {import("../../entities/types").Game<T>} Game<T>
 */

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
     * @returns {Promise<Game<string> | undefined>}
     */
    async _getGame(gameId) {
        return await this.#games.get(gameId);
    }

    /**
     * @protected
     * @param {string} gameId
     * @throws {GameNotFound} if the game with the specified id does not exist.
     * @returns {Promise<Game<string>>}
     */
    async _getGameOrThrow(gameId) {
        const game = await this._getGame(gameId);
        if (game === undefined) throw new GameNotFound(gameId);
        return game;
    }
}

exports.GameUseCase = GameUseCase;
