const {
    CreateGameUseCase,
} = require("../../../usecases/createGame/CreateGameUseCase");
const { FakeGameRepository } = require("../../repositories/FakeGameRepository");
const { FakeUserRepository } = require("../../repositories/FakeUserRepository");

/**
 *
 * @param {object} repositories
 * @param {import("../../../repositories/UserRepository").UserRepository} repositories.users
 * @param {import("../../../repositories/GameRepository").GameRepository} repositories.games
 * @returns {import("../../../usecases/createGame/CreateGame").CreateGame}
 */
exports.makeCreateGame = (
    users = new FakeUserRepository(),
    games = new FakeGameRepository()
) => {
    return new CreateGameUseCase(users, games);
};
