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
const { AWAITING_START } = require("../../../entities/Game");

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
        /** @type {string} */
        let userId;

        beforeEach(async () => {
            userId = (await users.add(new User())).id || fail();
        });

        test("a new game is created", async () => {
            const createdGame = await createGame.create(userId);
            expect(createdGame.id).toBeDefined();
            expect(createdGame.status()).toBe("pending");
        });

        test("the new game is saved", async () => {
            const createdGame = await createGame.create(userId);
            expect(await games.get(createdGame.id)).toBe(createdGame);
        });

        test("user is added to game", async () => {
            const createdGame = await createGame.create(userId);
            expect(createdGame.hasUser(userId)).toStrictEqual(true);
        });

        test("user is waiting for the game to start", async () => {
            const createdGame = await createGame.create(userId);
            expect(createdGame.userActivity(userId)).toBe(AWAITING_START);
        });
    });
});
