const { PlayerActivityService } = require("../../src/usecases/PlayerActivityService");
const UseCases = require("../../src/usecases");

class Redacted {
    #users;
    #games;
    #playerNotifier;

    /**
     *
     * @param {import("../../src/repositories/UserRepository").ReadOnlyUserRepository} userRepository
     * @param {import("../../src/repositories/GameRepository").GameRepository} gameRepository
     * @param {import("../../src/repositories/PlayerNotifier").PlayerNotifier} playerNotifier
     */
    constructor(userRepository, gameRepository, playerNotifier) {
        this.#users = userRepository;
        this.#games = gameRepository;
        this.#playerNotifier = playerNotifier;
    }

    /**
     *
     * @param {string} userId
     * @returns
     */
    async createGame(userId) {
        return await new UseCases.CreateGame(this.#users, this.#games).createGame(userId);
    }

    /**
     *
     * @param {string} gameId
     * @param {string} playerId
     */
    async getPlayerActivity(gameId, playerId) {
        return await new PlayerActivityService(this.#games).getPlayerActivity(gameId, playerId);
    }

    /**
     *
     * @param {string} gameId
     * @param {string} playerId
     * @returns
     */
    async joinGame(gameId, playerId) {
        return await new UseCases.JoinGame(this.#games, this.#users, this.#playerNotifier).addPlayer(gameId, playerId);
    }

    /**
     *
     * @param {string} gameId
     * @param {string} playerId
     * @param {number} [maxEntries]
     * @returns
     */
    async startGame(gameId, playerId, maxEntries) {
        return await new UseCases.StartGame(this.#games, this.#playerNotifier).startGame(gameId, playerId, maxEntries);
    }

    /**
     *
     * @param {string} gameId
     * @param {string} playerId
     * @param {string} content
     * @returns
     */
    async startStory(gameId, playerId, content) {
        return await new UseCases.StartStory(this.#games).startStory(gameId, playerId, content);
    }

    /**
     *
     * @param {string} gameId
     * @param {string} playerId
     * @param {number} storyIndex
     * @param {number[]} wordIndices
     * @returns
     */
    async censorStory(gameId, playerId, storyIndex, wordIndices) {
        return await new UseCases.RedactStory(this.#games).censorStory(gameId, playerId, storyIndex, wordIndices);
    }

    /**
     *
     * @param {string} gameId
     * @param {string} playerId
     * @param {number} storyIndex
     * @param {number} truncateCount
     * @returns
     */
    async truncateStory(gameId, playerId, storyIndex, truncateCount) {
        return await new UseCases.RedactStory(this.#games).truncateStory(gameId, playerId, storyIndex, truncateCount);
    }

    /**
     *
     * @param {string} gameId
     * @param {string} playerId
     * @param {number} storyIndex
     * @param {string | string[]} replacements
     * @returns
     */
    async repairStory(gameId, playerId, storyIndex, replacements) {
        return await new UseCases.RepairStory(this.#games).repairStory(gameId, playerId, storyIndex, replacements);
    }

    /**
     *
     * @param {string} gameId
     * @param {string} playerId
     * @param {number} storyIndex
     * @param {string} content
     * @returns
     */
    async continueStory(gameId, playerId, storyIndex, content) {
        return await new UseCases.ContinueStory(this.#games).continueStory(gameId, playerId, storyIndex, content);
    }
}

exports.Redacted = Redacted;
