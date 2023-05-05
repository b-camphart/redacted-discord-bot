const { makeGame } = require("../../doubles/entities/makeGame");
const { FakeGameRepository } = require("../../doubles/repositories/FakeGameRepository");
const { Game, UserNotInGame, InvalidPlayerActivity } = require("../../entities/Game");
const { PlayerActivity } = require("../../entities/Game.PlayerActivity");
const { StoryStatus } = require("../../entities/Game.StoryStatus");
const { User } = require("../../entities/User");
const { GameNotFound } = require("../../repositories/GameRepositoryExceptions");
const { RedactStory } = require("../../usecases/RedactStory");
const { StartStory } = require("../../usecases/StartStory");
const { IndexOutOfBounds, MustHaveLength } = require("../../usecases/validation");

describe("Truncate a Story", () => {
    /** @type {FakeGameRepository} */
    let games;

    /** @type {RedactStory} */
    let redactStory;

    beforeEach(() => {
        games = new FakeGameRepository();
        redactStory = new RedactStory(games);
    });

    describe("contract", () => {
        describe("gameId", () => {
            it("is a required", async () => {
                // @ts-ignore
                const action = redactStory.truncateStory();
                await expect(action).rejects.toThrow(TypeError);
                await expect(action).rejects.toThrow("gameId is required.");
            });
            it.each([13, [], {}])("must be a string", async (gameId) => {
                // @ts-ignore
                const action = redactStory.truncateStory(gameId);
                await expect(action).rejects.toThrow(TypeError);
                await expect(action).rejects.toThrow("gameId must be a string.");
            });
        });
        describe("userId", () => {
            it("is a required", async () => {
                // @ts-ignore
                const action = redactStory.truncateStory("game-id", undefined);
                await expect(action).rejects.toThrow(TypeError);
                await expect(action).rejects.toThrow("userId is required.");
            });
            it.each([13, [], {}])("must be a string", async (userId) => {
                // @ts-ignore
                const action = redactStory.truncateStory("game-id", userId);
                await expect(action).rejects.toThrow(TypeError);
                await expect(action).rejects.toThrow("userId must be a string.");
            });
        });
        describe("storyIndex", () => {
            it("is a required", async () => {
                // @ts-ignore
                const action = redactStory.truncateStory("game-id", "user-id", undefined);
                await expect(action).rejects.toThrow(TypeError);
                await expect(action).rejects.toThrow("storyIndex is required.");
            });
            it.each(["12", [], {}])("must be a number", async (storyIndex) => {
                // @ts-ignore
                const action = redactStory.truncateStory("game-id", "user-id", storyIndex);
                await expect(action).rejects.toThrow(TypeError);
                await expect(action).rejects.toThrow("storyIndex must be a number.");
            });
        });
        describe("truncationCount", () => {
            it("is required", async () => {
                // @ts-ignore
                const action = redactStory.truncateStory("game-id", "user-id", 0, undefined);
                await expect(action).rejects.toThrow(TypeError);
                await expect(action).rejects.toThrow("truncationCount is required.");
            });
            it.each(["12", [], {}])("must be a number", async (truncationCount) => {
                // @ts-ignore
                const action = redactStory.truncateStory("game-id", "user-id", 0, truncationCount);
                await expect(action).rejects.toThrow(TypeError);
                await expect(action).rejects.toThrow("truncationCount must be a number.");
            });
            it("must be greater than 0", async () => {
                const action = redactStory.truncateStory("game-id", "user-id", 0, 0);
                await expect(action).rejects.toThrow(IndexOutOfBounds);
                await expect(action).rejects.toThrow("truncationCount <0> must be greater than 0.");
            });
            it("must be less than 7", async () => {
                const action = redactStory.truncateStory("game-id", "user-id", 0, 8);
                await expect(action).rejects.toThrow(IndexOutOfBounds);
                await expect(action).rejects.toThrow("truncationCount <8> must be less than 7.");
            });
        });
    });

    test("game must exist", async () => {
        const gameId = "unknown-game";
        const action = redactStory.truncateStory(gameId, "", 0, 1);
        await expect(action).rejects.toThrow(GameNotFound);
        await expect(action).rejects.toHaveProperty("gameId", gameId);
    });

    describe("given the game exists", () => {
        /** @type {Game & { id: string }} */
        let game;

        beforeEach(async () => {
            game = await games.add(makeGame());
        });

        test("player must be in the game", async () => {
            const userId = "unknown-user";
            const action = redactStory.truncateStory(game.id, userId, 0, 1);
            await expect(action).rejects.toThrow(UserNotInGame);
            await expect(action).rejects.toHaveProperty("userId", userId);
        });

        describe("given the player is in the game", () => {
            beforeEach(() => {
                game.addUser("user-id");
            });

            test("the player's current activity in the game must be to redact a story", async () => {
                const action = redactStory.truncateStory(game.id, "user-id", 0, 1);
                await expect(action).rejects.toThrow(InvalidPlayerActivity);
            });

            describe("given the game has started", () => {
                beforeEach(() => {
                    game.addUser("player-1");
                    game.addUser("player-2");
                    game.addUser("player-3");
                    game.start();
                });

                test("the truncation count must be less than the length of the content", async () => {
                    game.startStory("player-3", "I only have five words.");
                    game.startStory("user-id", "content-0");
                    const action = redactStory.truncateStory(game.id, "user-id", 0, 5);
                    await expect(action).rejects.toThrow(IndexOutOfBounds);
                    await expect(action).rejects.toThrow("truncationCount must be less than 5.");
                });

                describe("given the player and previous player have started a story", () => {
                    beforeEach(() => {
                        game.startStory("player-3", "I'll have thirteen words in this content, if I add a few more.");
                        game.startStory("user-id", "content-0");
                    });

                    test("the player must be redacting the specified story", async () => {
                        const action = redactStory.truncateStory(game.id, "user-id", 2, 5);
                        await expect(action).rejects.toThrow(InvalidPlayerActivity);
                    });

                    test("the player is awaiting a story", async () => {
                        await redactStory.truncateStory(game.id, "user-id", 0, 6);
                        const savedGame = (await games.get(game.id)) || fail("game was removed from repo");
                        expect(savedGame.userActivity("user-id")).toEqual(PlayerActivity.AwaitingStory);
                    });

                    test("the story is awaiting repair by the next player", async () => {
                        await redactStory.truncateStory(game.id, "user-id", 0, 6);
                        const savedGame = (await games.get(game.id)) || fail("game was removed from repo");
                        expect(savedGame.storyStatus(0)).toEqual(StoryStatus.RepairTruncation("player-1", 6));
                    });

                    describe("given the previous player has already redacted a story", () => {
                        beforeEach(() => {
                            game.startStory("player-2", "content two");
                            game.truncateStory("player-3", 2, 1);
                        });
                        test("the player is repairing a story", async () => {
                            await redactStory.truncateStory(game.id, "user-id", 0, 6);
                            const savedGame = (await games.get(game.id)) || fail("game was removed from repo");
                            expect(savedGame.userActivity("user-id")).toEqual(PlayerActivity.RepairingStory(2));
                        });
                    });

                    describe("once the previous player redacts a story", () => {
                        beforeEach(async () => {
                            await redactStory.truncateStory(game.id, "user-id", 0, 6);
                            await new StartStory(games).startStory(game.id, "player-2", "content two");
                            await redactStory.truncateStory(game.id, "player-3", 2, 1);
                        });
                        test("the player is repairing a story", async () => {
                            const savedGame = (await games.get(game.id)) || fail("game was removed from repo");
                            expect(savedGame.userActivity("user-id")).toEqual(PlayerActivity.RepairingStory(2));
                        });
                    });
                });
            });
        });
    });
});
