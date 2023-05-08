const { PlayerActivityService } = require("../usecases/PlayerActivityService");
const { RedactStory } = require("../usecases/RedactStory");
const { RepairStory } = require("../usecases/RepairStory");
const { StartStory } = require("../usecases/StartStory");
const { CreateGame } = require("../usecases/createGame/CreateGame");
const { JoinGame } = require("../usecases/joinGame/JoinGame");
const { StartGame } = require("../usecases/startGame/StartGame");

class Redacted {
    #users;
    #games;
    #playerNotifier;

    /**
     *
     * @param {import("../repositories/UserRepository").ReadOnlyUserRepository} userRepository
     * @param {import("../repositories/GameRepository").GameRepository} gameRepository
     * @param {import("../repositories/PlayerNotifier").PlayerNotifier} playerNotifier
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
        return await new CreateGame(this.#users, this.#games).create(userId);
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
        return await new JoinGame(this.#games, this.#users, this.#playerNotifier).addPlayer(gameId, playerId);
    }

    /**
     *
     * @param {string} gameId
     * @param {string} playerId
     * @returns
     */
    async startGame(gameId, playerId) {
        return await new StartGame(this.#games, this.#playerNotifier).startGame(gameId, playerId);
    }

    /**
     *
     * @param {string} gameId
     * @param {string} playerId
     * @param {string} content
     * @returns
     */
    async startStory(gameId, playerId, content) {
        return await new StartStory(this.#games).startStory(gameId, playerId, content);
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
        return await new RedactStory(this.#games).censorStory(gameId, playerId, storyIndex, wordIndices);
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
        return await new RedactStory(this.#games).truncateStory(gameId, playerId, storyIndex, truncateCount);
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
        return await new RepairStory(this.#games).repairStory(gameId, playerId, storyIndex, replacements);
    }
}

exports.Redacted = Redacted;
