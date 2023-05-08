const { FakeGameRepository } = require("../../doubles/repositories/FakeGameRepository");
const { FakeUserRepository } = require("../../doubles/repositories/FakeUserRepository");
const { PlayerNotifierSpy } = require("../../doubles/repositories/PlayerNotifierDoubles");
const { makeAddPlayerToGame } = require("../../doubles/usecases/addPlayerToGame/addPlayerToGameFactory");
const { Game } = require("../../src/entities/Game");
const { GameAlreadyStarted } = require("../../src/entities/Game.Exceptions");
const { User } = require("../../src/entities/User");
const { GameNotFound } = require("../../src/repositories/GameRepositoryExceptions");
const { UserNotFound } = require("../../src/repositories/UserRepositoryExceptions");
const { JoinGame } = require("../../src/usecases/joinGame/JoinGame");
const { PlayerJoinedGame } = require("../../src/usecases/joinGame/PlayerJoinedGame");
const { UserAlreadyInGame } = require("../../src/usecases/joinGame/UserAlreadyInGame");

describe("AddPlayerToGame", () => {
    /** @type {JoinGame} */
    let addPlayerToGame;
    /** @type {FakeGameRepository} */
    let gameRepository;
    /** @type {FakeUserRepository} */
    let userRepository;
    /** @type {PlayerNotifierSpy} */
    let playerNotifierSpy;

    beforeEach(() => {
        gameRepository = new FakeGameRepository();
        userRepository = new FakeUserRepository();
        playerNotifierSpy = new PlayerNotifierSpy();
        addPlayerToGame = makeAddPlayerToGame(gameRepository, userRepository, playerNotifierSpy);
    });

    test("game must exist", async () => {
        const userId = "user-id";
        await expect(addPlayerToGame.addPlayer("unknown-game-id", userId)).rejects.toThrow(GameNotFound);
    });

    test("user must exist", async () => {
        const gameId = (await gameRepository.add(new Game())).id;
        await expect(addPlayerToGame.addPlayer(gameId, "unknown-user-id")).rejects.toThrow(UserNotFound);
    });

    test("user must not already be in the game", async () => {
        const userId = (await userRepository.add(new User())).id;
        const game = new Game();
        game.addPlayer(userId);
        const gameId = (await gameRepository.add(game)).id;

        await expect(addPlayerToGame.addPlayer(gameId, userId)).rejects.toThrow(UserAlreadyInGame);
    });

    test("game must still be pending", async () => {
        const userId = (await userRepository.add(new User())).id;
        const game = new Game();
        for (let i = 0; i < 4; i++) {
            game.addPlayer(`${i}`);
        }
        game.start();
        const gameId = (await gameRepository.add(game)).id;

        await expect(addPlayerToGame.addPlayer(gameId, userId)).rejects.toThrow(GameAlreadyStarted);
    });

    test("adds the user to the game", async () => {
        const userId = (await userRepository.add(new User())).id;
        const gameId = (await gameRepository.add(new Game())).id;

        const updatedGame = await addPlayerToGame.addPlayer(gameId, userId);
        expect(updatedGame.hasPlayer(userId)).toBe(true);
        expect(await gameRepository.get(gameId)).toEqual(updatedGame);
    });

    test("notifies all players when a player is added to the game", async () => {
        const gameId = (await gameRepository.add(new Game())).id;
        const player1 = await userRepository.add(new User());
        const player2 = await userRepository.add(new User());

        await addPlayerToGame.addPlayer(gameId, player1.id);
        await addPlayerToGame.addPlayer(gameId, player2.id);

        expect(playerNotifierSpy.playersNotified).toEqual([
            {
                userId: player1.id,
                notification: new PlayerJoinedGame(gameId, player2.id),
            },
        ]);
    });
});
