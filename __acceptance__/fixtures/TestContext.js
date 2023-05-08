const { World } = require("@cucumber/cucumber");
const { Redacted } = require("../../src/application/Redacted");
const { AllUsersExistRepository } = require("../../doubles/repositories/FakeUserRepository");
const { FakeGameRepository } = require("../../doubles/repositories/FakeGameRepository");
const { DumbPlayerNotifier } = require("../../doubles/repositories/PlayerNotifierDoubles");
const { UserAlreadyInGame } = require("../../src/usecases/joinGame/UserAlreadyInGame");
const { NotEnoughPlayersToStartGame } = require("../../src/usecases/startGame/validation");
const { GameAlreadyStarted } = require("../../src/entities/Game.Exceptions");

class TestContext extends World {
    /** @type {Redacted} */
    #application;
    /** @type {string | undefined} */
    #gameId;
    /** @type {Map<string, string[]>} */
    #messagesPerPlayer;

    /**
     *
     * @param {import("@cucumber/cucumber").IWorldOptions} options
     */
    constructor(options) {
        super(options);
        this.#application = new Redacted(
            new AllUsersExistRepository(),
            new FakeGameRepository(),
            new DumbPlayerNotifier()
        );
        this.#messagesPerPlayer = new Map();
    }

    /**
     *
     * @param {string} playerId
     */
    messagesFor(playerId) {
        let messages = this.#messagesPerPlayer.get(playerId);
        if (messages === undefined) return [];
        return Array.from(messages);
    }

    /**
     *
     * @param {string} playerId
     * @param {string} message
     */
    #addMessage(playerId, message) {
        let messages = this.#messagesPerPlayer.get(playerId);
        if (messages === undefined) {
            messages = [];
            this.#messagesPerPlayer.set(playerId, messages);
        }
        messages.push(message);
    }

    gameIdOrThrow() {
        const gameId = this.#gameId;
        if (gameId === undefined) throw "Game not yet created.";
        return gameId;
    }

    /**
     *
     * @param {string} userId
     * @returns
     */
    async createGame(userId) {
        const gameCreated = await this.#application.createGame(userId);
        this.#gameId = gameCreated.gameId;
        return gameCreated;
    }

    /**
     *
     * @param {string} playerId
     * @returns
     */
    async getPlayerActivity(playerId) {
        return await this.#application.getPlayerActivity(this.gameIdOrThrow(), playerId);
    }

    async joinGame(playerId) {
        const gameId = this.gameIdOrThrow();
        try {
            return await this.#application.joinGame(gameId, playerId);
        } catch (failure) {
            if (failure instanceof UserAlreadyInGame) {
                this.#addMessage(playerId, "Already in the game");
            } else if (failure instanceof GameAlreadyStarted) {
                this.#addMessage(playerId, "Game already in progress");
            }
            this.log(JSON.stringify(failure));
        }
    }

    async startGame(playerId) {
        const gameId = this.gameIdOrThrow();
        try {
            return await this.#application.startGame(gameId, playerId);
        } catch (failure) {
            if (failure instanceof NotEnoughPlayersToStartGame) {
                this.#addMessage(playerId, "Not enough players");
            }
            this.log(JSON.stringify(failure));
        }
    }

    async startStory(playerId, content) {
        const gameId = this.gameIdOrThrow();
        return await this.#application.startStory(gameId, playerId, content);
    }

    /**
     *
     * @param {string} playerId
     * @param {number} storyIndex
     * @param {number[]} wordIndices
     */
    async censorStory(playerId, storyIndex, wordIndices) {
        const gameId = this.gameIdOrThrow();
        return await this.#application.censorStory(gameId, playerId, storyIndex, wordIndices);
    }

    /**
     *
     * @param {string} playerId
     * @param {number} storyIndex
     * @param {number} truncateCount
     * @returns
     */
    async truncateStory(playerId, storyIndex, truncateCount) {
        const gameId = this.gameIdOrThrow();
        return await this.#application.truncateStory(gameId, playerId, storyIndex, truncateCount);
    }

    /**
     *
     * @param {string} playerId
     * @param {number} storyIndex
     * @param {string[]} replacements
     */
    async repairCensoredStory(playerId, storyIndex, replacements) {
        const gameId = this.gameIdOrThrow();
        await this.#application.repairStory(gameId, playerId, storyIndex, replacements);
    }

    /**
     *
     * @param {string} playerId
     * @param {number} storyIndex
     * @param {string} replacement
     */
    async repairTruncatedStory(playerId, storyIndex, replacement) {
        const gameId = this.gameIdOrThrow();
        await this.#application.repairStory(gameId, playerId, storyIndex, replacement);
    }

    /**
     *
     * @param {string} playerId
     * @param {number} storyIndex
     * @param {string} content
     */
    async continueStory(playerId, storyIndex, content) {
        const gameId = this.gameIdOrThrow();
        this.#application.continueStory(gameId, playerId, storyIndex, content);
    }
}

exports.TestContext = TestContext;
