const { When, Given } = require("@cucumber/cucumber");
const { range, inclusive, exclusive } = require("../../utils/range");

Given("{string} has truncated his assigned story", async function (username) {
    const activity = await this.getPlayerActivity(username);
    const numberOfCensors = range(inclusive(1), inclusive(Math.min(activity.wordBoundaries.length, 7))).random();
    await this.truncateStory(username, activity.storyIndex, numberOfCensors);
});

Given("{string} has truncated {int} words", async function (username, truncationCount) {
    const activity = await this.getPlayerActivity(username);
    await this.truncateStory(username, activity.storyIndex, truncationCount);
});

When("{string} truncates his assigned story", async function (username) {
    const activity = await this.getPlayerActivity(username);
    const numberOfCensors = range(inclusive(1), inclusive(Math.min(activity.wordBoundaries.length, 7))).random();
    await this.truncateStory(username, activity.storyIndex, numberOfCensors);
});

When("{string} truncates {int} words", async function (username, truncationCount) {
    const activity = await this.getPlayerActivity(username);
    await this.truncateStory(username, activity.storyIndex, truncationCount);
});
