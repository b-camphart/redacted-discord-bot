const { Game } = require("../entities/Game");

/**
 * @typedef {Game & {id: string}} GameWithId
 */

/**
 * @typedef {Object} GameRepository
 * @property {(gameId: string) => Promise<GameWithId | undefined>} get
 * @property {(game: Game) => Promise<GameWithId>} add
 * @property {(game: GameWithId) => Promise<void>} replace
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
