const { Game } = require("../entities/Game");

/**
 * @typedef {Object} GameRepository
 * @property {(gameId: string) => Promise<Game | undefined>} get
 * @property {(game: Game) => Promise<Game>} add
 *
 */

module.exports = {};
