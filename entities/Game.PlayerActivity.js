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
});
