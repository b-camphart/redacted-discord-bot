const { param } = require("../../validation");
const { PlayerInGameUpdatesGameUseCase } = require("./PlayerInGameUpdatesGameUseCase");

class PlayerInGameUpdatesStoryUseCase extends PlayerInGameUpdatesGameUseCase {
    /**
     *
     * @param {import("../../repositories/GameRepository").UpdateGameRepository} games
     */
    constructor(games) {
        super(games);
    }

    /**
     *
     * @param {any} gameId
     * @param {any} playerId
     * @param {any} storyIndex
     */
    // @ts-ignore
    _validateInputs(gameId, playerId, storyIndex) {
        super._validateInputs(gameId, playerId);
        this._validateStoryIndex(storyIndex);
    }

    /**
     *
     * @param {any} storyIndex
     */
    _validateStoryIndex(storyIndex) {
        param("storyIndex", storyIndex).isRequired().mustBeNumber();
    }
}

exports.PlayerInGameUpdatesStoryUseCase = PlayerInGameUpdatesStoryUseCase;
