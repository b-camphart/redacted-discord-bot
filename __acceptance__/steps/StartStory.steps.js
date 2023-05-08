const { Given, When } = require("@cucumber/cucumber");

Given("{string} has started his story with:", async function (username, docString) {
    await this.startStory(username, docString);
});

Given("{string} has started his story", async function (username) {
    await this.startStory(username, `Some initial content for ${username}'s story.`);
});

When("{string} starts his story with:", async function (username, docString) {
    await this.startStory(username, docString);
});

When("{string} starts his story", async function (username) {
    await this.startStory(username, `Some initial content for ${username}'s story.`);
});
