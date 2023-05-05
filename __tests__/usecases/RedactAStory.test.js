const { makeGame } = require("../../doubles/entities/makeGame");
const { FakeGameRepository } = require("../../doubles/repositories/FakeGameRepository");
const { Game, UserNotInGame, InvalidPlayerActivity } = require("../../entities/Game");
const { PlayerActivity } = require("../../entities/Game.PlayerActivity");
const { StoryStatus } = require("../../entities/Game.StoryStatus");
const { User } = require("../../entities/User");
const { GameNotFound } = require("../../repositories/GameRepositoryExceptions");
const { RedactStory } = require("../../usecases/RedactStory");
const { IndexOutOfBounds, MustHaveLength } = require("../../usecases/validation");

describe("Redact a Story", () => {
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
            it.each([13, [], {}])("requires the gameId to be a string", async (gameId) => {
                // @ts-ignore
                const action = redactStory.censorStory(gameId);
                await expect(action).rejects.toThrow(TypeError);
            });
        });
        describe("userId", () => {
            it.each([13, [], {}])("requires the userId to be a string", async (userId) => {
                // @ts-ignore
                const action = redactStory.censorStory("game-id", userId);
                await expect(action).rejects.toThrow(TypeError);
            });
        });
        describe("wordIndices", () => {
            it("requires wordIndices", async () => {
                // @ts-ignore
                const action = redactStory.censorStory("game-id", "user-id", 0, undefined);
                const rejection = expect(action).rejects;
                await rejection.toThrow(TypeError);
                await rejection.toThrow("wordIndices is required.");
            });
            it.each(["", {}, 12, true, [""], [1, 2, "16"]])(
                "requires the wordIndices to be an array of numbers",
                async (wordIndices) => {
                    // @ts-ignore
                    const action = redactStory.censorStory("game-id", "user-id", 0, wordIndices);
                    const rejection = expect(action).rejects;
                    await rejection.toThrow(TypeError);
                }
            );
            it("requires the wordIndices to have at least one number", async () => {
                const action = redactStory.censorStory("game-id", "user-id", 0, []);
                const rejection = expect(action).rejects;
                await rejection.toThrow(MustHaveLength);
                await rejection.toHaveProperty("parameterName", "wordIndices");
                await rejection.toHaveProperty("min", 1);
                await rejection.toHaveProperty("max", 3);
            });
            it("requires the wordIndices to have at most three numbers", async () => {
                const action = redactStory.censorStory("game-id", "user-id", 0, [0, 0, 0, 0]);
                const rejection = expect(action).rejects;
                await rejection.toThrow(MustHaveLength);
                await rejection.toHaveProperty("parameterName", "wordIndices");
                await rejection.toHaveProperty("min", 1);
                await rejection.toHaveProperty("max", 3);
            });
        });
    });

    test("game must exist", async () => {
        const gameId = "unknown-game";
        const action = redactStory.censorStory(gameId, "", 0, [0]);
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
            const action = redactStory.censorStory(game.id, userId, 0, [0]);
            await expect(action).rejects.toThrow(UserNotInGame);
            await expect(action).rejects.toHaveProperty("userId", userId);
        });

        describe("given the player is in the game", () => {
            beforeEach(() => {
                game.addUser("user-id");
            });

            test("the player's current activity in the game must be to redact a story", async () => {
                const action = redactStory.censorStory(game.id, "user-id", 0, [0]);
                await expect(action).rejects.toThrow(InvalidPlayerActivity);
            });

            describe("given the player and previous player have started a story", () => {
                beforeEach(() => {
                    game.addUser("player-1");
                    game.addUser("player-2");
                    game.addUser("player-3");
                    game.start();
                    game.startStory("player-3", "I have seven words in this content.");
                    game.startStory("user-id", "content-0");
                });

                test("the player must be redacting the specified story", async () => {
                    const action = redactStory.censorStory(game.id, "user-id", 2, [0]);
                    await expect(action).rejects.toThrow(InvalidPlayerActivity);
                });

                test("the word indices must be within the content of the story entry", async () => {
                    const action = redactStory.censorStory(game.id, "user-id", 0, [-1]);
                    await expect(action).rejects.toThrow(IndexOutOfBounds);
                });

                test("the word indices must be within the content of the story entry", async () => {
                    const action = redactStory.censorStory(game.id, "user-id", 0, [0, 0, 7]);
                    await expect(action).rejects.toThrow(IndexOutOfBounds);
                });

                test("the player is awaiting a story", async () => {
                    await redactStory.censorStory(game.id, "user-id", 0, [2, 4, 6]);
                    const savedGame = (await games.get(game.id)) || fail("game was removed from repo");
                    expect(savedGame.userActivity("user-id")).toEqual(PlayerActivity.AwaitingStory);
                });

                test("the story is awaiting repair by the next player", async () => {
                    await redactStory.censorStory(game.id, "user-id", 0, [2, 4, 6]);
                    const savedGame = (await games.get(game.id)) || fail("game was removed from repo");
                    expect(savedGame.storyStatus(0)).toEqual(StoryStatus.Repair("player-1", [2, 4, 6]));
                });

                describe("given the previous player has already redacted a story", () => {
                    beforeEach(() => {
                        game.startStory("player-2", "content-2");
                        game.censorStory("player-3", 2, [0]);
                    });
                    test("the player is repairing a story", async () => {
                        await redactStory.censorStory(game.id, "user-id", 0, [2, 4, 6]);
                        const savedGame = (await games.get(game.id)) || fail("game was removed from repo");
                        expect(savedGame.userActivity("user-id")).toEqual(PlayerActivity.RepairingStory(2));
                    });
                });

                describe("once the previous player redacts a story", () => {
                    beforeEach(async () => {
                        await redactStory.censorStory(game.id, "user-id", 0, [2, 4, 6]);
                        game.startStory("player-2", "content-2");
                        game.censorStory("player-3", 2, [0]);
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
