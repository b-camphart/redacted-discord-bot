/** @typedef {import("../entities/User").User} User */

/**
 * @typedef {Object} UserRepository
 * @property {(userId: string) => Promise<User | undefined>} get
 * @property {(user: User) => Promise<User>} add
 *
 */

exports.UserNotFound = class UserNotFound extends Error {
    /**
     *
     * @param {string} userId
     */
    constructor(userId) {
        super();
        this.userId = userId;
    }
};
