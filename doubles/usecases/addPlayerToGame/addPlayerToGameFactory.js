const {
    AddPlayerToGameUseCase,
} = require("../../../usecases/addPlayerToGame/AddPlayerToGameUseCase");

/**
 *
 * @param {import("../../../repositories/GameRepository").GameRepository} gameRepository
 * @param {import("../../../repositories/UserRepository").UserRepository} userRepository
 * @param {import("../../../repositories/PlayerNotifier").PlayerNotifier} playerNotifier
 * @returns {import("../../../usecases/addPlayerToGame/AddPlayerToGame").AddPlayerToGame}
 */
exports.makeAddPlayerToGame = (
    gameRepository,
    userRepository,
    playerNotifier
) => {
    return new AddPlayerToGameUseCase(
        gameRepository,
        userRepository,
        playerNotifier
    );
};
