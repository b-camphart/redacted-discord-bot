const { UserNotFound } = require("../../repositories/UserRepositoryExceptions");
const { FakeUserRepository } = require("../../doubles/repositories/FakeUserRepository");
const { makeCreateGame } = require("../../doubles/usecases/createGame/createGameFactory");
const { User } = require("../../entities/User");
const { FakeGameRepository } = require("../../doubles/repositories/FakeGameRepository");
const { PlayerActivity } = require("../../entities/Game.PlayerActivity");
const { GameCreated } = require("../../usecases/createGame/GameCreated");
const { isRequired, mustBeString, contract } = require("../contracts");

describe("CreateGame", () => {
    const users = new FakeUserRepository();
    const games = new FakeGameRepository();
    const createGame = makeCreateGame(users, games);

    describe("contract", () => {
        contract("userId", (name) => {
            isRequired(name, () => {
                // @ts-ignore
                return createGame.create();
            });
            mustBeString(name, (userId) => {
                // @ts-ignore
                return createGame.create(userId);
            });
        });
    });

    test("user must exist", async () => {
        const userId = "123456";
        expect.assertions(2);
        try {
            await createGame.create(userId);
        } catch (error) {
            expect(error).toBeInstanceOf(UserNotFound);
            expect(/** @type {UserNotFound} */ (error).userId).toBe(userId);
        }
    });

    describe("given user exists", () => {
        /** @type {string} */
        let userId;
        /** @type {GameCreated} */
        let gameCreated;

        beforeEach(async () => {
            userId = (await users.add(new User())).id || fail();
            gameCreated = await createGame.create(userId);
        });

        test("game created event is returned", async () => {
            expect(gameCreated).toBeDefined();
            expect(gameCreated.gameId).toBeDefined();
            expect(await games.get(gameCreated.gameId)).toBeDefined();
            expect(gameCreated.createdBy).toBeDefined();
            expect(gameCreated.createdBy.playerId).toBe(userId);
        });

        test("the game is pending", async () => {
            const createdGame = (await games.get(gameCreated.gameId)) || fail();
            expect(createdGame.status()).toBe("pending");
        });

        test("user is added to game", async () => {
            const createdGame = (await games.get(gameCreated.gameId)) || fail();
            expect(createdGame.hasUser(userId)).toStrictEqual(true);
        });

        test("user is waiting for the game to start", async () => {
            const createdGame = (await games.get(gameCreated.gameId)) || fail();
            expect(createdGame.userActivity(userId)).toBe(PlayerActivity.AwaitingStart);
        });
    });
});
