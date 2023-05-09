const { Given, When } = require("@cucumber/cucumber");
const { TestContext } = require("../fixtures/TestContext");

When(
    "{string} completes the truncation for his assigned story",
    /** @this {TestContext} */ async function (username) {
        const activity = await this.getPlayerActivity(username);
        await this.repairTruncatedStory(username, activity.storyIndex, "... completed story.");
    }
);

Given(
    "{string} has completed the truncation for his assigned story with:",
    /** @this {TestContext} */
    async function (username, docString) {
        const activity = await this.getPlayerActivity(username);
        await this.repairTruncatedStory(username, activity.storyIndex, docString);
    }
);

Given(
    "{string} has completed the truncation in the story started by {string} with:",
    /** @this {TestContext} */
    async function (username, creatorName, docString) {
        const storyIndex = (await this.getGameOrThrow()).stories.findIndex((story) => story.wasStartedBy(creatorName));
        await this.repairTruncatedStory(username, storyIndex, docString);
    }
);

When(
    "{string} completes the truncation for his assigned story with:",
    /** @this {TestContext} */ async function (username, docString) {
        const activity = await this.getPlayerActivity(username);
        await this.repairTruncatedStory(username, activity.storyIndex, docString);
    }
);
