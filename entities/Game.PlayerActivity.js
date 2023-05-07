/**
 * @typedef {Object} PlayerActivity
 * @prop {string} activity
 */

/**
 * @typedef {PlayerActivity} ActivityInStory
 * @prop {number} storyIndex
 */

/** @typedef {FinishedStoryEntry[]} FinishedStory */

/**
 * @typedef {Object} FinishedStoryEntry
 * @prop {string} content
 * @prop {[number, number][]} censors
 * @prop {string[]} contributors
 */

exports.PlayerActivity = Object.freeze({
    AwaitingStart: Object.freeze({ activity: "awaiting-start" }),
    StartingStory: Object.freeze({ activity: "starting-story" }),
    AwaitingStory: Object.freeze({ activity: "awaiting-story" }),
    /**
     *
     * @param {number} storyIndex
     * @param {string} entryContent
     */
    RedactingStory: (storyIndex, entryContent) => {
        return Object.freeze({
            activity: "redacting-story",
            storyIndex,
            entryContent,
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
    /**
     *
     * @param {number} storyIndex
     * @param {string} censoredContent
     * @param {[number, number][]} censors
     */
    RepairingCensoredStory: (storyIndex, censoredContent, censors) => {
        return Object.freeze({
            activity: "repairing-censored-story",
            storyIndex,
            censoredContent,
            censors,
        });
    },

    /**
     *
     * @param {number} storyIndex
     * @param {string} repairedContent
     */
    ContinuingStory: (storyIndex, repairedContent) => {
        return Object.freeze({
            activity: "continuing-story",
            storyIndex,
            repairedContent,
        });
    },

    /**
     *
     * @param {FinishedStory[]} stories
     * @returns
     */
    ReadingFinishedStories: (stories) => {
        return Object.freeze({
            activity: "reading-finished-stories",
            stories,
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
