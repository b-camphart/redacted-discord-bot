const JoinGameNamespace = require("../../../src/usecases/joinGame/JoinGame");

/**
 *
 * @param {import("../../../src/repositories/GameRepository").UpdateGameRepository} gameRepository
 * @param {JoinGameNamespace.UserRepository} userRepository
 * @param {JoinGameNamespace.PlayerNotifier} playerNotifier
 * @returns {JoinGameNamespace.JoinGame}
 */
exports.makeAddPlayerToGame = (gameRepository, userRepository, playerNotifier) => {
    return new JoinGameNamespace.JoinGame(gameRepository, userRepository, playerNotifier);
};
