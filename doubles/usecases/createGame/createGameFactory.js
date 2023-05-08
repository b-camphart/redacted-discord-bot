const { FakeGameRepository } = require("../../repositories/FakeGameRepository");
const { FakeUserRepository } = require("../../repositories/FakeUserRepository");
const { CreateGame } = require("../../../src/usecases/createGame/CreateGame");

/**
 *
 * @param {object} repositories
 * @param {import("../../../repositories/UserRepository").ReadOnlyUserRepository} repositories.users
 * @param {import("../../../repositories/GameRepository").CreateGameRepository} repositories.games
 * @returns {CreateGame}
 */
exports.makeCreateGame = (users = new FakeUserRepository(), games = new FakeGameRepository()) => {
    return new CreateGame(users, games);
};
