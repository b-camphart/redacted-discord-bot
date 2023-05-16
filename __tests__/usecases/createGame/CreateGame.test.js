const { PlayerNotFound } = require("../../../src/repositories/UserRepositoryExceptions");
const { FakeUserRepository } = require("../../../doubles/repositories/FakeUserRepository");
const { makeCreateGame } = require("../../../doubles/usecases/createGame/createGameFactory");
const { User } = require("../../../src/entities/User");
const { FakeGameRepository } = require("../../../doubles/repositories/FakeGameRepository");
const { AwaitingGameStart } = require("../../../src/entities/playerActivities");
const { GameCreated } = require("../../../src/usecases/createGame/GameCreated");
const { isRequired, mustBeString, contract } = require("../../contracts");

describe("CreateGame", () => {
	const users = new FakeUserRepository();
	const games = new FakeGameRepository();
	const createGame = makeCreateGame(users, games);

	describe("contract", () => {
		contract("userId", (name) => {
			isRequired(name, () => {
				// @ts-ignore
				return createGame.createGame();
			});
			mustBeString(name, (userId) => {
				// @ts-ignore
				return createGame.createGame(userId);
			});
		});
	});

	test("user must exist", async () => {
		const userId = "123456";
		const action = createGame.createGame(userId);
		await expect(action).rejects.toThrow(PlayerNotFound);
		await expect(action).rejects.toHaveProperty("playerId", userId);
	});

	describe("given user exists", () => {
		/** @type {string} */
		let userId;
		/** @type {GameCreated} */
		let gameCreated;

		beforeEach(async () => {
			userId = (await users.add(new User())).id || fail();
			gameCreated = await createGame.createGame(userId);
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
			expect(createdGame.isStarted).toBe(false);
		});

		test("user is added to game", async () => {
			const createdGame = (await games.get(gameCreated.gameId)) || fail();
			expect(createdGame.hasPlayer(userId)).toStrictEqual(true);
		});

		test("user is waiting for the game to start", async () => {
			const createdGame = (await games.get(gameCreated.gameId)) || fail();
			expect(createdGame.playerActivity(userId)).toBe(AwaitingGameStart);
		});
	});
});