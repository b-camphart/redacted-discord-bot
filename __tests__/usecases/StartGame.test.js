const { makeGame } = require("../../doubles/entities/makeGame");
const { FakeGameRepository } = require("../../doubles/repositories/FakeGameRepository");
const { PlayerNotifierSpy, DumbPlayerNotifier } = require("../../doubles/repositories/PlayerNotifierDoubles");
const { UserNotInGame, GameAlreadyStarted } = require("../../entities/Game.Exceptions");
const { PlayerActivity } = require("../../entities/Game.PlayerActivity");
const { GameNotFound } = require("../../repositories/GameRepositoryExceptions");
const { StartGame } = require("../../usecases/startGame/StartGame");
const { NotEnoughPlayersToStartGame } = require("../../usecases/startGame/validation");
const { contract, isRequired, mustBeString } = require("../contracts");

describe("Start Game", () => {
    const userId = "user-id";
    /** @type {StartGame} */
    let startGame;
    /** @type {FakeGameRepository} */
    let gameRepository;
    /** @type {PlayerNotifierSpy} */
    let playerNotifierSpy;

    beforeEach(() => {
        gameRepository = new FakeGameRepository();
        playerNotifierSpy = new PlayerNotifierSpy();
        startGame = makeStartGame(gameRepository, playerNotifierSpy);
    });

    describe("contract", () => {
        contract("gameId", (name) => {
            isRequired(name, () => {
                // @ts-ignore
                return startGame.startGame();
            });
            mustBeString(name, (gameId) => {
                // @ts-ignore
                return startGame.startGame(gameId);
            });
        });
        contract("playerId", (name) => {
            isRequired(name, () => {
                // @ts-ignore
                return startGame.startGame("game-id");
            });
            mustBeString(name, (playerId) => {
                // @ts-ignore
                return startGame.startGame("game-id", playerId);
            });
        });
    });

    test("game must exist", async () => {
        await expect(startGame.startGame("unknown-game-id", "player-id")).rejects.toThrow(GameNotFound);
    });

    describe("given the game exists", () => {
        /** @type {string} */
        let gameId;
        beforeEach(async () => {
            gameId = (await gameRepository.add(makeGame())).id;
        });

        test("the player must be in the game", async () => {
            await expect(startGame.startGame(gameId, "unknown-player-id")).rejects.toThrow(UserNotInGame);
        });

        describe("given the player is in the game", () => {
            const addNewPlayerToGame = async () => {
                const game = (await gameRepository.get(gameId)) || fail(new GameNotFound(gameId));
                const playerId = `player-${game.playerIds().length + 1}`;
                game.addPlayer(playerId);
                await gameRepository.replace(game);
                return playerId;
            };

            /** @type {string} */
            let playerId;
            beforeEach(async () => {
                playerId = await addNewPlayerToGame();
            });

            test("game must have at least 4 players", async () => {
                await addNewPlayerToGame();
                await addNewPlayerToGame();

                await expect(startGame.startGame(gameId, playerId)).rejects.toThrow(NotEnoughPlayersToStartGame);
            });

            describe("given 4 players are in the game", () => {
                beforeEach(async () => {
                    for (let i = 0; i < 3; i++) {
                        await addNewPlayerToGame();
                    }
                });

                test("the game is started", async () => {
                    await startGame.startGame(gameId, playerId);
                    const updatedGame = (await gameRepository.get(gameId)) || fail(new GameNotFound(gameId));
                    expect(updatedGame.isStarted).toEqual(true);
                });

                test("each player is starting a story", async () => {
                    await startGame.startGame(gameId, playerId);
                    const updatedGame = (await gameRepository.get(gameId)) || fail(new GameNotFound(gameId));
                    updatedGame.playerIds().forEach((userIdInGame) => {
                        expect(updatedGame.playerActivity(userIdInGame)).toBe(PlayerActivity.StartingStory);
                    });
                });

                describe("given the game was already started", () => {
                    beforeEach(async () => {
                        await startGame.startGame(gameId, playerId);
                    });

                    test("the game cannot be started twice", async () => {
                        await expect(startGame.startGame(gameId, playerId)).rejects.toThrow(GameAlreadyStarted);
                    });
                });
            });
        });
    });
});

/**
 *
 * @param {any} gameRepository
 * @param {import("../../repositories/PlayerNotifier").PlayerNotifier} playerNotifier
 * @returns {StartGame}
 */
const makeStartGame = (gameRepository = new FakeGameRepository(), playerNotifier = new DumbPlayerNotifier()) => {
    return new StartGame(gameRepository, playerNotifier);
};

exports.makeStartGame = makeStartGame;
