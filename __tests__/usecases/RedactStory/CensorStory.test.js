const { makeGame } = require("../../../doubles/entities/makeGame");
const { FakeGameRepository } = require("../../../doubles/repositories/FakeGameRepository");
const { Game } = require("../../../src/entities/Game");
const { UserNotInGame, InvalidPlayerActivity } = require("../../../src/entities/Game.Exceptions");
const { PlayerActivity } = require("../../../src/entities/Game.PlayerActivity");
const { StoryStatus } = require("../../../src/entities/Game.Story.Status");
const { GameNotFound } = require("../../../src/repositories/GameRepositoryExceptions");
const { RedactStory } = require("../../../src/usecases/RedactStory");
const { StartStory } = require("../../../src/usecases/StartStory");
const { IndexOutOfBounds } = require("../../../src/usecases/validation");
const { OutOfRange } = require("../../../src/validation/numbers");
const { isRequired, mustBeString, contract, mustBeNumber } = require("../../contracts");

describe("Censor a Story", () => {
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
                return redactStory.censorStory();
            });
            mustBeString(name, (gameId) => {
                // @ts-ignore
                return redactStory.censorStory(gameId);
            });
        });
        contract("playerId", (name) => {
            isRequired(name, () => {
                // @ts-ignore
                return redactStory.censorStory("game-id");
            });
            mustBeString(name, (playerId) => {
                // @ts-ignore
                return redactStory.censorStory("game-id", playerId);
            });
        });
        contract("storyIndex", (name) => {
            isRequired(name, () => {
                // @ts-ignore
                return redactStory.censorStory("game-id", "user-id");
            });
            mustBeNumber(name, (storyIndex) => {
                // @ts-ignore
                return redactStory.censorStory("game-id", "user-id", storyIndex);
            });
        });
        contract("wordIndices", (name) => {
            isRequired(name, () => {
                // @ts-ignore
                return redactStory.censorStory("game-id", "user-id", 0, undefined);
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
                await rejection.toThrow(OutOfRange);
                await rejection.toThrow("length of wordIndices <0> must be greater than 0.");
            });
            it("requires the wordIndices to have at most three numbers", async () => {
                const action = redactStory.censorStory("game-id", "user-id", 0, [0, 0, 0, 0]);
                const rejection = expect(action).rejects;
                await rejection.toThrow(OutOfRange);
                await rejection.toThrow("length of wordIndices <4> must be less than or equal to 3.");
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
                game.addPlayer("user-id");
            });

            test("the player's current activity in the game must be to redact a story", async () => {
                const action = redactStory.censorStory(game.id, "user-id", 0, [0]);
                await expect(action).rejects.toThrow(InvalidPlayerActivity);
            });

            describe("given the player and previous player have started a story", () => {
                beforeEach(() => {
                    game.addPlayer("player-1");
                    game.addPlayer("player-2");
                    game.addPlayer("player-3");
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
                    expect(savedGame.playerActivity("user-id")).toEqual(PlayerActivity.AwaitingStory);
                });

                test("the story is awaiting repair by the next player", async () => {
                    await redactStory.censorStory(game.id, "user-id", 0, [2, 4, 6]);
                    const savedGame = (await games.get(game.id)) || fail("game was removed from repo");
                    expect(savedGame.storyActionRequired(0)).toEqual(StoryStatus.RepairCensor.action);
                    expect(savedGame.playerAssignedToStory(0)).toEqual("player-1");
                });

                describe("given the previous player has already redacted a story", () => {
                    beforeEach(() => {
                        game.startStory("player-2", "content two");
                        game.censorStory("player-3", 2, [0]);
                    });
                    test("the player is repairing a story", async () => {
                        await redactStory.censorStory(game.id, "user-id", 0, [2, 4, 6]);
                        const savedGame = (await games.get(game.id)) || fail("game was removed from repo");
                        expect(savedGame.playerActivity("user-id")).toEqual(
                            PlayerActivity.RepairingCensoredStory(2, "_______ two", [[0, 7]])
                        );
                    });
                });

                describe("once the previous player redacts a story", () => {
                    beforeEach(async () => {
                        await redactStory.censorStory(game.id, "user-id", 0, [2, 4, 6]);
                        await new StartStory(games).startStory(game.id, "player-2", "content two");
                        await redactStory.censorStory(game.id, "player-3", 2, [0]);
                    });
                    test("the player is repairing a story", async () => {
                        const savedGame = (await games.get(game.id)) || fail("game was removed from repo");
                        expect(savedGame.playerActivity("user-id")).toEqual(
                            PlayerActivity.RepairingCensoredStory(2, "_______ two", [[0, 7]])
                        );
                    });
                });
            });
        });
    });
});
