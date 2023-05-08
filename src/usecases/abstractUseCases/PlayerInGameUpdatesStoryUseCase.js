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
     * @param {any} storyIndex
     */
    _validateStoryIndex(storyIndex) {
        param("storyIndex", storyIndex).isRequired().mustBeNumber();
    }
}

exports.PlayerInGameUpdatesStoryUseCase = PlayerInGameUpdatesStoryUseCase;
