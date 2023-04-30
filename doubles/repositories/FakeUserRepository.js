/** @typedef {import("../../repositories/UserRepository").UserRepository} UserRepository */

const { User } = require("../../entities/User");

/**
 * @implements {UserRepository}
 */
exports.FakeUserRepository = class FakeUserRepository {
    /** @type {Map<string, User>} */
    #users;

    constructor() {
        this.#users = new Map();
    }

    /**
     *
     * @param {string} userId
     * @returns {Promise<User | undefined>}
     */
    async get(userId) {
        return this.#users.get(userId);
    }

    /**
     *
     * @param {User} user
     * @returns {Promise<User>}
     */
    async add(user) {
        user.id = `${this.#users.size}`;
        this.#users.set(user.id, user);
        return user;
    }
};
