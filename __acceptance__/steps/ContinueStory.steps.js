const { When, Given } = require("@cucumber/cucumber");
const { param } = require("../../src/validation");

Given("{string} has continued his assigned story with:", continueStoryWith);
Given("{string} has continued the story started by {string}:", continueSpecificStoryWith);
When("{string} continues his assigned story with:", continueStoryWith);

/**
 * @this {import("../fixtures/TestContext").TestContext}
 * @param {string} username
 * @param {string} content
 */
async function continueStoryWith(username, content) {
    const activity = await this.getPlayerActivity(username);
    const storyIndex = param("activity", activity).mustHaveProperty("storyIndex").mustBeNumber().value;
    await this.continueStory(username, storyIndex, content);
}

/**
 * @this {import("../fixtures/TestContext").TestContext}
 * @param {string} username
 * @param {string} creatorName
 * @param {string} content
 */
async function continueSpecificStoryWith(username, creatorName, content) {
    const storyIndex = (await this.getGameOrThrow()).stories.findIndex((story) => story.wasStartedBy(creatorName));
    await this.continueStory(username, storyIndex, content);
}
