const { Game } = require("../entities/Game");

/**
 * @typedef {Object} GameRepository
 * @property {(gameId: string) => Promise<Game | undefined>} get
 * @property {(game: Game) => Promise<Game>} add
 * @property {(game: Game) => Promise<void>} replace
 *
 */

exports.GameNotFound = class GameNotFound extends Error {
    /**
     *
     * @param {string} gameId
     */
    constructor(gameId) {
        super();
        this.gameId = gameId;
    }
};
