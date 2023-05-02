const {
    FakeGameRepository,
} = require("../../../doubles/repositories/FakeGameRepository");
const {
    FakeUserRepository,
} = require("../../../doubles/repositories/FakeUserRepository");
const {
    makeAddPlayerToGame,
} = require("../../../doubles/usecases/addPlayerTogame/addPlayerToGameFactory");
const { Game } = require("../../../entities/Game");
const { User } = require("../../../entities/User");
const { GameNotFound } = require("../../../repositories/GameRepository");
const { UserNotFound } = require("../../../repositories/UserRepository");
const {
    AddPlayerToGameUseCase,
} = require("../../../usecases/addPlayerToGame/AddPlayerToGameUseCase");
const {
    UserAlreadyInGame,
} = require("../../../usecases/addPlayerToGame/UserAlreadyInGame");

describe("AddPlayerToGame", () => {
    let addPlayerToGame;
    let gameRepository;
    let userRepository;

    beforeEach(() => {
        gameRepository = new FakeGameRepository();
        userRepository = new FakeUserRepository();
        addPlayerToGame = makeAddPlayerToGame(gameRepository, userRepository);
    });

    test("game must exist", async () => {
        const userId = "user-id";
        await expect(
            addPlayerToGame.addPlayer("unknown-game-id", userId)
        ).rejects.toThrow(GameNotFound);
    });

    test("user must exist", async () => {
        const gameId = (await gameRepository.add(new Game())).id;
        await expect(
            addPlayerToGame.addPlayer(gameId, "unknown-user-id")
        ).rejects.toThrow(UserNotFound);
    });

    test("user must not already be in the game", async () => {
        const userId = (await userRepository.add(new User())).id;
        const game = new Game();
        game.addUser(userId);
        const gameId = (await gameRepository.add(game)).id;

        await expect(addPlayerToGame.addPlayer(gameId, userId)).rejects.toThrow(
            UserAlreadyInGame
        );
    });

    test("adds the user to the game", async () => {
        const userId = (await userRepository.add(new User())).id;
        const gameId = (await gameRepository.add(new Game())).id;

        const updatedGame = await addPlayerToGame.addPlayer(gameId, userId);
        expect(updatedGame.hasUser(userId)).toBe(true);
        expect(await gameRepository.get(gameId)).toBe(updatedGame);
    });
});
