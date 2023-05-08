const { When, Given } = require("@cucumber/cucumber");
const assert = require("assert");
const { PlayerActivity } = require("../../src/entities/Game.PlayerActivity");

Given("{string} has filled in the censored words for his assigned story", async function (username) {
    const activity = await this.getPlayerActivity(username);
    assert.equal(activity.name, PlayerActivity.RepairingCensoredStory(0, "", []).name);
    const repairs = activity.censors.map((boundary, index) => {
        return `Repaired-censor-${index}`;
    });
    await this.repairCensoredStory(username, activity.storyIndex, repairs);
});

When("{string} fills in the censored words for his assigned story", async function (username) {
    const activity = await this.getPlayerActivity(username);
    const repairs = activity.censors.map((boundary, index) => {
        return `Repaired-censor-${index}`;
    });
    await this.repairCensoredStory(username, activity.storyIndex, repairs);
});

Given("{string} has filled in the censored words for his assigned story with:", async function (username, dataTable) {
    const activity = await this.getPlayerActivity(username);
    const repairs = dataTable.raw()[0];
    await this.repairCensoredStory(username, activity.storyIndex, repairs);
});

When("{string} fills in the censored words for his assigned story with:", async function (username, dataTable) {
    const activity = await this.getPlayerActivity(username);
    const repairs = dataTable.raw()[0];
    await this.repairCensoredStory(username, activity.storyIndex, repairs);
});
