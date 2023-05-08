const { When, Given } = require("@cucumber/cucumber");
const { range, inclusive, exclusive } = require("../../utils/range");
const { repeat } = require("../../utils/iteration");

Given("{string} has censored his assigned story", async function (username) {
    const activity = await this.getPlayerActivity(username);
    const numberOfCensors = range(inclusive(1), inclusive(3)).random();
    const uniqueCensorIndices = [];
    repeat(numberOfCensors, () => {
        uniqueCensorIndices.push(range(inclusive(1), exclusive(activity.wordBoundaries.length)).random());
    });
    await this.censorStory(username, activity.storyIndex, uniqueCensorIndices);
});

Given("{string} has censored the following words:", async function (username, dataTable) {
    const activity = await this.getPlayerActivity(username);
    await this.censorStory(
        username,
        activity.storyIndex,
        dataTable.raw()[0].map((str) => Number.parseInt(str))
    );
});

When("{string} censors his assigned story", async function (username) {
    const activity = await this.getPlayerActivity(username);
    const numberOfCensors = range(inclusive(1), inclusive(3)).random();
    const uniqueCensorIndices = [];
    repeat(numberOfCensors, () => {
        uniqueCensorIndices.push(range(inclusive(1), exclusive(activity.wordBoundaries.length)).random());
    });
    await this.censorStory(username, activity.storyIndex, uniqueCensorIndices);
});

When("{string} censors the following words:", async function (username, dataTable) {
    const activity = await this.getPlayerActivity(username);
    await this.censorStory(
        username,
        activity.storyIndex,
        dataTable.raw()[0].map((str) => Number.parseInt(str))
    );
});
