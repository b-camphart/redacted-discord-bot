const { Game } = require("../entities/Game");
const { GameNotFound } = require("../repositories/GameRepositoryExceptions");
const { param } = require("../validation");
const { mustHaveLengthInRange } = require("../validation/arrays");
const { exclusive, inclusive } = require("../validation/numbers");
const { mustNotBeBlank } = require("../validation/strings");
const { MustHaveLength } = require("./validation");

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
        this.#validateInputs(gameId, playerId, content);
        const game = await this.#getGame(gameId);

        game.startStory(playerId, content);

        this.#gameRepository.replace(game);

        return game;
    }

    /**
     *
     * @param {any} gameId
     * @param {any} playerId
     * @param {any} content
     */
    #validateInputs(gameId, playerId, content) {
        param("gameId", gameId).isRequired().mustBeString();
        param("playerId", playerId).isRequired().mustBeString();
        const contentParam = param("content", content).isRequired().mustBeString();
        mustNotBeBlank(contentParam);
        mustHaveLengthInRange(contentParam, exclusive(0), inclusive(256));
    }

    /**
     *
     * @param {string} gameId
     */
    async #getGame(gameId) {
        const game = await this.#gameRepository.get(gameId);
        if (game === undefined) throw new GameNotFound(gameId);
        return game;
    }
}
module.exports = { StartStory };
