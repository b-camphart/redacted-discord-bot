const { When, Given } = require("@cucumber/cucumber");
const { range, inclusive, exclusive } = require("../../src/utils/range");

Given("{string} has truncated his assigned story", async function (username) {
    const activity = await this.getPlayerActivity(username);
    const numberOfCensors = range(inclusive(1), exclusive(Math.min(activity.wordBoundaries.length, 8))).random();
    await this.truncateStory(username, activity.storyIndex, numberOfCensors);
});

Given("{string} has truncated the last {int} words", async function (username, truncationCount) {
    const activity = await this.getPlayerActivity(username);
    await this.truncateStory(username, activity.storyIndex, truncationCount);
});

Given(
    "{string} has truncated the last {int} words in the story started by {string}",
    async function (username, truncationCount, creatorName) {
        const storyIndex = (await this.getGameOrThrow()).stories.findIndex((story) => story.wasStartedBy(creatorName));
        await this.truncateStory(username, storyIndex, truncationCount);
    }
);

When("{string} truncates his assigned story", async function (username) {
    const activity = await this.getPlayerActivity(username);
    const numberOfCensors = range(inclusive(1), exclusive(Math.min(activity.wordBoundaries.length, 8))).random();
    await this.truncateStory(username, activity.storyIndex, numberOfCensors);
});

When("{string} truncates {int} words", async function (username, truncationCount) {
    const activity = await this.getPlayerActivity(username);
    await this.truncateStory(username, activity.storyIndex, truncationCount);
});
