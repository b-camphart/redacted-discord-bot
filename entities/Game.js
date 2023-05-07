const { PlayerActivity } = require("./Game.PlayerActivity");
const { Story } = require("./Game.Story");
const { param } = require("../validation");
const { eachValueOf } = require("../validation/arrays");
const { GameAlreadyStarted, UserNotInGame, InvalidPlayerActivity } = require("./Game.Exceptions");
/** @typedef {import("./Game.Story").StorySnapshot} StorySnapshot */

class Game {
    id;
    /** @type {string[]} */
    #users;
    #isStarted;
    /** @type {Story[]} */
    #stories;

    /**
     *
     * @param {string | undefined} [id]
     * @param {string[]} [users]
     * @param {boolean} [isStarted]
     * @param {StorySnapshot[]} [stories]
     * @param {number} [maxStoryEntries]
     */
    constructor(id = undefined, users = [], isStarted = false, stories = [], maxStoryEntries = 6) {
        this.id = id;
        this.#users = Array.from(users);
        this.#isStarted = isStarted;
        this.#stories = stories.map((story) => new Story(story.entries, this.#users, story.status));
        this.maxStoryEntries = maxStoryEntries;
    }

    /**
     * @param {string} userId the id of the user to add to the game
     */
    addPlayer(userId) {
        if (this.#isStarted) throw new GameAlreadyStarted(this.id || "");
        if (this.hasPlayer(userId)) return;
        this.#users.push(userId);
    }

    /**
     * @returns {string[]} the ids of users ids that have been added to the game so far.
     */
    playerIds() {
        const usersCopy = Array.from(this.#users);
        return usersCopy;
    }

    /**
     * Checks if the userId is in the game.
     * @param {string} userId The user id to check
     * @returns {boolean} `true` if the user is in the game, `false` otherwise.
     */
    hasPlayer(userId) {
        return this.#users.find((id) => id === userId) !== undefined;
    }

    /**
     *
     * @param {string} userId
     */
    playerActivity(userId) {
        if (!this.hasPlayer(userId)) return undefined;
        if (!this.#isStarted) return PlayerActivity.AwaitingStart;

        const playerHasNotStartedAStory = this.#stories.every((story) => !story.wasStartedBy(userId));
        if (playerHasNotStartedAStory) return PlayerActivity.StartingStory;

        const storyForPlayer = this.#stories.find((story) => story.isAssignedTo(userId));
        const playerHasNoAssignedStory = storyForPlayer === undefined;
        if (playerHasNoAssignedStory) return this.#noAssignedStory();

        return storyForPlayer.currentPlayerActivity(this.#stories.indexOf(storyForPlayer));
    }

    #noAssignedStory() {
        const everyStoryIsCompleted = this.#stories.every((story) => story.isCompleted);
        if (everyStoryIsCompleted)
            return PlayerActivity.ReadingFinishedStories(this.#stories.map((story) => story.toFinishedStory()));
        return PlayerActivity.AwaitingStory;
    }

    get isStarted() {
        return this.#isStarted;
    }

    stories() {
        return this.#stories.map((story) => story.snapshot);
    }

    start(maximumEntriesPerStory = 6) {
        if (this.#isStarted) throw new GameAlreadyStarted(this.id || "");
        this.maxStoryEntries = maximumEntriesPerStory;
        this.#isStarted = true;
    }

    /**
     *
     * @param {string} playerId
     * @param {string} content
     */
    startStory(playerId, content) {
        if (!this.hasPlayer(playerId)) throw new UserNotInGame(this.id || "", playerId);

        if (this.playerActivity(playerId) !== PlayerActivity.StartingStory) throw new InvalidPlayerActivity();

        this.#stories.push(Story.start(content, playerId, this.#users));
    }

    /**
     *
     * @param {number} storyIndex
     * @param {number} entryIndex
     * @return {string | undefined} The content of the entry of the story, or undefined if the story, or entry, are not in the game.
     */
    storyEntry(storyIndex, entryIndex) {
        return this.#stories[storyIndex]?.entry(entryIndex)?.initialContent;
    }

    /**
     *
     * @param {number} storyIndex
     */
    storyActionRequired(storyIndex) {
        return this.#stories[storyIndex]?.requiredAction;
    }

    /**
     *
     * @param {number} storyIndex
     */
    playerAssignedToStory(storyIndex) {
        return this.#stories[storyIndex]?.assignedTo;
    }

    /**
     *
     * @param {string} playerId
     * @param {number} storyIndex
     */
    #getStoryIfValidated(playerId, storyIndex) {
        param("playerId", playerId).isRequired().mustBeString();
        param("storyIndex", storyIndex).isRequired().mustBeNumber();
        if (!this.hasPlayer(playerId)) throw new UserNotInGame(this.id || "", playerId);
        const story = this.#stories[storyIndex];
        if (story === undefined) throw new InvalidPlayerActivity();
        return story;
    }

    /**
     *
     * @param {string} playerId
     * @param {number} storyIndex
     * @param {number[]} wordIndices
     */
    censorStory(playerId, storyIndex, wordIndices) {
        eachValueOf(param("wordIndices", wordIndices).isRequired().mustBeArray(), (it) => it.mustBeNumber());
        const story = this.#getStoryIfValidated(playerId, storyIndex);
        story.censor(playerId, wordIndices);
    }

    /**
     *
     * @param {string} playerId
     * @param {number} storyIndex
     * @param {number} truncationCount
     */
    truncateStory(playerId, storyIndex, truncationCount) {
        param("truncationCount", truncationCount).isRequired().mustBeNumber();
        const story = this.#getStoryIfValidated(playerId, storyIndex);
        story.truncate(playerId, truncationCount);
    }

    /**
     *
     * @param {string} playerId
     * @param {number} storyIndex
     * @param {string | string[]} replacement
     */
    repairStory(playerId, storyIndex, replacement) {
        const story = this.#getStoryIfValidated(playerId, storyIndex);
        story.repair(this.maxStoryEntries, playerId, replacement);
    }

    /**
     *
     * @param {string} playerId
     * @param {number} storyIndex
     * @param {string} content
     */
    continueStory(playerId, storyIndex, content) {
        param("content", content).isRequired().mustBeString();
        const story = this.#getStoryIfValidated(playerId, storyIndex);
        story.continue(content, playerId);
    }
}

class UserInGame {
    #id;

    /**
     *
     * @param {string} id
     */
    constructor(id) {
        this.#id = id;
    }

    id() {
        return this.#id;
    }
}

module.exports = {
    Game,
    UserInGame,
};
