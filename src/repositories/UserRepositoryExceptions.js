const { NotFound } = require("./NotFound");

exports.UserNotFound = class UserNotFound extends NotFound {
    /**
     *
     * @param {string} userId
     */
    constructor(userId) {
        super(`User ${userId} not found.`);
        this.userId = userId;
    }
};
