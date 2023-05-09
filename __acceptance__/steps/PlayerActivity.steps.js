const { Then, DataTable } = require("@cucumber/cucumber");
const { PlayerActivity } = require("../../src/entities/Game.PlayerActivity");
const { TestContext } = require("../fixtures/TestContext");
const assert = require("assert");
const { param } = require("../../src/validation");
const { censorableWords } = require("../../src/entities/Words");

Then("{string} should be waiting for the game to start", async function (username) {
    const activity = await this.getPlayerActivity(username);
    assert.equal(activity.isSameActivityAs(PlayerActivity.AwaitingStart), true);
});

Then("{string} should be starting a story", async function (username) {
    const activity = await this.getPlayerActivity(username);
    assert.equal(activity.isSameActivityAs(PlayerActivity.StartingStory), true);
});

Then("{string} should be waiting for another story", async function (username) {
    const activity = await this.getPlayerActivity(username);
    assert.equal(activity.isSameActivityAs(PlayerActivity.AwaitingStory), true);
});

Then("{string} should be redacting a story", async function (username) {
    const activity = await this.getPlayerActivity(username);
    assert.equal(activity.name, PlayerActivity.RedactingStory(0, "").name);
});

Then("{string} should be redacting a story with the content:", async function (username, expectedContent) {
    const activity = await this.getPlayerActivity(username);
    assert.equal(activity.name, PlayerActivity.RedactingStory(0, "").name);
    assert.equal(activity.entryContent, expectedContent);
});

Then(
    "{string} should be redacting a story with {int} available words to censor",
    async function (username, expectedCount) {
        const activity = await this.getPlayerActivity(username);
        assert.equal(activity.name, PlayerActivity.RedactingStory(0, "").name);
        assert.equal(activity.wordBoundaries.length, expectedCount);
    }
);

Then("{string} should be repairing a story", async function (username) {
    const activity = await this.getPlayerActivity(username);
    assert.equal(activity.name, PlayerActivity.RepairingCensoredStory(0, "", []).name);
});

Then("{string} should be repairing a story with the content:", async function (username, expectedContent) {
    const activity = await this.getPlayerActivity(username);
    assert.equal(activity.censoredContent, expectedContent);
});

Then(
    "{string} should be repairing a story with {int} censored words to fill in",
    async function (username, expectedCount) {
        const activity = await this.getPlayerActivity(username);
        assert.equal(activity.censors.length, expectedCount);
    }
);

Then("{string} should be repairing a story with a truncation to fill in", async function (username) {
    const activity = await this.getPlayerActivity(username);
    assert.equal(activity.name, PlayerActivity.RepairingTruncatedStory(0, "", 0).name);
});

Then("{string} should be continuing a story with the content:", async function (username, expectedContent) {
    const activity = await this.getPlayerActivity(username);
    assert.equal(activity.name, PlayerActivity.ContinuingStory(0, "").name);
    assert.equal(activity.repairedContent, expectedContent);
});

Then(
    "every player should see a story with:",
    /**
     * @this {TestContext}
     * @param {DataTable} dataTable
     */
    async function (dataTable) {
        const expectedValues = dataTable.hashes().map((hash) => {
            return {
                content: hash["content"],
                censors: JSON.parse(hash["redactions"]),
            };
        });

        const playerIds = (await this.getGameOrThrow()).playerIds;
        for (const playerId of playerIds) {
            const activity = await this.getPlayerActivity(playerId);
            const stories = param("activity", activity).mustHaveProperty("stories").mustBeArray().value;
            let storyReport = "\n";
            const foundStory = stories.find((story, storyIndex) => {
                storyReport += `====== Story ${storyIndex + 1} ======\n`;
                const entries = param("story", story).mustBeArray().value;
                return entries.every((entry, index) => {
                    storyReport += entry.content + " | " + JSON.stringify(entry.censors) + "\n";
                    return entry.content === expectedValues[index].content;
                });
            });
            assert.ok(foundStory, storyReport);
        }
    }
);
