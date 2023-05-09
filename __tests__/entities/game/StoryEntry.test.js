const { makeGame } = require("../../../doubles/entities/makeGame");
const { repeat } = require("../../../src/utils/iteration");

describe("modifications are made to the latest entry", () => {
    test("censor first entry", () => {
        const game = makeGame();
        repeat(4, (i) => game.addPlayer(`player-${i + 1}`));
        game.start(1);
        game.startStory("player-1", "This is the first entry.");
        game.censorStory("player-2", 0, [0, 1]);
        game.repairStory("player-3", 0, ["That", "was"]);

        expect(game.storyEntry(0, 0)).toBe("That was the first entry.");
    });

    test("censor second entry", () => {
        const game = makeGame();
        repeat(4, (i) => game.addPlayer(`player-${i + 1}`));
        game.start(2);
        game.startStory("player-1", "This is the first entry.");
        game.censorStory("player-2", 0, [0, 1]);
        game.repairStory("player-3", 0, ["That", "was"]);
        game.continueStory("player-4", 0, "This is the second entry.");
        game.censorStory("player-1", 0, [2, 3]);
        game.repairStory("player-2", 0, ["a", "good"]);

        expect(game.storyEntry(0, 0)).toBe("That was the first entry.");
        expect(game.storyEntry(0, 1)).toBe("This is a good entry.");
    });

    test("truncate first entry", () => {
        const game = makeGame();
        repeat(4, (i) => game.addPlayer(`player-${i + 1}`));
        game.start(1);
        game.startStory("player-1", "This is the first entry.");
        game.truncateStory("player-2", 0, 2);
        game.repairStory("player-3", 0, "very first entry.");

        expect(game.storyEntry(0, 0)).toBe("This is the very first entry.");
    });

    test("truncate second entry", () => {
        const game = makeGame();
        repeat(4, (i) => game.addPlayer(`player-${i + 1}`));
        game.start(2);
        game.startStory("player-1", "This is the first entry.");
        game.truncateStory("player-2", 0, 2);
        game.repairStory("player-3", 0, "very first entry.");
        game.continueStory("player-4", 0, "This is the second entry.");
        game.truncateStory("player-1", 0, 3);
        game.repairStory("player-2", 0, "another good entry.");

        expect(game.storyEntry(0, 0)).toBe("This is the very first entry.");
        expect(game.storyEntry(0, 1)).toBe("This is another good entry.");
    });
});
