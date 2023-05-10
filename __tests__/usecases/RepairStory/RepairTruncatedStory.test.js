const { makeGame } = require("../../../doubles/entities/makeGame");
const { FakeGameRepository } = require("../../../doubles/repositories/FakeGameRepository");
const { UserNotInGame, InvalidPlayerActivity } = require("../../../src/entities/Game.Exceptions");
const { PlayerActivity } = require("../../../src/entities/Game.PlayerActivity");
const { StoryStatus } = require("../../../src/entities/Game.Story.Status");
const { GameNotFound } = require("../../../src/repositories/GameRepositoryExceptions");
const { RepairStory } = require("../../../src/usecases/RepairStory");
const { contract, isRequired, mustBeString, mustBeNumber } = require("../../contracts");

/** @type {FakeGameRepository} */
let games;

beforeEach(() => {
    games = new FakeGameRepository();
});

describe("Repair a Truncated Story", () => {
    describe("contract", () => {
        contract("gameId", (name) => {
            isRequired(name, () => {
                return repairTruncatedStory();
            });
            mustBeString(name, (gameId) => {
                return repairTruncatedStory(gameId);
            });
        });
        contract("playerId", (name) => {
            isRequired(name, () => {
                return repairTruncatedStory("game-id");
            });
            mustBeString(name, (playerId) => {
                return repairTruncatedStory("game-id", playerId);
            });
        });
        contract("storyIndex", (name) => {
            isRequired(name, () => {
                return repairTruncatedStory("game-id", "player-id");
            });
            mustBeNumber(name, (nonNumber) => {
                return repairTruncatedStory("game-id", "player-id", nonNumber);
            });
        });
    });

    test("game must exist", async () => {
        const rejection = expect(repairTruncatedStory("unknown-game-id", "user-id", 0, "replaced")).rejects;
        await rejection.toThrow(GameNotFound);
    });

    describe("given the game exists", () => {
        /** @type {import("../../../src/entities/types").Game<string>} */
        let game;
        beforeEach(async () => {
            game = await games.add(makeGame());
        });

        test("player must be in the game", async () => {
            const rejection = expect(repairTruncatedStory(game.id, "unknown-user-id", 0, "replaced")).rejects;
            await rejection.toThrow(UserNotInGame);
        });

        describe("given the user is in the game", () => {
            beforeEach(() => {
                game.addPlayer("user-id");
            });

            test("the game must have started", async () => {
                const rejection = expect(repairTruncatedStory(game.id, "user-id", 0, "replaced")).rejects;
                await rejection.toThrow(InvalidPlayerActivity);
            });

            describe("given the game has started", () => {
                beforeEach(() => {
                    game.addPlayer("player-2");
                    game.addPlayer("player-3");
                    game.addPlayer("player-4");
                    game.start();
                });

                test("the player must have started a story", async () => {
                    const rejection = expect(repairTruncatedStory(game.id, "user-id", 0, "replaced")).rejects;
                    await rejection.toThrow(InvalidPlayerActivity);
                });

                describe("given the player has started a story", () => {
                    beforeEach(() => {
                        game.startStory("user-id", "content one");
                    });

                    test("a story must be assigned to the player for repair", async () => {
                        const rejection = expect(repairTruncatedStory(game.id, "user-id", 0, "replaced")).rejects;
                        await rejection.toThrow(InvalidPlayerActivity);
                    });

                    describe("given the player has been assigned a story to repair", () => {
                        beforeEach(() => {
                            game.startStory("player-3", "content two");
                            game.startStory("player-4", "content four");
                            game.truncateStory("player-4", 1, 1);
                        });

                        test("the storyIndex must be the assigned story to repair", async () => {
                            const rejection = expect(repairTruncatedStory(game.id, "user-id", 2, "replaced")).rejects;
                            await rejection.toThrow(InvalidPlayerActivity);
                        });

                        contract("replacement", (name) => {
                            isRequired(name, () => {
                                return repairTruncatedStory(game.id, "user-id", 1);
                            });
                            mustBeString(name, (nonString) => {
                                return repairTruncatedStory(game.id, "user-id", 1, nonString);
                            });
                        });

                        test("the player is redacting a story", async () => {
                            await repairTruncatedStory(game.id, "user-id", 1, "replaced");
                            const savedGame = (await games.get(game.id)) || fail("failed to get game.");
                            expect(savedGame.playerActivity("user-id")).toEqual(
                                PlayerActivity.RedactingStory(2, "content four")
                            );
                        });

                        test("the story is awaiting a continuation from the next player", async () => {
                            await repairTruncatedStory(game.id, "user-id", 1, "replaced");
                            const savedGame = (await games.get(game.id)) || fail("failed to get game.");
                            expect(savedGame.actionRequiredInStory(1)).toEqual(StoryStatus.Continue.action);
                            expect(savedGame.playerAssignedToStory(1)).toEqual("player-2");
                        });

                        describe("the player already redacted the other story", () => {
                            beforeEach(() => {
                                game.censorStory("user-id", 2, [1]);
                            });

                            test("the player is awaiting a story", async () => {
                                await repairTruncatedStory(game.id, "user-id", 1, "replaced");
                                const savedGame = (await games.get(game.id)) || fail("failed to get game.");
                                expect(savedGame.playerActivity("user-id")).toEqual(PlayerActivity.AwaitingStory);
                            });
                        });
                    });
                });
            });

            describe("given the game has been started with only 1 entry per story", () => {
                beforeEach(() => {
                    game.addPlayer("player-2");
                    game.addPlayer("player-3");
                    game.addPlayer("player-4");
                    game.start(1);
                    game.startStory("user-id", "content one");
                    game.startStory("player-3", "content two");
                    game.startStory("player-4", "content four");
                    game.truncateStory("player-4", 1, 1);
                });

                test("the story is completed", async () => {
                    await repairTruncatedStory(game.id, "user-id", 1, "replaced");
                    const savedGame = (await games.get(game.id)) || fail("failed to get game.");
                    expect(savedGame.actionRequiredInStory(1)).toEqual(StoryStatus.Completed.action);
                });
            });
        });
    });
});

const repairTruncatedStory = require("../../../doubles/usecases").make.repairTruncatedStory({
    games: () => games,
});
