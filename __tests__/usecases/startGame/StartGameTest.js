const { makeGame } = require("../../../doubles/entities/makeGame");
const {
    FakeGameRepository,
} = require("../../../doubles/repositories/FakeGameRepository");
const {
    PlayerNotifierSpy,
    DumbPlayerNotifier,
} = require("../../../doubles/repositories/PlayerNotifierDoubles");
const {
    NotEnoughPlayersToStartGame,
    GameAlreadyStarted,
} = require("../../../entities/Game");
const { GameNotFound } = require("../../../repositories/GameRepository");
const {
    StartGameUseCase,
    GameStarted,
} = require("../../../usecases/StartGame");
const { UserNotInGame } = require("../../../usecases/validation");

describe("Start Game", () => {
    const userId = "user-id";
    /** @type {import("../../../usecases/StartGame").StartGame} */
    let startGame;
    /** @type {import("../../../repositories/GameRepository").GameRepository} */
    let gameRepository;
    /** @type {PlayerNotifierSpy} */
    let playerNotifierSpy;

    beforeEach(() => {
        gameRepository = new FakeGameRepository();
        playerNotifierSpy = new PlayerNotifierSpy();
        startGame = makeStartGame(gameRepository, playerNotifierSpy);
    });

    test("game must exist", async () => {
        await expect(
            startGame.startGame("unknown-game-id", "user-id")
        ).rejects.toThrow(GameNotFound);
    });

    test("user must be in the game", async () => {
        const gameId = (await gameRepository.add(makeGame())).id;

        await expect(startGame.startGame(gameId, "user-id")).rejects.toThrow(
            UserNotInGame
        );
    });

    test("game must have at least 4 players", async () => {
        const gameId = (
            await gameRepository.add(makeGame({ userIds: new Set([userId]) }))
        ).id;

        await expect(startGame.startGame(gameId, userId)).rejects.toThrow(
            NotEnoughPlayersToStartGame
        );
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

        await expect(startGame.startGame(gameId, userId)).rejects.toThrow(
            GameAlreadyStarted
        );
    });

    describe("given four players in a pending game", () => {
        /** @type {string} */
        let gameId;

        beforeEach(async () => {
            gameId = (
                await gameRepository.add(
                    makeGame({ userIds: new Set([userId, "2", "3", "4"]) })
                )
            ).id;
        });

        test("game is started", async () => {
            const startedGame = await startGame.startGame(gameId, userId);
            expect(startedGame.status()).toBe("started");
        });

        test("game is saved", async () => {
            const startedGame = await startGame.startGame(gameId, userId);
            expect(await gameRepository.get(gameId)).toBe(startedGame);
        });

        test("all players are notified", async () => {
            await startGame.startGame(gameId, userId);
            expect(playerNotifierSpy.playersNotified).toHaveLength(4);
            playerNotifierSpy.playersNotified.forEach((log) => {
                expect(log.notification).toEqual(new GameStarted(gameId));
            });
        });
    });
});

/**
 *
 * @param {import("../../../repositories/GameRepository").GameRepository} gameRepository
 * @param {import("../../../repositories/PlayerNotifier").PlayerNotifier} playerNotifier
 * @returns {import("../../../usecases/StartGame").StartGame}
 */
const makeStartGame = (
    gameRepository = new FakeGameRepository(),
    playerNotifier = new DumbPlayerNotifier()
) => {
    return new StartGameUseCase(gameRepository, playerNotifier);
};

exports.makeStartGame = makeStartGame;
