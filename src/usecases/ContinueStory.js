const { param } = require("../validation");
const { PlayerInGameUpdatesStoryUseCase } = require("./abstractUseCases/PlayerInGameUpdatesStoryUseCase");

class ContinueStory extends PlayerInGameUpdatesStoryUseCase {
    /**
     *
     * @param {import("../repositories/GameRepository").UpdateGameRepository} games
     */
    constructor(games) {
        super(games);
    }
    /**
     *
     * @param {string} gameId
     * @param {string} playerId
     * @param {number} storyIndex
     * @param {string} content
     */
    async continueStory(gameId, playerId, storyIndex, content) {
        this._validateInputs(gameId, playerId, storyIndex, content);
        const game = await this._getGameOrThrow(gameId);
        game.continueStory(playerId, storyIndex, content);
        this._saveUpdate(game);
    }

    /**
     *
     * @param {any} gameId
     * @param {any} playerId
     * @param {any} storyIndex
     * @param {any} content
     */
    // @ts-ignore
    _validateInputs(gameId, playerId, storyIndex, content) {
        super._validateInputs(gameId, playerId, storyIndex);
        this._validateContent(content);
    }

    /**
     *
     * @param {any} content
     */
    _validateContent(content) {
        param("content", content).isRequired().mustBeString();
    }
}

exports.ContinueStory = ContinueStory;
