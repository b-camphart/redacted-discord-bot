const { Game } = require("../entities/Game");
const { GameNotFound } = require("../repositories/GameRepositoryExceptions");
const { MustNotBeBlank, MustHaveLength, isStringBlank } = require("./validation");

/**
 * @typedef {Game & { id: string }} GameWithId
 */

/**
 * @typedef {Object} GameRepository
 * @property {(gameId: string) => Promise<GameWithId | undefined>} get
 * @property {(game: GameWithId) => Promise<void>} replace
 */

class StartStory {
    #gameRepository;

    /**
     *
     * @param {GameRepository} gameRepository
     */
    constructor(gameRepository) {
        this.#gameRepository = gameRepository;
    }

    /**
     *
     * @param {string} gameId
     * @param {string} playerId
     * @param {string} content
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
module.exports = { StartStory };
