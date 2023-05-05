/**
 * @typedef {Object} PlayerActivity
 * @prop {string} activity
 */

/**
 * @typedef {PlayerActivity} ActivityInStory
 * @prop {number} storyIndex
 */

exports.PlayerActivity = Object.freeze({
    AwaitingStart: Object.freeze({ activity: "awaiting-start" }),
    StartingStory: Object.freeze({ activity: "starting-story" }),
    AwaitingStory: Object.freeze({ activity: "awaiting-story" }),
    /**
     *
     * @param {number} storyIndex
     */
    RedactingStory: (storyIndex) => {
        return Object.freeze({
            activity: "redacting-story",
            storyIndex,
        });
    },
    /**
     *
     * @param {number} storyIndex
     */
    RepairingStory: (storyIndex) => {
        return Object.freeze({
            activity: "repairing-story",
            storyIndex,
        });
    },
});

/**
 *
 * @type {(playerActivity: PlayerActivity) => playerActivity is ActivityInStory}
 */
const isActivityInStory = (playerActivity) => {
    // @ts-ignore
    return playerActivity.hasOwnProperty("storyIndex") && typeof playerActivity.storyIndex === "number";
};

/**
 *
 * @param {PlayerActivity} activity1
 * @param {PlayerActivity} activity2
 * @returns
 */
exports.isSameActivity = function (activity1, activity2) {
    if (activity1.activity !== activity2.activity) return false;
    if (!isActivityInStory(activity1)) return false;
    if (!isActivityInStory(activity2)) return false;
    // @ts-ignore
    if (activity1.storyIndex !== activity2.storyIndex) return false;
    return true;
};
