const { When, Given } = require("@cucumber/cucumber");
const { TestContext } = require("../fixtures/TestContext");

Given("{string} has started the game", async function (username) {
    await this.startGame(username);
});

Given("{string} has started the game with {int} entries per story", startGameWithMaxEntries);

When("{string} starts the game", async function (username) {
    await this.startGame(username);
});

/**
 * @this {TestContext}
 * @param {string} username
 * @param {number} maxCount
 */
async function startGameWithMaxEntries(username, maxCount) {
    await this.startGame(username, maxCount);
}
