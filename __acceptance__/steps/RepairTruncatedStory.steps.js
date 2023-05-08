const { Given, When } = require("@cucumber/cucumber");

When("{string} completes the truncation for his assigned story", async function (username) {
    const activity = await this.getPlayerActivity(username);
    await this.repairTruncatedStory(username, activity.storyIndex, "... completed story.");
});

Given("{string} has completed the truncation for his assigned story with:", async function (username, docString) {
    const activity = await this.getPlayerActivity(username);
    await this.repairTruncatedStory(username, activity.storyIndex, docString);
});

When("{string} completes the truncation for his assigned story with:", async function (username, docString) {
    const activity = await this.getPlayerActivity(username);
    await this.repairTruncatedStory(username, activity.storyIndex, docString);
});
