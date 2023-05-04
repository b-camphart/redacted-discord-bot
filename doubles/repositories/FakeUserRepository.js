/** @typedef {import("./UserRepository").UserRepository} UserRepository */
/** @typedef {import("./UserRepository").UserWithId} UserWithId */

const { User } = require("../../entities/User");

/**
 * @implements {UserRepository}
 */
exports.FakeUserRepository = class FakeUserRepository {
    /** @type {Map<string, UserWithId>} */
    #users;

    constructor() {
        this.#users = new Map();
    }

    /**
     *
     * @param {string} userId
     * @returns {Promise<UserWithId | undefined>}
     */
    async get(userId) {
        return this.#users.get(userId);
    }

    /**
     *
     * @param {User} user
     * @returns {Promise<UserWithId>}
     */
    async add(user) {
        if (user.id !== undefined) throw "User with id unexpected.";
        const userWithId = this.#addIdToUser(user);
        this.#users.set(userWithId.id, userWithId);
        return userWithId;
    }

    /**
     *
     * @param {User} user
     * @returns {UserWithId}
     */
    #addIdToUser(user) {
        user.id = `FakeID: ${this.#users.size}`;
        return /** @type {UserWithId} */ (user);
    }
};
