const { When, Given } = require("@cucumber/cucumber");

Given("{string} has started the game", async function (username) {
    await this.startGame(username);
});

When("{string} starts the game", async function (username) {
    await this.startGame(username);
});
