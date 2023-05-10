const { param } = require("../validation");
const { emitGameUpdate } = require("./abstractUseCases/GameUpdateEmitter");
const { PlayerInGameUpdatesStoryUseCase } = require("./abstractUseCases/PlayerInGameUpdatesStoryUseCase");

exports.RepairStory = class RepairStory extends PlayerInGameUpdatesStoryUseCase {
    #subscribedPlayers;
    #playerNotifier;
    /**
     *
     * @param {import("../repositories/GameRepository").UpdateGameRepository} gameRepository
     * @param {import("../repositories/SubscribedPlayerRepository").ReadOnlySubscribedPlayerRepository} subscribedPlayers
     * @param {import("../repositories/PlayerNotifier").PlayerNotifier} playerNotifier
     */
    constructor(gameRepository, subscribedPlayers, playerNotifier) {
        super(gameRepository);
        param("subscribedPlayers", subscribedPlayers).isRequired();
        param("playerNotifier", playerNotifier).isRequired();
        this.#subscribedPlayers = subscribedPlayers;
        this.#playerNotifier = playerNotifier;
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

        if (typeof replacements === "string") game.repairStory(playerId, storyIndex, replacements);
        else game.repairStory(playerId, storyIndex, replacements);
        await this._saveUpdate(game);

        emitGameUpdate(game, playerId, this.#subscribedPlayers, this.#playerNotifier);
    }
};
