const { Given, When, DataTable } = require("@cucumber/cucumber");
const { repeat, repeatAsync } = require("../../utils/iteration");

Given("{string} has joined the game", async function (username) {
    await this.joinGame(username);
});

Given("{int} more players have joined the game", async function (playerCount) {
    await repeatAsync(playerCount, async (i) => {
        await this.joinGame(`player-${i}`);
    });
});

Given(
    "the following players have all joined the game:",
    /**
     * @param {DataTable} playerList
     */
    async function (playerList) {
        for (const playerId of playerList.raw()[0]) {
            await this.joinGame(playerId);
        }
    }
);

When("{string} joins the game", async function (username) {
    await this.joinGame(username);
});
