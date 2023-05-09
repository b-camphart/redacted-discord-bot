const { When, Given, DataTable } = require("@cucumber/cucumber");
const { range, inclusive, exclusive } = require("../../src/utils/range");
const { repeat } = require("../../src/utils/iteration");
const { TestContext } = require("../fixtures/TestContext");
const { PlayerActivity } = require("../../src/entities/Game.PlayerActivity");
const { param } = require("../../src/validation");

Given("{string} has censored the following words:", censorWithWords);
Given("{string} has censored the following words in the story started by {string}:", censorWithWordsInSpecificStory);
When("{string} censors the following words:", censorWithWords);

Given("{string} has censored his assigned story", censorAssignedStory);
When("{string} censors his assigned story", censorAssignedStory);

/**
 * @this {TestContext}
 * @param {string} username
 */
async function censorAssignedStory(username) {
    const activity = await this.getPlayerActivity(username);
    if (activity.name !== "redacting-story") throw `Expected ${username} to be redacting, but was ${activity.name}`;
    const wordBoundaries = param("activity", activity).mustHaveProperty("wordBoundaries").mustBeArray().value;
    const storyIndex = param("activity", activity).mustHaveProperty("storyIndex").mustBeNumber().value;
    const numberOfCensors = range(inclusive(1), inclusive(3)).random();
    /**
     * @type {number[]}
     */
    const uniqueCensorIndices = [];
    repeat(numberOfCensors, () => {
        uniqueCensorIndices.push(range(inclusive(1), exclusive(wordBoundaries.length)).random());
    });
    await this.censorStory(username, storyIndex, uniqueCensorIndices);
}

/**
 * @this {TestContext}
 * @param {string} username
 * @param {DataTable} dataTable
 */
async function censorWithWords(username, dataTable) {
    const activity = await this.getPlayerActivity(username);
    const storyIndex = param("activity", activity).mustHaveProperty("storyIndex").mustBeNumber().value;
    await this.censorStory(
        username,
        storyIndex,
        dataTable.raw()[0].map((str) => Number.parseInt(str))
    );
}

/**
 * @this {TestContext}
 * @param {string} username
 * @param {string} creatorName
 * @param {DataTable} dataTable
 */
async function censorWithWordsInSpecificStory(username, creatorName, dataTable) {
    const storyIndex = (await this.getGameOrThrow()).stories.findIndex((story) => story.wasStartedBy(creatorName));
    await this.censorStory(
        username,
        storyIndex,
        dataTable.raw()[0].map((str) => Number.parseInt(str))
    );
}
