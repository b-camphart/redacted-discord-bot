const { makeGame } = require("../../doubles/entities/makeGame");
const { FakeGameRepository } = require("../../doubles/repositories/FakeGameRepository");
const { Game } = require("../../src/entities/Game");
const { InvalidPlayerActivity } = require("../../src/entities/Game.Exceptions");
const { ContinueStory } = require("../../src/usecases/ContinueStory");
const { repeat } = require("../../src/utils/iteration");
const { contract, isRequired, mustBeString, mustBeNumber } = require("../contracts");
const { expectActionToThrowGameNotFound, expectActionToThrowUserNotInGame } = require("./expectErrors");

/** @type {FakeGameRepository} */
let games;
beforeEach(() => {
    games = new FakeGameRepository();
});

describe("contract", () => {
    contract("gameId", (name) => {
        isRequired(name, () => {
            return continueStory();
        });
        mustBeString(name, (nonString) => {
            return continueStory(nonString);
        });
    });
    contract("playerId", (name) => {
        isRequired(name, () => {
            return continueStory("game-id");
        });
        mustBeString(name, (nonString) => {
            return continueStory("game-id", nonString);
        });
    });
    contract("storyIndex", (name) => {
        isRequired(name, () => {
            return continueStory("game-id", "player-id");
        });
        mustBeNumber(name, (nonNumber) => {
            return continueStory("game-id", "player-id", nonNumber);
        });
    });
    contract("content", (name) => {
        isRequired(name, () => {
            return continueStory("game-id", "player-id", 0);
        });
        mustBeString(name, (nonString) => {
            return continueStory("game-id", "player-id", 0, nonString);
        });
    });
});

test("game must exist", async () => {
    const action = continueStory("unknown-game-id", "player-id", 0, "");
    await expectActionToThrowGameNotFound(action, "unknown-game-id");
});

describe("given the game exists", () => {
    /** @type {Game & {id : string }} */
    let game;
    beforeEach(async () => {
        game = await games.add(makeGame());
    });
    test("player must be in the game", async () => {
        const action = continueStory(game.id, "unknown-player-id", 0, "");
        await expectActionToThrowUserNotInGame(action, "unknown-player-id", game.id);
    });

    describe("given the player is in the game", () => {
        beforeEach(async () => {
            game.addPlayer("player-id");
        });

        test("story must be ready to be continued", async () => {
            const action = continueStory(game.id, "player-id", 0, "");
            await expect(action).rejects.toThrow(InvalidPlayerActivity);
        });
        describe("given the story is ready to be continued", () => {
            beforeEach(() => {
                repeat(3, (it) => game.addPlayer(`player-${it + 1}`));
                game.start();
                game.startStory("player-1", "Some initial content.");
                game.censorStory("player-2", 0, [1]);
                game.repairStory("player-3", 0, ["good"]);
            });
            test("provided content must be censorable", async () => {
                const action = continueStory(game.id, "player-id", 0, "   ...? : --");
                await expect(action).rejects.toThrow("Content is empty of meaningful words.");
            });
            describe("given the provided content is censorable", () => {
                test("the story content should match the provided content", async () => {
                    await continueStory(game.id, "player-id", 0, "Meaningful content.");
                    const savedGame = (await games.get(game.id)) || fail("");
                    expect(savedGame.storyEntry(0, 1)).toBe("Meaningful content.");
                });
            });
        });
    });
});

/**
 *
 * @param {any} [gameId]
 * @param {any} [playerId]
 * @param {any} [storyIndex]
 * @param {any} [content]
 */
function continueStory(gameId, playerId, storyIndex, content) {
    const usecase = new ContinueStory(games);
    return usecase.continueStory(gameId, playerId, storyIndex, content);
}
