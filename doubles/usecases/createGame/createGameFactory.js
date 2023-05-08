const { CreateGameUseCase } = require("../../../src/usecases/createGame/CreateGameUseCase");
const { FakeGameRepository } = require("../../repositories/FakeGameRepository");
const { FakeUserRepository } = require("../../repositories/FakeUserRepository");

/**
 *
 * @param {object} repositories
 * @param {import("../../../src/repositories/UserRepository").ReadOnlyUserRepository} repositories.users
 * @param {import("../../../src/repositories/GameRepository").CreateGameRepository} repositories.games
 * @returns {import("../../../src/usecases/createGame/CreateGame").CreateGame}
 */
exports.makeCreateGame = (users = new FakeUserRepository(), games = new FakeGameRepository()) => {
    return new CreateGameUseCase(users, games);
};
