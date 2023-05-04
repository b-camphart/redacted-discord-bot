/**
 * @typedef {"pending" | "started" | "ended"} GameStatus
 */

const { PlayerActivity } = require("./Game.PlayerActivity");
const { StoryStatus } = require("./Game.StoryStatus");

class Game {
    id;
    /** @type {Map<string, UserInGame>} */
    #users;
    #status;
    /** @type {Story[]} */
    #stories;

    /**
     *
     * @param {string | undefined} id
     * @param {UserInGame[]} users
     * @param {GameStatus} status
     */
    constructor(id = undefined, users = [], status = "pending") {
        this.id = id;
        this.#users = new Map();
        users.forEach((user) => this.#users.set(user.id(), user));
        this.#status = status;
        this.#stories = [];
    }

    /**
     * @param {string} userId the id of the user to add to the game
     */
    addUser(userId) {
        if (this.#status !== "pending") throw new GameAlreadyStarted(this.id || "");
        if (this.hasUser(userId)) return;
        this.#users.set(userId, new UserInGame(userId, PlayerActivity.AwaitingStart));
    }

    /**
     * @returns {UserInGame[]} the ids of users ids that have been added to the game so far.
     */
    users() {
        return Array.from(this.#users.values());
    }

    /**
     * Checks if the userId is in the game.
     * @param {string} userId The user id to check
     * @returns {boolean} `true` if the user is in the game, `false` otherwise.
     */
    hasUser(userId) {
        return this.#users.has(userId);
    }

    /**
     *
     * @param {string} userId
     */
    userActivity(userId) {
        const player = this.#users.get(userId);
        if (player === undefined) return undefined;

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

    start() {
        if (this.#status !== "pending") throw new GameAlreadyStarted(this.id || "");
        if (this.#users.size < 4) throw new NotEnoughPlayersToStartGame(this.id || "", this.#users.size);

        this.#status = "started";
        for (const user of this.#users.values()) {
            this.#users.set(user.id(), new UserInGame(user.id(), PlayerActivity.StartingStory));
        }
    }

    /**
     *
     * @param {string} playerId
     * @param {string} content
     */
    startStory(playerId, content) {
        const player = this.#users.get(playerId);

        if (player === undefined) throw new UserNotInGame(this.id || "", playerId);

        if (this.userActivity(playerId) !== PlayerActivity.StartingStory) throw new InvalidPlayerActivity();

        this.#stories.push(new Story([content], playerId, Array.from(this.#users.keys())));

        const storyForPlayer = this.#stories.find((story) => story.status().playerId === player.id());

        let newActivity;
        if (storyForPlayer !== undefined) {
            newActivity = PlayerActivity.RedactingStory(this.#stories.indexOf(storyForPlayer));
        } else {
            newActivity = PlayerActivity.AwaitingStory;
        }

        this.#users.set(player.id(), new UserInGame(player.id(), newActivity));
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

    /**
     *
     * @param {string[]} entries
     * @param {string} creatorId;
     * @param {string[]} playerIds
     */
    constructor(entries = [], creatorId, playerIds) {
        this.#entries = entries;
        this.#creatorId = creatorId;
        this.#nextPlayer = playerIds[playerIds.indexOf(creatorId) + 1];
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

    status() {
        return StoryStatus.Redact(this.#nextPlayer);
    }
}

class UserNotInGame extends Error {
    /**
     *
     * @param {string} gameId
     * @param {string} userId
     */
    constructor(gameId, userId) {
        super();
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
    constructor() {
        super();
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
