const { When, Then } = require("@cucumber/cucumber");
const { TestContext } = require("../fixtures/TestContext");
const assert = require("assert");

When(
    "all the stories have been finished",
    /**
     * @this {TestContext}
     */
    async function () {
        const playerIds = (await this.getGameOrThrow()).playerIds;
        // ensure all stories started
        for (const playerId of playerIds) {
            try {
                await this.startStory(playerId, "Some initial content");
            } catch (e) {}
        }
        let anySuccess = false;
        do {
            anySuccess = false;
            // ensure all stories redacted
            for (let i = 0; i < playerIds.length; i++) {
                const game = await this.getGameOrThrow();
                const playerId = game.playerAssignedToStory(i);
                if (playerId === undefined) continue;
                try {
                    await this.censorStory(playerId, i, [0]);
                    anySuccess = true;
                } catch (e) {}
            }
            // ensure all stories repaired
            for (let i = 0; i < playerIds.length; i++) {
                const game = await this.getGameOrThrow();
                const playerId = game.playerAssignedToStory(i);
                if (playerId === undefined) continue;
                try {
                    await this.repairTruncatedStory(playerId, i, "replacement");
                    anySuccess = true;
                } catch (e) {}
                try {
                    await this.repairCensoredStory(playerId, i, ["replacement"]);
                    anySuccess = true;
                } catch (e) {}
                try {
                    await this.repairCensoredStory(playerId, i, ["replacement", "replacement"]);
                    anySuccess = true;
                } catch (e) {}
                try {
                    await this.repairCensoredStory(playerId, i, ["replacement", "replacement", "replacement"]);
                    anySuccess = true;
                } catch (e) {}
            }
            const game = await this.getGameOrThrow();
            if (playerIds.every((playerId, index) => game.actionRequiredInStory(index) === "complete")) {
                anySuccess = false;
                break;
            }
            // continue each story
            for (let i = 0; i < playerIds.length; i++) {
                const game = await this.getGameOrThrow();
                const playerId = game.playerAssignedToStory(i);
                if (playerId === undefined) continue;
                try {
                    await this.continueStory(playerId, i, "Extended content.");
                    anySuccess = true;
                } catch (e) {}
            }
        } while (anySuccess);
    }
);

Then(
    "the game should be completed",
    /**
     * @this {TestContext}
     */
    async function () {
        const game = await this.getGameOrThrow();
        assert.equal(game.isCompleted, true);
    }
);
