const { PlayerActivity } = require("./Game.PlayerActivity");

/**
 * @typedef {Object} StoryStatus
 * @property {string} status
 * @property {string} playerId
 * @property {(storyIndex: number) => { activity: string }} toPlayerActivity
 *
 */

class StoryStatusImpl {
    /**
     *
     * @param {string} status
     * @param {string} playerId
     */
    constructor(status, playerId) {
        this.status = status;
        this.playerId = playerId;
    }

    /** @param {number} storyIndex */
    toPlayerActivity(storyIndex) {}
}

class Redact extends StoryStatusImpl {
    /**
     *
     * @param {string} playerId
     */
    constructor(playerId) {
        super("redact", playerId);
        this.playerId = playerId;
    }
    /**
     *  @param {number} storyIndex
     * @returns {{ activity: string }}
     */
    toPlayerActivity(storyIndex) {
        return PlayerActivity.RedactingStory(storyIndex);
    }
}

class Repair extends StoryStatusImpl {
    /**
     *
     * @param {string} playerId
     * @param {number[]} censoredWordIndices
     */
    constructor(playerId, censoredWordIndices) {
        super("repair", playerId);
        this.playerId = playerId;
        this.censoredWordIndices = censoredWordIndices;
    }

    /**
     *  @param {number} storyIndex
     * @returns {{ activity: string }}
     */
    toPlayerActivity(storyIndex) {
        return PlayerActivity.RepairingStory(storyIndex);
    }
}

exports.StoryStatus = {
    /**
     *
     * @param {string} playerId
     * @returns {StoryStatus}
     */
    Redact: (playerId) => {
        return new Redact(playerId);
    },
    /**
     *
     * @param {string} playerId
     * @param {number[]} censoredWordIndices
     * @returns {StoryStatus}
     */
    Repair: (playerId, censoredWordIndices) => {
        return new Repair(playerId, censoredWordIndices);
    },
};
