const { makeGame } = require("../../doubles/entities/makeGame");
const { FakeGameRepository } = require("../../doubles/repositories/FakeGameRepository");
const { UserNotInGame, Game, InvalidPlayerActivity } = require("../../entities/Game");
const { PlayerActivity } = require("../../entities/Game.PlayerActivity");
const { StoryStatus } = require("../../entities/Game.StoryStatus");
const { GameNotFound } = require("../../repositories/GameRepositoryExceptions");
const { RepairStory } = require("../../usecases/RepairStory");

describe("Repair a Story", () => {
    /** @type {FakeGameRepository} */
    let games;
    /** @type {RepairStory} */
    let repairStory;

    beforeEach(() => {
        games = new FakeGameRepository();
        repairStory = new RepairStory(games);
    });

    test("game must exist", async () => {
        const rejection = expect(repairStory.repairStory("unknown-game-id", "user-id", 0)).rejects;
        await rejection.toThrow(GameNotFound);
    });

    describe("given the game exists", () => {
        /** @type {Game & {id: string}} */
        let game;
        beforeEach(async () => {
            game = await games.add(makeGame());
        });

        test("player must be in the game", async () => {
            const rejection = expect(repairStory.repairStory(game.id, "unknown-user-id", 0)).rejects;
            await rejection.toThrow(UserNotInGame);
        });

        describe("given the user is in the game", () => {
            beforeEach(() => {
                game.addUser("user-id");
            });

            test("the game must have started", async () => {
                const rejection = expect(repairStory.repairStory(game.id, "user-id", 0)).rejects;
                await rejection.toThrow(InvalidPlayerActivity);
            });

            describe("given the game has started", () => {
                beforeEach(() => {
                    game.addUser("player-2");
                    game.addUser("player-3");
                    game.addUser("player-4");
                    game.start();
                });

                test("the player must have started a story", async () => {
                    const rejection = expect(repairStory.repairStory(game.id, "user-id", 0)).rejects;
                    await rejection.toThrow(InvalidPlayerActivity);
                });

                describe("given the player has started a story", () => {
                    beforeEach(() => {
                        game.startStory("user-id", "content one");
                    });

                    test("a story must be assigned to the player for repair", async () => {
                        const rejection = expect(repairStory.repairStory(game.id, "user-id", 0)).rejects;
                        await rejection.toThrow(InvalidPlayerActivity);
                    });

                    describe("given the player has been assigned a story to repair", () => {
                        beforeEach(() => {
                            game.startStory("player-3", "content two");
                            game.startStory("player-4", "content four");
                            game.censorStory("player-4", 1, [1]);
                        });

                        test("the storyIndex must be the assigned story to repair", async () => {
                            const rejection = expect(repairStory.repairStory(game.id, "user-id", 2)).rejects;
                            await rejection.toThrow(InvalidPlayerActivity);
                        });

                        test("the player is redacting a story", async () => {
                            await repairStory.repairStory(game.id, "user-id", 1);
                            const savedGame = (await games.get(game.id)) || fail("failed to get game.");
                            expect(savedGame.userActivity("user-id")).toEqual(PlayerActivity.RedactingStory(2));
                        });

                        test("the story is awaiting a continuation from the next player", async () => {
                            await repairStory.repairStory(game.id, "user-id", 1);
                            const savedGame = (await games.get(game.id)) || fail("failed to get game.");
                            expect(savedGame.storyStatus(1)).toEqual(StoryStatus.Continue("player-2"));
                        });

                        describe("the player already redacted the other story", () => {
                            beforeEach(() => {
                                game.censorStory("user-id", 2, [1]);
                            });

                            test("the player is awaiting a story", async () => {
                                await repairStory.repairStory(game.id, "user-id", 1);
                                const savedGame = (await games.get(game.id)) || fail("failed to get game.");
                                expect(savedGame.userActivity("user-id")).toEqual(PlayerActivity.AwaitingStory);
                            });
                        });

                        describe("given the story has reached its maximum number of entries", () => {
                            beforeEach(() => {
                                game.maxStoryEntries = 1;
                            });

                            test("the story is completed", async () => {
                                await repairStory.repairStory(game.id, "user-id", 1);
                                const savedGame = (await games.get(game.id)) || fail("failed to get game.");
                                expect(savedGame.storyStatus(1)).toEqual(StoryStatus.Completed);
                            });
                        });
                    });
                });
            });
        });
    });
});
