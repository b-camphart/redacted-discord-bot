exports.NotFound = class NotFound extends Error {
    /**
     *
     * @param {string} [message]
     */
    constructor(message) {
        super(message || "NotFound");
    }
};
