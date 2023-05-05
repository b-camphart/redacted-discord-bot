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
     * @param {{ type: "censor", wordIndices: number[] } | { type: "truncate", count: number }} redaction
     *
     */
    constructor(playerId, redaction) {
        super("repair", playerId);
        this.playerId = playerId;
        this.redaction = {
            type: redaction.type,
            wordIndices: redaction.wordIndices || undefined,
            count: redaction.count || undefined,
        };
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
     * @param {number} count
     * @returns {StoryStatus}
     */
    RepairTruncation: (playerId, count) => {
        return new Repair(playerId, { type: "truncate", count });
    },
    /**
     *
     * @param {string} playerId
     * @param {number[]} wordIndices
     * @returns {StoryStatus}
     */
    RepairCensor: (playerId, wordIndices) => {
        return new Repair(playerId, { type: "censor", wordIndices });
    },
};
