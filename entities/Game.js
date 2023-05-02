/**
 * @typedef {"pending" | "started" | "ended"} GameStatus
 */

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
        this.#users.set(userId, new UserInGame(userId, AWAITING_START));
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
     * @returns {PlayerActivity | undefined}
     */
    userActivity(userId) {
        return this.#users.get(userId)?.activity();
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
            this.#users.set(user.id(), new UserInGame(user.id(), STARTING_STORY));
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

        if (player.activity() !== STARTING_STORY) throw new InvalidPlayerActivity();

        this.#stories.push(new Story([content]));

        this.#users.set(player.id(), new UserInGame(player.id(), AWAITING_STORY));
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
}

const AWAITING_START = "awaiting-start";
const STARTING_STORY = "starting-story";
const AWAITING_STORY = "awaiting-story";

/**
 * @typedef {typeof AWAITING_START | typeof STARTING_STORY | typeof AWAITING_STORY} PlayerActivity
 */

class UserInGame {
    #id;
    #activity;

    /**
     *
     * @param {string} id
     * @param {PlayerActivity} activity
     */
    constructor(id, activity) {
        this.#id = id;
        this.#activity = activity;
    }

    id() {
        return this.#id;
    }

    activity() {
        return this.#activity;
    }
}

class Story {
    #entries;

    /**
     *
     * @param {string[]} entries
     */
    constructor(entries = []) {
        this.#entries = entries;
    }

    /**
     *
     * @param {number} index
     * @returns {string | undefined}
     */
    entry(index) {
        return this.#entries[index];
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
    AWAITING_START,
    STARTING_STORY,
    AWAITING_STORY,
    UserNotInGame,
    GameAlreadyStarted,
    NotEnoughPlayersToStartGame,
    InvalidPlayerActivity,
};
