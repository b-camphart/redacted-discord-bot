const { makeGame } = require("../../doubles/entities/makeGame");
const { FakeGameRepository } = require("../../doubles/repositories/FakeGameRepository");
const { PlayerNotifierSpy, DumbPlayerNotifier } = require("../../doubles/repositories/PlayerNotifierDoubles");
const { NotEnoughPlayersToStartGame, GameAlreadyStarted, UserNotInGame } = require("../../entities/Game");
const { PlayerActivity } = require("../../entities/Game.PlayerActivity");
const { GameNotFound } = require("../../repositories/GameRepositoryExceptions");
const { StartGame } = require("../../usecases/StartGame");
const { PlayerActivityChanged } = require("../../usecases/applicationEvents");

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

    test("game must exist", async () => {
        await expect(startGame.startGame("unknown-game-id", "user-id")).rejects.toThrow(GameNotFound);
    });

    test("user must be in the game", async () => {
        const gameId = (await gameRepository.add(makeGame())).id;

        await expect(startGame.startGame(gameId, "user-id")).rejects.toThrow(UserNotInGame);
    });

    test("game must have at least 4 players", async () => {
        const gameId = (await gameRepository.add(makeGame({ userIds: new Set([userId]) }))).id;

        await expect(startGame.startGame(gameId, userId)).rejects.toThrow(NotEnoughPlayersToStartGame);
    });

    test("game must not have been started already", async () => {
        const gameId = (
            await gameRepository.add(
                makeGame({
                    userIds: new Set([userId, "2", "3", "4"]),
                    status: "started",
                })
            )
        ).id;

        await expect(startGame.startGame(gameId, userId)).rejects.toThrow(GameAlreadyStarted);
    });

    describe("given four players in a pending game", () => {
        /** @type {string} */
        let gameId;

        beforeEach(async () => {
            gameId = (await gameRepository.add(makeGame({ userIds: new Set([userId, "2", "3", "4"]) }))).id;
        });

        test("game is started", async () => {
            const startedGame = await startGame.startGame(gameId, userId);
            expect(startedGame.status()).toBe("started");
        });

        test("each player is starting a story", async () => {
            const startedGame = await startGame.startGame(gameId, userId);
            startedGame.users().forEach((userInGame) => {
                expect(startedGame.userActivity(userInGame.id())).toBe(PlayerActivity.StartingStory);
            });
        });

        test("game is saved", async () => {
            const startedGame = await startGame.startGame(gameId, userId);
            expect(await gameRepository.get(gameId)).toBe(startedGame);
        });

        test("all players are notified of their activity change", async () => {
            await startGame.startGame(gameId, userId);
            expect(playerNotifierSpy.playersNotified).toHaveLength(4);
            playerNotifierSpy.playersNotified.forEach((log) => {
                expect(log.notification).toEqual(
                    new PlayerActivityChanged(gameId, log.userId, PlayerActivity.StartingStory)
                );
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
