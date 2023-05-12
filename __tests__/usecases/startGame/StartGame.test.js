const { makeGame } = require("../../../doubles/entities/makeGame");
const { FakeGameRepository } = require("../../../doubles/repositories/FakeGameRepository");
const { PlayerNotifierSpy } = require("../../../doubles/repositories/PlayerNotifierDoubles");
const { DumbSubscribedPlayerRepository } = require("../../../doubles/repositories/SubscribedPlayerRepositoryDoubles");
const { UserNotInGame, GameAlreadyStarted } = require("../../../src/entities/Game.Exceptions");
const { PlayerActivity } = require("../../../src/entities/Game.PlayerActivity");
const { GameNotFound } = require("../../../src/repositories/GameRepositoryExceptions");
const { StartGame } = require("../../../src/usecases/startGame/StartGame");
const { NotEnoughPlayersToStartGame } = require("../../../src/usecases/startGame/validation");
const { contract, isRequired, mustBeString } = require("../../contracts");

/** @type {FakeGameRepository} */
let gameRepository;
/** @type {PlayerNotifierSpy} */
let playerNotifierSpy;

beforeEach(() => {
    gameRepository = new FakeGameRepository();
    playerNotifierSpy = new PlayerNotifierSpy();
});

describe("contract", () => {
    contract("gameId", (name) => {
        isRequired(name, () => {
            // @ts-ignore
            return startGame();
        });
        mustBeString(name, (gameId) => {
            // @ts-ignore
            return startGame(gameId);
        });
    });
    contract("playerId", (name) => {
        isRequired(name, () => {
            // @ts-ignore
            return startGame("game-id");
        });
        mustBeString(name, (playerId) => {
            // @ts-ignore
            return startGame("game-id", playerId);
        });
    });
});

test("game must exist", async () => {
    await expect(startGame("unknown-game-id", "player-id")).rejects.toThrow(GameNotFound);
});

describe("given the game exists", () => {
    /** @type {string} */
    let gameId;
    beforeEach(async () => {
        gameId = (await gameRepository.add(makeGame())).id;
    });

    test("the player must be in the game", async () => {
        await expect(startGame(gameId, "unknown-player-id")).rejects.toThrow(UserNotInGame);
    });

    describe("given the player is in the game", () => {
        const addNewPlayerToGame = async () => {
            const game = (await gameRepository.get(gameId)) || fail(new GameNotFound(gameId));
            const playerId = `player-${game.playerIds.length + 1}`;
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

            await expect(startGame(gameId, playerId)).rejects.toThrow(NotEnoughPlayersToStartGame);
        });

        describe("given 4 players are in the game", () => {
            beforeEach(async () => {
                for (let i = 0; i < 3; i++) {
                    await addNewPlayerToGame();
                }
            });

            test("the game is started", async () => {
                await startGame(gameId, playerId);
                const updatedGame = (await gameRepository.get(gameId)) || fail(new GameNotFound(gameId));
                expect(updatedGame.isStarted).toEqual(true);
            });

            test("each player is starting a story", async () => {
                await startGame(gameId, playerId);
                const updatedGame = (await gameRepository.get(gameId)) || fail(new GameNotFound(gameId));
                updatedGame.playerIds.forEach((userIdInGame) => {
                    expect(updatedGame.playerActivity(userIdInGame)).toBe(PlayerActivity.StartingStory);
                });
            });

            describe("given the game was already started", () => {
                beforeEach(async () => {
                    await startGame(gameId, playerId);
                });

                test("the game cannot be started twice", async () => {
                    await expect(startGame(gameId, playerId)).rejects.toThrow(GameAlreadyStarted);
                });
            });
        });
    });
});

/**
 *
 * @param {any} [gameId]
 * @param {any} [playerId]
 * @param {any} [maxEntries]
 * @returns
 */
function startGame(gameId, playerId, maxEntries) {
    const useCase = new StartGame(gameRepository, new DumbSubscribedPlayerRepository(), playerNotifierSpy);
    return useCase.startGame(gameId, playerId, maxEntries);
}
