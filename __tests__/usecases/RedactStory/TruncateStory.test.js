const { makeGame } = require("../../../doubles/entities/makeGame");
const { FakeGameRepository } = require("../../../doubles/repositories/FakeGameRepository");
const { Game } = require("../../../entities/Game");
const { UserNotInGame, InvalidPlayerActivity } = require("../../../entities/Game.Exceptions");
const { PlayerActivity } = require("../../../entities/Game.PlayerActivity");
const { StoryStatus } = require("../../../entities/Game.Story.Status");
const { GameNotFound } = require("../../../repositories/GameRepositoryExceptions");
const { RedactStory } = require("../../../usecases/RedactStory");
const { StartStory } = require("../../../usecases/StartStory");
const { IndexOutOfBounds } = require("../../../usecases/validation");
const { OutOfRange } = require("../../../validation/numbers");
const { contract, isRequired, mustBeString, mustBeNumber } = require("../../contracts");

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
        contract("gameId", (name) => {
            isRequired(name, () => {
                // @ts-ignore
                return redactStory.truncateStory();
            });
            mustBeString(name, (gameId) => {
                // @ts-ignore
                return redactStory.truncateStory(gameId);
            });
        });
        contract("playerId", (name) => {
            isRequired(name, () => {
                // @ts-ignore
                return redactStory.truncateStory("game-id");
            });
            mustBeString(name, (playerId) => {
                // @ts-ignore
                return redactStory.truncateStory("game-id", playerId);
            });
        });
        contract("storyIndex", (name) => {
            isRequired(name, () => {
                // @ts-ignore
                return redactStory.truncateStory("game-id", "user-id", undefined);
            });
            mustBeNumber(name, (storyIndex) => {
                // @ts-ignore
                return redactStory.truncateStory("game-id", "user-id", storyIndex);
            });
        });
        contract("truncationCount", (name) => {
            isRequired(name, () => {
                // @ts-ignore
                return redactStory.truncateStory("game-id", "user-id", 0, undefined);
            });
            mustBeNumber(name, (truncationCount) => {
                // @ts-ignore
                return redactStory.truncateStory("game-id", "user-id", 0, truncationCount);
            });
            it("must be greater than 0", async () => {
                const action = redactStory.truncateStory("game-id", "user-id", 0, 0);
                await expect(action).rejects.toThrow(OutOfRange);
                await expect(action).rejects.toThrow("truncationCount <0> must be greater than 0.");
            });
            it("must be less than 7", async () => {
                const action = redactStory.truncateStory("game-id", "user-id", 0, 8);
                await expect(action).rejects.toThrow(OutOfRange);
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
                game.addPlayer("user-id");
            });

            test("the player's current activity in the game must be to redact a story", async () => {
                const action = redactStory.truncateStory(game.id, "user-id", 0, 1);
                await expect(action).rejects.toThrow(InvalidPlayerActivity);
            });

            describe("given the game has started", () => {
                beforeEach(() => {
                    game.addPlayer("player-1");
                    game.addPlayer("player-2");
                    game.addPlayer("player-3");
                    game.start();
                });

                test("the truncation count must be less than the length of the content", async () => {
                    game.startStory("player-3", "I only have five words.");
                    game.startStory("user-id", "content-0");
                    const action = redactStory.truncateStory(game.id, "user-id", 0, 5);
                    await expect(action).rejects.toThrow(IndexOutOfBounds);
                    await expect(action).rejects.toThrow("truncationCount must be less than 5");
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
                        expect(savedGame.playerActivity("user-id")).toEqual(PlayerActivity.AwaitingStory);
                    });

                    test("the story is awaiting repair by the next player", async () => {
                        await redactStory.truncateStory(game.id, "user-id", 0, 6);
                        const savedGame = (await games.get(game.id)) || fail("game was removed from repo");
                        expect(savedGame.storyActionRequired(0)).toEqual(StoryStatus.RepairTruncation.action);
                        expect(savedGame.playerAssignedToStory(0)).toEqual("player-1");
                    });

                    describe("given the previous player has already redacted a story", () => {
                        beforeEach(() => {
                            game.startStory("player-2", "content two");
                            game.truncateStory("player-3", 2, 1);
                        });
                        test("the player is repairing a story", async () => {
                            await redactStory.truncateStory(game.id, "user-id", 0, 6);
                            const savedGame = (await games.get(game.id)) || fail("game was removed from repo");
                            expect(savedGame.playerActivity("user-id")).toEqual(PlayerActivity.RepairingStory(2));
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
                            expect(savedGame.playerActivity("user-id")).toEqual(PlayerActivity.RepairingStory(2));
                        });
                    });
                });
            });
        });
    });
});
