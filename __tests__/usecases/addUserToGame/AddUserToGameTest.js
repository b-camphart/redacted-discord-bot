const {
    FakeGameRepository,
} = require("../../../doubles/repositories/FakeGameRepository");
const {
    FakeUserRepository,
} = require("../../../doubles/repositories/FakeUserRepository");
const {
    makeAddUserToGame,
} = require("../../../doubles/usecases/addUserToGame/addUserToGameFactory");
const { Game } = require("../../../entities/Game");
const { User } = require("../../../entities/User");
const { GameNotFound } = require("../../../repositories/GameRepository");
const { UserNotFound } = require("../../../repositories/UserRepository");
const {
    UserAlreadyInGame,
} = require("../../../usecases/addUserToGame/UserAlreadyInGame");

describe("AddUserToGame", () => {
    /** @type {import("../../../usecases/addUserToGame/AddUserToGame").AddUserToGame} */
    let addUserToGame;
    /** @type {FakeUserRepository} */
    let userRepository;
    /** @type {FakeGameRepository} */
    let gameRepository;
    /** @type {User} */
    let user;
    /** @type {Game} */
    let game;

    beforeEach(() => {
        userRepository = new FakeUserRepository();
        gameRepository = new FakeGameRepository();
        addUserToGame = makeAddUserToGame(userRepository, gameRepository);
        user = new User();
        game = new Game();
    });

    test("user must exist", async () => {
        const gameId = (await gameRepository.add(game)).id || fail();
        await expect(
            addUserToGame.addUser("unknown-user", gameId)
        ).rejects.toThrowError(UserNotFound);
    });

    test("game must exist", async () => {
        const userId = (await userRepository.add(user)).id || fail();
        await expect(
            addUserToGame.addUser(userId, "unknown-game")
        ).rejects.toThrowError(GameNotFound);
    });

    test("user must not already be in the game", async () => {
        const userId = (await userRepository.add(user)).id || fail();
        game.addUser(userId);
        const gameId = (await gameRepository.add(game)).id || fail();
        await expect(
            addUserToGame.addUser(userId, gameId)
        ).rejects.toThrowError(UserAlreadyInGame);
    });

    test("user is added to the game", async () => {
        const gameId = (await gameRepository.add(game)).id || fail();
        const userId = (await userRepository.add(user)).id || fail();

        const updatedGame = await addUserToGame.addUser(userId, gameId);
        expect(updatedGame.id).toEqual(gameId);
        expect(updatedGame.getUsers().length).toEqual(1);
        expect(updatedGame.hasUser(userId)).toBeTruthy();

        const savedGame = await gameRepository.get(game.id);
        expect(savedGame).toEqual(updatedGame);
    });
});
