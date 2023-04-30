const { UserNotFound } = require("../../../repositories/UserRepository");
const {
    FakeUserRepository,
} = require("../../../doubles/repositories/FakeUserRepository");
const {
    makeCreateGame,
} = require("../../../doubles/usecases/createGame/createGameFactory");
const { User } = require("../../../entities/User");
const {
    FakeGameRepository,
} = require("../../../doubles/repositories/FakeGameRepository");

describe("CreateGame", () => {
    const users = new FakeUserRepository();
    const games = new FakeGameRepository();
    const createGame = makeCreateGame(users, games);

    test("user must exist", async () => {
        const userId = "123456";
        expect.assertions(2);
        try {
            await createGame.create(userId);
        } catch (error) {
            expect(error).toBeInstanceOf(UserNotFound);
            expect(error.userId).toBe(userId);
        }
    });

    describe("given user exists", () => {
        const addingUser = users.add(new User());

        test("a new game is created", async () => {
            const userId = (await addingUser).id || "";
            const createdGame = await createGame.create(userId);
            expect(await games.get(createdGame.id)).toBe(createdGame);
        });

        test("user is added to game", async () => {
            const userId = (await addingUser).id || "";
            const createdGame = await createGame.create(userId);
            expect(createdGame.getUsers()).toContain(userId);
        });
    });
});
