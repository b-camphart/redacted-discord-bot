const { makeGame } = require("../../doubles/entities/makeGame");
const { FakeGameRepository } = require("../../doubles/repositories/FakeGameRepository");
const { DumbPlayerNotifier } = require("../../doubles/repositories/PlayerNotifierDoubles");
const { DumbSubscribedPlayerRepository } = require("../../doubles/repositories/SubscribedPlayerRepositoryDoubles");
const { InvalidPlayerActivity, UserNotInGame } = require("../../src/entities/Game.Exceptions");
const { PlayerActivity } = require("../../src/entities/Game.PlayerActivity");
const { StoryStatus } = require("../../src/entities/Game.Story.Status");
const { GameNotFound } = require("../../src/repositories/GameRepositoryExceptions");
const { StartStory } = require("../../src/usecases/StartStory");
const { OutOfRange } = require("../../src/validation/numbers");
const { MustNotBeBlank } = require("../../src/validation/strings");
const { contract, isRequired, mustBeString } = require("../contracts");

describe("Start Story", () => {
    /** @type {StartStory} */
    let startStory;
    /** @type {FakeGameRepository} */
    let gameRepository;

    beforeEach(() => {
        gameRepository = new FakeGameRepository();
        startStory = makeStartStory(gameRepository);
    });

    describe("contract", () => {
        contract("gameId", (name) => {
            isRequired(name, () => {
                // @ts-ignore
                return startStory.startStory();
            });
            mustBeString(name, (gameId) => {
                // @ts-ignore
                return startStory.startStory(gameId);
            });
        });
        contract("playerId", (name) => {
            isRequired(name, () => {
                // @ts-ignore
                return startStory.startStory("game-id");
            });
            mustBeString(name, (playerId) => {
                // @ts-ignore
                return startStory.startStory("game-id", playerId);
            });
        });
        contract("content", (name) => {
            isRequired(name, () => {
                // @ts-ignore
                return startStory.startStory("game-id", "player-id");
            });
            mustBeString(name, (content) => {
                // @ts-ignore
                return startStory.startStory("game-id", "player-id", content);
            });

            it.each([[""], ["  "], ["\n\r\r\n"]])("the content must not be blank", async (content) => {
                const action = startStory.startStory("game-id", "player-id", content);
                await expect(action).rejects.toThrow(MustNotBeBlank);
            });

            it("the content must not be greater than 256 characters", async () => {
                let content = "";
                for (let i = 0; i < 257; i++) content += "a";

                const action = startStory.startStory("game-id", "player-id", content);
                await expect(action).rejects.toThrow(OutOfRange);
            });
        });
    });

    test("game must exist", async () => {
        const action = startStory.startStory("unknown-game-id", "player-id", "content");
        await expect(action).rejects.toThrow(GameNotFound);
    });

    describe("given the game exists", () => {
        /** @type {import("../../src/entities/types").GameWithId} */
        let game;
        /**
         *
         * @param {string} playerId
         * @param {string} content
         */
        const startStoryInGame = async (playerId, content) => {
            return await startStory.startStory(game.id, playerId, content);
        };

        beforeEach(async () => {
            game = await gameRepository.add(makeGame());
        });

        test("the player must be in the game", async () => {
            const action = startStoryInGame("unknown-player-id", "content");
            await expect(action).rejects.toThrow(UserNotInGame);
        });

        describe("given the player is in the game", () => {
            /** @type {string} */
            let playerId;
            beforeEach(() => {
                for (let i = 0; i < 4; i++) game.addPlayer(`player-${i + 1}`);
                playerId = "player-2";
            });
            /**
             *
             * @param {string} content
             */
            const playerStartsStoryInGame = async (content) => {
                return await startStoryInGame(playerId, content);
            };

            test("the game must have been started", async () => {
                const action = playerStartsStoryInGame("content");
                await expect(action).rejects.toThrow(InvalidPlayerActivity);
            });

            describe("given the game has been started", () => {
                beforeEach(() => {
                    game.start();
                });

                describe("when the player starts their story in the game", () => {
                    const content = "some content";
                    beforeEach(async () => {
                        await playerStartsStoryInGame(content);
                    });

                    test("the game has a new story with the supplied content", async () => {
                        const updatedGame = (await gameRepository.get(game.id)) || fail("Game was not saved");
                        expect(updatedGame.storyEntry(0, 0)).toBe(content);
                    });

                    test("the player is waiting for a story update", async () => {
                        const updatedGame = (await gameRepository.get(game.id)) || fail("Game was not saved");
                        expect(updatedGame.playerActivity(playerId)).toBe(PlayerActivity.AwaitingStory);
                    });

                    test("the story needs the next player to redact the story", async () => {
                        const updatedGame = (await gameRepository.get(game.id)) || fail("Game was not saved");
                        expect(updatedGame.actionRequiredInStory(0)).toEqual(StoryStatus.Redact.action);
                        expect(updatedGame.playerAssignedToStory(0)).toEqual("player-3");
                    });

                    describe("when the previous player starts their story in the game", () => {
                        beforeEach(async () => {
                            await makeStartStory(gameRepository).startStory(game.id, "player-1", "content 1");
                        });

                        test("the player is redacting the other player's story", async () => {
                            const updatedGame = (await gameRepository.get(game.id)) || fail("Game was not saved");
                            expect(updatedGame.playerActivity("player-2")).toEqual(
                                PlayerActivity.RedactingStory(1, "content 1")
                            );
                        });
                    });
                });

                describe("given the player has already started a story in the game", () => {
                    beforeEach(async () => {
                        game.startStory(playerId, "content");
                    });

                    test("the player may not start another story", async () => {
                        const action = playerStartsStoryInGame("content");
                        await expect(action).rejects.toThrow(InvalidPlayerActivity);
                    });
                });

                describe("given the player before already started their own story in the game", () => {
                    beforeEach(async () => {
                        game.startStory("player-1", "content 1");
                    });

                    test("the player is redacting the other player's story", async () => {
                        await playerStartsStoryInGame("content 2");
                        const updatedGame = (await gameRepository.get(game.id)) || fail("Game was not saved");
                        expect(updatedGame.playerActivity("player-2")).toEqual(
                            PlayerActivity.RedactingStory(0, "content 1")
                        );
                    });
                });
            });
        });
    });
});

/**
 *
 * @param {import("../../src/repositories/GameRepository").UpdateGameRepository} gameRepository
 * @returns {StartStory}
 */
const makeStartStory = (gameRepository = new FakeGameRepository()) => {
    return new StartStory(gameRepository, new DumbSubscribedPlayerRepository(), new DumbPlayerNotifier());
};

exports.makeStartStory = makeStartStory;
