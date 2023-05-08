const { Given, When } = require("@cucumber/cucumber");

Given("{string} has created a game", async function (username) {
    await this.createGame(username);
});

When("{string} creates a new game", async function (username) {
    await this.createGame(username);
});
