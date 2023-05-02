const { Game } = require("../entities/Game");
const { GameNotFound } = require("../repositories/GameRepository");
const { MustNotBeBlank, MustHaveLength, isStringBlank } = require("./validation");

/**
 * @typedef {Object} StartStory
 * @property {(gameId: string, playerId: string, content: string) => Promise<Game>} startStory
 */

/**
 * @implements {StartStory}
 */
class StartStoryUseCase {
    #gameRepository;

    /**
     *
     * @param {import("../repositories/GameRepository").GameRepository} gameRepository
     */
    constructor(gameRepository) {
        this.#gameRepository = gameRepository;
    }

    /**
     *
     * @param {string} gameId
     * @param {string} playerId
     * @param {string} content
     * @return {Promise<Game>}
     */
    async startStory(gameId, playerId, content) {
        const game = await this.#gameRepository.get(gameId);
        if (game === undefined) throw new GameNotFound(gameId);

        if (isStringBlank(content)) throw new MustNotBeBlank("content");
        if (content.length > 255) throw new MustHaveLength("content", 0, 255);

        game.startStory(playerId, content);

        this.#gameRepository.replace(game);

        return game;
    }
}
module.exports = { StartStoryUseCase };
