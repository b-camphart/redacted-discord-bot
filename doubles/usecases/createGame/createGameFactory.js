const CreateGameNamespace = require("../../../usecases/createGame/CreateGame");
const { FakeGameRepository } = require("../../repositories/FakeGameRepository");
const { FakeUserRepository } = require("../../repositories/FakeUserRepository");

/**
 *
 * @param {object} repositories
 * @param {CreateGameNamespace.UserRepository} repositories.users
 * @param {CreateGameNamespace.GameRepository} repositories.games
 * @returns {CreateGameNamespace.CreateGame}
 */
exports.makeCreateGame = (users = new FakeUserRepository(), games = new FakeGameRepository()) => {
    return new CreateGameNamespace.CreateGame(users, games);
};
