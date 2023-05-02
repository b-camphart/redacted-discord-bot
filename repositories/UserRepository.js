/** @typedef {import("../entities/User").User} User */

/**
 *
 * @typedef {User & {id: string}} UserWithId
 *
 */

/**
 * @typedef {Object} UserRepository
 * @property {(userId: string) => Promise<UserWithId | undefined>} get
 * @property {(user: User) => Promise<UserWithId>} add
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
