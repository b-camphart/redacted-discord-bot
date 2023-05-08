const { When } = require("@cucumber/cucumber");

When("{string} continues his assigned story with:", async function (username, content) {
    const activity = await this.getPlayerActivity(username);
    this.continueStory(username, activity.storyIndex, content);
});
