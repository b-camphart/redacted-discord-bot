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

    getUsers() {
        return [...this.#userIds];
    }
};
