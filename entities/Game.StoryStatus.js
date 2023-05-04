const { PlayerActivity } = require("./Game.PlayerActivity");

/**
 * @typedef {Object} StoryStatus
 * @property {string} status
 * @property {string} playerId
 * @property {(storyIndex: number) => { activity: string }} toPlayerActivity
 *
 */

exports.StoryStatus = {
    /**
     *
     * @param {string} playerId
     * @returns {StoryStatus}
     */
    Redact: (playerId) => {
        const status = {
            status: "redact",
            playerId,
        };
        Object.defineProperty(status, "toPlayerActivity", {
            /** @param {number} storyIndex */
            value: (storyIndex) => PlayerActivity.RedactingStory(storyIndex),
            enumerable: false,
        });
        // @ts-ignore
        return Object.freeze(status);
    },
};
