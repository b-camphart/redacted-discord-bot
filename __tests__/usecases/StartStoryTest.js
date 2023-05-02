const { makeGame } = require("../../doubles/entities/makeGame");
const { FakeGameRepository } = require("../../doubles/repositories/FakeGameRepository");
const { InvalidPlayerActivity, UserNotInGame, Game, AWAITING_STORY } = require("../../entities/Game");
const { GameNotFound } = require("../../repositories/GameRepository");
const { StartStoryUseCase } = require("../../usecases/StartStory");
const { MustNotBeBlank, MustHaveLength } = require("../../usecases/validation");

describe("Start Story", () => {
    /** @type {import("../../usecases/StartStory").StartStory} */
    let startStory;
    /** @type {import("../../repositories/GameRepository").GameRepository} */
    let gameRepository;

    beforeEach(() => {
        gameRepository = new FakeGameRepository();
        startStory = makeStartStory(gameRepository);
    });

    test("game must exist", async () => {
        const action = startStory.startStory("unknown-game-id", "player-id", "content");
        await expect(action).rejects.toThrow(GameNotFound);
    });

    describe("given the game exists", () => {
        /** @type {import("../../repositories/GameRepository").GameWithId} */
        let game;
        /**
         *
         * @param {string} playerId
         * @param {string} content
         * @returns {Promise<Game>}
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
                for (let i = 0; i < 4; i++) game.addUser(`player-${i + 1}`);
                playerId = "player-2";
            });
            /**
             *
             * @param {string} content
             * @returns {Promise<Game>}
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

                test.each([[""], ["  "], ["\n\r\r\n"]])("the content must not be blank", async (content) => {
                    const action = playerStartsStoryInGame(content);
                    await expect(action).rejects.toThrow(MustNotBeBlank);
                });

                test("the content must be less than 255 characters", async () => {
                    let content = "";
                    for (let i = 0; i < 256; i++) content += "a";

                    const action = playerStartsStoryInGame(content);
                    await expect(action).rejects.toThrow(MustHaveLength);
                });

                describe("given the provided content is valid", () => {
                    const content = "some content";

                    test("the game has a new story with the supplied content", async () => {
                        const updatedGame = await playerStartsStoryInGame(content);
                        expect(updatedGame.storyEntry(0, 0)).toBe(content);
                    });

                    test("the player is waiting for a story update", async () => {
                        const updatedGame = await playerStartsStoryInGame(content);
                        expect(updatedGame.userActivity(playerId)).toBe(AWAITING_STORY);
                    });

                    test("the game is saved", async () => {
                        const updatedGame = await playerStartsStoryInGame(content);
                        expect(await gameRepository.get(game.id)).toEqual(updatedGame);
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
            });
        });
    });
});

/**
 *
 * @param {import("../../repositories/GameRepository").GameRepository} gameRepository
 * @returns {import("../../usecases/StartStory").StartStory}
 */
const makeStartStory = (gameRepository = new FakeGameRepository()) => {
    return new StartStoryUseCase(gameRepository);
};

exports.makeStartStory = makeStartStory;
