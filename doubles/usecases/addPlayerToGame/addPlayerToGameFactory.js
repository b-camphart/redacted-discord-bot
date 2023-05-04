const AddPlayerToGameNamespace = require("../../../usecases/addPlayerToGame/AddPlayerToGame");

/**
 *
 * @param {AddPlayerToGameNamespace.GameRepository} gameRepository
 * @param {AddPlayerToGameNamespace.UserRepository} userRepository
 * @param {AddPlayerToGameNamespace.PlayerNotifier} playerNotifier
 * @returns {AddPlayerToGameNamespace.AddPlayerToGame}
 */
exports.makeAddPlayerToGame = (gameRepository, userRepository, playerNotifier) => {
    return new AddPlayerToGameNamespace.AddPlayerToGame(gameRepository, userRepository, playerNotifier);
};
