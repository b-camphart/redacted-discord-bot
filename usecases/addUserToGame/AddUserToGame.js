const { Game } = require("../../entities/Game");

/**
 * @typedef {Object} AddUserToGame
 * @property {(userId: string, gameId: string) => Promise<Game>} addUser - Adds the user with the given userId to the game with the given gameId, and saves the updated game to the repository.
 */

module.exports = {};
