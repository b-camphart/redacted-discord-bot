exports.Game = class Game {
    /** @type {string | undefined} */
    id;
    #userIds;

    /**
     *
     * @param {object} init
     * @param {string | undefined} init.id
     * @param {Set<string>} init.userIds
     */
    constructor(
        { id = undefined, userIds = new Set() } = {
            id: undefined,
            userIds: new Set(),
        }
    ) {
        this.id = id;
        this.#userIds = userIds;
    }

    /**
     * @param {string} userId the id of the user to add to the game
     */
    addUser(userId) {
        if (this.#userIds.has(userId)) return;
        this.#userIds.add(userId);
    }

    /**
     * @returns {string[]} the ids of users that have been added to the game so far.
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
};
