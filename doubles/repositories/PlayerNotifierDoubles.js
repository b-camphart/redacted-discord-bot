/** @typedef {import("../../src/repositories/PlayerNotifier").PlayerNotifier} PlayerNotifier */

/**
 * @implements {PlayerNotifier}
 */
exports.DumbPlayerNotifier = class DumbPlayerNotifier {
    constructor() {}

    /**
     * Does absolutely nothing.
     * @param {string} userId
     * @param {any} notification
     * @returns {Promise<void>}
     */
    async notifyPlayer(userId, notification) {}
};

/**
 * @implements {PlayerNotifier}
 */
exports.PlayerNotifierSpy = class PlayerNotifierSpy {
    constructor() {
        /**
         * @type {any[]}
         */
        this.playersNotified = [];
    }
    /**
     *
     * @param {string} userId
     * @param {any} notification
     * @returns {Promise<void>}
     */
    async notifyPlayer(userId, notification) {
        this.playersNotified.push({ userId, notification });
    }
};
