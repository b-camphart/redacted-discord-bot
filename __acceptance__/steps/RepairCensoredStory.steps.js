const { When, Given, DataTable } = require("@cucumber/cucumber");
const { param } = require("../../src/validation");
const { TestContext } = require("../fixtures/TestContext");

Given("{string} has filled in the censored words for his assigned story", fillInCensoredWords);
When("{string} fills in the censored words for his assigned story", fillInCensoredWords);

/**
 * @this {TestContext}
 * @param {string} username
 */
async function fillInCensoredWords(username) {
    const activity = await this.getPlayerActivity(username);
    const storyIndex = param("activity", activity).mustHaveProperty("storyIndex").mustBeNumber().value;
    const censors = param("activity", activity).mustHaveProperty("censors").mustBeArray().value;
    const repairs = censors.map((_, index) => {
        return `Repaired-censor-${index}`;
    });
    await this.repairCensoredStory(username, storyIndex, repairs);
}

Given("{string} has filled in the censored words for his assigned story with:", fillInCensoredWordsWith);
Given(
    "{string} has filled in the censored words in the story started by {string} with:",
    fillInCensoredWordsInSpecificStoryWith
);
When("{string} fills in the censored words for his assigned story with:", fillInCensoredWordsWith);

/**
 * @this {TestContext}
 * @param {string} username
 * @param {DataTable} dataTable
 */
async function fillInCensoredWordsWith(username, dataTable) {
    const activity = await this.getPlayerActivity(username);
    const storyIndex = param("activity", activity).mustHaveProperty("storyIndex").mustBeNumber().value;
    const repairs = dataTable.raw()[0];
    await this.repairCensoredStory(username, storyIndex, repairs);
}

/**
 * @this {TestContext}
 * @param {string} username
 * @param {string} creatorName
 * @param {DataTable} dataTable
 */
async function fillInCensoredWordsInSpecificStoryWith(username, creatorName, dataTable) {
    const storyIndex = (await this.getGameOrThrow()).stories.findIndex((story) => story.wasStartedBy(creatorName));
    const repairs = dataTable.raw()[0];
    await this.repairCensoredStory(username, storyIndex, repairs);
}
