/** @typedef {import("../../src/repositories/SubscribedPlayerRepository").SubscribedPlayerRepository} SubscribedPlayersRepository */

/**
 * @implements {SubscribedPlayersRepository}
 */
exports.FakeSubscribedPlayerRepository = class FakeSubscribedPlayerRepository {
    /** @type {Map<string, Set<string>>} */
    #subscriptions;

    constructor() {
        this.#subscriptions = new Map();
    }

    /**
     *
     * @param {import("../../src/entities/SubscribedPlayer").SubscribedPlayer} subscription
     */
    async add(subscription) {
        let playersSubscribedToGame = this.#subscriptions.get(subscription.gameId);
        if (playersSubscribedToGame === undefined) {
            playersSubscribedToGame = new Set();
            this.#subscriptions.set(subscription.gameId, playersSubscribedToGame);
        }
        playersSubscribedToGame.add(subscription.playerId);
    }
    /**
     *
     * @param {string} gameId
     * @param {string} playerId
     * @returns {Promise<boolean>}
     */
    async isSubscribed(gameId, playerId) {
        const playersSubscribedToGame = this.#subscriptions.get(gameId);
        if (playersSubscribedToGame === undefined) return false;
        return playersSubscribedToGame.has(playerId);
    }

    /**
     *
     * @param {string} gameId
     * @returns {Promise<string[]>}
     */
    async playersSubscribedToGame(gameId) {
        const playersSubscribedToGame = this.#subscriptions.get(gameId);
        if (playersSubscribedToGame === undefined) return [];
        return Array.from(playersSubscribedToGame);
    }
};

/**
 * @implements {SubscribedPlayersRepository}
 */
exports.DumbSubscribedPlayerRepository = class DumbSubscribedPlayerRepository {
    /**
     *
     * @param {import("../../src/entities/SubscribedPlayer").SubscribedPlayer} subscription
     */
    async add(subscription) {}
    /**
     *
     * @param {string} gameId
     * @param {string} playerId
     * @returns {Promise<boolean>}
     */
    async isSubscribed(gameId, playerId) {
        return false;
    }

    /**
     *
     * @param {string} gameId
     * @returns {Promise<string[]>}
     */
    async playersSubscribedToGame(gameId) {
        return [];
    }
};
