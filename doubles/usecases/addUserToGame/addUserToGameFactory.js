const { AddUserToGameUseCase } = require("../../../usecases/addUserToGame/AddUserToGameUseCase");
const { FakeGameRepository } = require("../../repositories/FakeGameRepository");
const { FakeUserRepository } = require("../../repositories/FakeUserRepository");

/**
 *
 * @param {object} repositories
 * @param {import("../../../repositories/UserRepositoryExceptions").UserRepository} repositories.users
 * @param {import("../../../repositories/GameRepository").GameRepository} repositories.games
 * @returns {import("../../../usecases/addUserToGame/AddUserToGame").AddUserToGame}
 */
exports.makeAddUserToGame = (users = new FakeUserRepository(), games = new FakeGameRepository()) => {
    return new AddUserToGameUseCase(users, games);
};
