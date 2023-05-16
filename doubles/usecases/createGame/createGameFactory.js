const { CreateGame } = require("../../../src/usecases");
const { FakeGameRepository } = require("../../repositories/FakeGameRepository");
const { FakeUserRepository } = require("../../repositories/FakeUserRepository");

/**
 *
 * @param {object} repositories
 * @param {import("../../../src/repositories/UserRepository").ReadOnlyUserRepository} repositories.users
 * @param {import("../../../src/repositories/GameRepository").CreateGameRepository} repositories.games
 * @returns {UseCases.GameCreation}
 */
exports.makeCreateGame = (users = new FakeUserRepository(), games = new FakeGameRepository()) => {
	return new CreateGame(users, games);
};
