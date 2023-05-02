/** @typedef {import("../../repositories/PlayerNotifier").PlayerNotifier} PlayerNotifier */

/**
 * @implements {PlayerNotifier}
 */
exports.PlayerNotifierSpy = class PlayerNotifierSpy {
    constructor() {
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
