/**
 * @typedef {"pending" | "started" | "ended"} GameStatus
 */

class Game {
    id;
    #userIds;
    #status;

    /**
     *
     * @param {string | undefined} id
     * @param {Set<string>} userIds
     * @param {GameStatus} status
     */
    constructor(id = undefined, userIds = new Set(), status = "pending") {
        this.id = id;
        this.#userIds = userIds;
        this.#status = status;
    }

    /**
     * @param {string} userId the id of the user to add to the game
     */
    addUser(userId) {
        if (this.#userIds.has(userId)) return;
        this.#userIds.add(userId);
    }

    /**
     * @returns {string[]} the ids of users ids that have been added to the game so far.
     */
    getUsers() {
        return Array.from(this.#userIds);
    }

    /**
     * Checks if the userId is in the game.
     * @param {string} userId The user id to check
     * @returns {boolean} `true` if the user is in the game, `false` otherwise.
     */
    hasUser(userId) {
        return this.#userIds.has(userId);
    }

    /**
     * @returns {GameStatus}
     */
    status() {
        return this.#status;
    }

    start() {
        if (this.#status !== "pending")
            throw new GameAlreadyStarted(this.id || "");
        if (this.#userIds.size < 4)
            throw new NotEnoughPlayersToStartGame(
                this.id || "",
                this.#userIds.size
            );

        this.#status = "started";
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

module.exports = { Game, GameAlreadyStarted, NotEnoughPlayersToStartGame };
