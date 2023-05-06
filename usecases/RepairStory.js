const { UserNotInGame, InvalidPlayerActivity } = require("../entities/Game");
const { isSameActivity, PlayerActivity } = require("../entities/Game.PlayerActivity");
const { GameNotFound } = require("../repositories/GameRepositoryExceptions");
const { param } = require("../validation");

exports.RepairStory = class RepairStory {
    #games;

    /**
     *
     * @param {import("../repositories/GameRepository").UpdateGameRepository} gameRepository
     */
    constructor(gameRepository) {
        this.#games = gameRepository;
    }

    /**
     *
     * @param {string} gameId
     * @param {string} playerId
     * @param {number} storyIndex
     */
    async repairStory(gameId, playerId, storyIndex) {
        this.#validateGameId(gameId);
        this.#validatePlayerId(playerId);

        const game = await this.#games.get(gameId);
        if (game === undefined) throw new GameNotFound(gameId);

        const activity = game.userActivity(playerId);
        if (activity === undefined) throw new UserNotInGame(gameId, playerId);

        if (!isSameActivity(activity, PlayerActivity.RepairingStory(storyIndex))) throw new InvalidPlayerActivity();

        game.repairStory(playerId, storyIndex);
        await this.#games.replace(game);
    }

    /**
     *
     * @param {any} gameId
     */
    #validateGameId(gameId) {
        param("gameId", gameId).isRequired().mustBeString();
    }

    /**
     *
     * @param {any} playerId
     */
    #validatePlayerId(playerId) {
        param("playerId", playerId).isRequired().mustBeString();
    }
};
