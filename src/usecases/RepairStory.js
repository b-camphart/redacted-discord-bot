const { PlayerInGameUpdatesStoryUseCase } = require("./abstractUseCases/PlayerInGameUpdatesStoryUseCase");

exports.RepairStory = class RepairStory extends PlayerInGameUpdatesStoryUseCase {
    /**
     *
     * @param {import("../repositories/GameRepository").UpdateGameRepository} gameRepository
     */
    constructor(gameRepository) {
        super(gameRepository);
    }

    /**
     *
     * @param {string} gameId
     * @param {string} playerId
     * @param {number} storyIndex
     * @param {string | string[]} replacements
     */
    async repairStory(gameId, playerId, storyIndex, replacements) {
        this._validateInputs(gameId, playerId, storyIndex);

        const game = await this._getGameOrThrow(gameId);

        game.repairStory(playerId, storyIndex, replacements);
        await this._saveUpdate(game);
    }
};
