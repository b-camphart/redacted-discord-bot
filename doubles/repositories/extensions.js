const { GameNotFound } = require("../../src/repositories/GameRepositoryExceptions");

/**
 *
 * @param {import("../../repositories/GameRepository").ReadOnlyGameRepository} gameRepo
 * @param {string} gameId
 */
exports.getOrThrow = async (gameRepo, gameId) => {
    return (await gameRepo.get(gameId)) || fail(new GameNotFound(gameId));
};
