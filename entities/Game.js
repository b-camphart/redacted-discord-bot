/**
 * @typedef {"pending" | "started" | "ended"} GameStatus
 */

const { IndexOutOfBounds } = require("../usecases/validation");
const { PlayerActivity, isSameActivity } = require("./Game.PlayerActivity");
const { StoryStatus } = require("./Game.StoryStatus");

class Game {
    id;
    /** @type {string[]} */
    #users;
    #status;
    /** @type {Story[]} */
    #stories;

    /**
     *
     * @param {string | undefined} id
     * @param {string[]} users
     * @param {GameStatus} status
     * @param {{creatorId: string, entries: string[], status: StoryStatus}[]} stories
     */
    constructor(id = undefined, users = [], status = "pending", stories = []) {
        this.id = id;
        this.#users = Array.from(users);
        this.#status = status;
        this.#stories = stories.map((story) => new Story(story.entries, story.creatorId, this.#users, story.status));
    }

    /**
     * @param {string} userId the id of the user to add to the game
     */
    addUser(userId) {
        if (this.#status !== "pending") throw new GameAlreadyStarted(this.id || "");
        if (this.hasUser(userId)) return;
        this.#users.push(userId);
    }

    /**
     * @returns {string[]} the ids of users ids that have been added to the game so far.
     */
    users() {
        return Array.from(this.#users);
    }

    /**
     * Checks if the userId is in the game.
     * @param {string} userId The user id to check
     * @returns {boolean} `true` if the user is in the game, `false` otherwise.
     */
    hasUser(userId) {
        return this.#users.find((id) => id === userId) !== undefined;
    }

    /**
     *
     * @param {string} userId
     */
    userActivity(userId) {
        if (!this.hasUser(userId)) return undefined;

        if (this.#status === "pending") return PlayerActivity.AwaitingStart;

        if (this.#stories.find((story) => story.startedBy() === userId) === undefined)
            return PlayerActivity.StartingStory;

        const storyForPlayer = this.#stories.find((story) => story.status().playerId === userId);
        if (storyForPlayer === undefined) return PlayerActivity.AwaitingStory;

        return storyForPlayer.status().toPlayerActivity(this.#stories.indexOf(storyForPlayer));
    }

    /**
     * @returns {GameStatus}
     */
    status() {
        return this.#status;
    }

    stories() {
        return this.#stories.map((story) => {
            return {
                creatorId: story.startedBy(),
                entries: story.entries(),
                status: story.status(),
            };
        });
    }

    start() {
        if (this.#status !== "pending") throw new GameAlreadyStarted(this.id || "");
        if (this.#users.length < 4) throw new NotEnoughPlayersToStartGame(this.id || "", this.#users.length);

        this.#status = "started";
    }

    /**
     *
     * @param {string} playerId
     * @param {string} content
     */
    startStory(playerId, content) {
        if (!this.hasUser(playerId)) throw new UserNotInGame(this.id || "", playerId);

        if (this.userActivity(playerId) !== PlayerActivity.StartingStory) throw new InvalidPlayerActivity();

        this.#stories.push(new Story([content], playerId, this.#users));
    }

    /**
     *
     * @param {number} storyIndex
     * @param {number} entryIndex
     * @return {string | undefined} The content of the entry of the story, or undefined if the story, or entry, are not in the game.
     */
    storyEntry(storyIndex, entryIndex) {
        return this.#stories[storyIndex]?.entry(entryIndex);
    }

    /**
     *
     * @param {number} storyIndex
     */
    storyStatus(storyIndex) {
        return this.#stories[storyIndex]?.status();
    }

    /**
     *
     * @param {string} playerId
     * @param {number} storyIndex
     */
    #ensurePlayerCanRedactStory(playerId, storyIndex) {
        const activity = this.userActivity(playerId);
        if (activity === undefined) throw new UserNotInGame(this.id || "", playerId);
        const requiredActivity = PlayerActivity.RedactingStory(storyIndex);
        if (!isSameActivity(activity, requiredActivity)) throw new InvalidPlayerActivity(activity, requiredActivity);
    }

    /**
     *
     * @param {string} playerId
     * @param {number} storyIndex
     * @param {number[]} wordIndices
     */
    censorStory(playerId, storyIndex, wordIndices) {
        this.#ensurePlayerCanRedactStory(playerId, storyIndex);

        const story = this.#stories[storyIndex];
        if (story === undefined) return;
        const entry = story.entry(0);
        if (entry === undefined) return;
        const words = entry.split(" ");

        wordIndices.forEach((wordIndex) => {
            if (wordIndex < 0 || wordIndex >= words.length) throw new IndexOutOfBounds("");
        });

        story.censor(playerId, wordIndices);
    }

    /**
     *
     * @param {string} playerId
     * @param {number} storyIndex
     * @param {number} truncationCount
     */
    truncateStory(playerId, storyIndex, truncationCount) {
        this.#ensurePlayerCanRedactStory(playerId, storyIndex);
        const story = this.#stories[storyIndex];
        if (story === undefined) return;
        const entry = story.entry(0);
        if (entry === undefined) return;
        const words = entry.split(" ");

        if (truncationCount >= words.length) throw new IndexOutOfBounds("truncationCount must be less than 5.");

        story.truncate(playerId, truncationCount);
    }
}

class UserInGame {
    #id;
    #activity;

    /**
     *
     * @param {string} id
     * @param {any} activity
     */
    constructor(id, activity) {
        this.#id = id;
        this.#activity = activity;
    }

    id() {
        return this.#id;
    }
}

class Story {
    #entries;
    #creatorId;
    #nextPlayer;
    #playerIds;
    #status;

    /**
     *
     * @param {string[]} entries
     * @param {string} creatorId
     * @param {string[]} playerIds
     * @param {StoryStatus} [status]
     */
    constructor(entries = [], creatorId, playerIds, status) {
        this.#entries = entries;
        this.#creatorId = creatorId;
        this.#playerIds = playerIds;
        const nextPlayerIndex = playerIds.indexOf(creatorId) + 1;
        if (nextPlayerIndex === playerIds.length) this.#nextPlayer = playerIds[0];
        else {
            this.#nextPlayer = playerIds[nextPlayerIndex];
        }
        this.#status = status || StoryStatus.Redact(this.#nextPlayer);
    }

    startedBy() {
        return this.#creatorId;
    }

    /**
     *
     * @param {number} index
     * @returns {string | undefined}
     */
    entry(index) {
        return this.#entries[index];
    }

    entries() {
        return Array.from(this.#entries);
    }

    status() {
        return this.#status;
    }

    /**
     *
     * @param {string} playerId
     * @param {number[]} wordIndices
     */
    censor(playerId, wordIndices) {
        const nextPlayerIndex = this.#playerIds.indexOf(this.#nextPlayer) + 1;
        if (nextPlayerIndex === this.#playerIds.length) this.#nextPlayer = this.#playerIds[0];
        else {
            this.#nextPlayer = this.#playerIds[nextPlayerIndex];
        }
        this.#status = StoryStatus.RepairCensor(this.#nextPlayer, wordIndices);
    }

    /**
     *
     * @param {string} playerId
     * @param {number} truncationCount
     */
    truncate(playerId, truncationCount) {
        const nextPlayerIndex = this.#playerIds.indexOf(this.#nextPlayer) + 1;
        if (nextPlayerIndex === this.#playerIds.length) this.#nextPlayer = this.#playerIds[0];
        else {
            this.#nextPlayer = this.#playerIds[nextPlayerIndex];
        }
        this.#status = StoryStatus.RepairTruncation(this.#nextPlayer, truncationCount);
    }
}

class UserNotInGame extends Error {
    /**
     *
     * @param {string} gameId
     * @param {string} userId
     */
    constructor(gameId, userId) {
        super(`User ${userId} not in game ${gameId}`);
        this.gameId = gameId;
        this.userId = userId;
    }
}

class GameAlreadyStarted extends Error {
    /**
     *
     * @param {string} gameId The id of the game that was attempted to be started.
     */
    constructor(gameId) {
        super();
        this.gameId = gameId;
    }
}

class NotEnoughPlayersToStartGame extends Error {
    /**
     *
     * @param {string} gameId The id of the game that was attempted to be started.
     * @param {number} currentUserCount The current number of users in the game.
     */
    constructor(gameId, currentUserCount) {
        super();
        this.gameId = gameId;
        this.currentUserCount = currentUserCount;
    }
}

class InvalidPlayerActivity extends Error {
    /**
     *
     * @param {any} [currentActivity]
     * @param {any} [requiredActivity]
     */
    constructor(currentActivity, requiredActivity) {
        super(
            `Player currently has ${JSON.stringify(currentActivity)}, but ${JSON.stringify(
                requiredActivity
            )} was required`
        );
    }
}

module.exports = {
    Game,
    UserInGame,
    UserNotInGame,
    GameAlreadyStarted,
    NotEnoughPlayersToStartGame,
    InvalidPlayerActivity,
};
