const { GameNotFound } = require("../../repositories/GameRepository");
const { UserNotInGame } = require("../validation");

exports.GetPlayerExpectedActivityUseCase = class GetPlayerExpectedActivityUseCase {
    /** @type {import("../../repositories/GameRepository").GameRepository} */
    #gameRepository;
    /** @type {import("../../repositories/UserRepositoryExceptions").UserRepository} */
    #userRepository;

    async getExpectedActivity(gameId, userId) {
        const game = await this.#gameRepository.get(gameId);
        if (game === undefined) throw new GameNotFound(gameId);

        if (!game.hasPlayer(userId)) throw new UserNotInGame(gameId, userId);
    }
};
