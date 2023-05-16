const { makeGame, createStartedGame } = require("../../doubles/entities/makeGame");
const { FakeGameRepository } = require("../../doubles/repositories/FakeGameRepository");
const { FakeUserRepository } = require("../../doubles/repositories/FakeUserRepository");
const { PlayerNotifierSpy } = require("../../doubles/repositories/PlayerNotifierDoubles");
const { makeAddPlayerToGame } = require("../../doubles/usecases/addPlayerToGame/addPlayerToGameFactory");
const { GameAlreadyStarted } = require("../../src/entities/Game.Exceptions");
const { User } = require("../../src/entities/User");
const { GameNotFound } = require("../../src/repositories/GameRepositoryExceptions");
const { PlayerNotFound } = require("../../src/repositories/UserRepositoryExceptions");
const { JoinGame } = require("../../src/usecases/joinGame/JoinGame");
const { PlayerJoinedGame } = require("../../src/usecases/joinGame/PlayerJoinedGame");
const { repeat } = require("../../src/utils/iteration");
const { contract, isRequired, mustBeString } = require("../contracts");
/**
 * @template {string | undefined} ID
 * @typedef {import("../../src/entities/types").Game<ID>} Game
 */

/** @type {import("../../src/usecases/types").GameJoining} */
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

describe("contract", () => {
	contract("gameId", (name) => {
		isRequired(name, (gameId) => {
			return addPlayerToGame.joinGame(gameId, "playerId");
		});
		mustBeString(name, (gameId) => {
			return addPlayerToGame.joinGame(gameId, "playerId");
		});
	});
	contract("playerId", (name) => {
		isRequired(name, (playerId) => {
			return addPlayerToGame.joinGame("gameId", playerId);
		});
		mustBeString(name, (playerId) => {
			return addPlayerToGame.joinGame("gameId", playerId);
		});
	});
});

let unknownGameId = "unknown-game-id";
let unknownPlayerId = "unknown-player-id";

/** @type {string} */
let playerId;
beforeEach(async () => {
	playerId = (await userRepository.add(new User())).id;
});

/** @type {string} */
let unstartedGameId;
beforeEach(async () => {
	unstartedGameId = (await gameRepository.add(makeGame())).id;
});

describe("Preconditions", () => {
	describe("Game must exist", () => {
		test("Joining non-existent game fails", async () => {
			const action = addPlayerToGame.joinGame(unknownGameId, playerId);
			await expect(action).rejects.toThrow(GameNotFound);
		});
	});

	describe("Player must exist", () => {
		test("Joining game as an unknown player fails", async () => {
			const action = addPlayerToGame.joinGame(unstartedGameId, unknownPlayerId);
			await expect(action).rejects.toThrow(PlayerNotFound);
		});
	});

	describe("The game must not have stared", () => {
		test("Joining a game that has already started fails", async () => {
			const startedGame = createStartedGame({ includedPlayerIds: [playerId] });
			const startedGameId = (await gameRepository.add(startedGame)).id;

			const action = addPlayerToGame.joinGame(startedGameId, playerId);
			await expect(action).rejects.toThrow(GameAlreadyStarted);
		});
	});
});

describe("Postconditions", () => {
	describe("The player is added to the game", () => {
		test("Joining a game produces an event", async () => {
			const result = await addPlayerToGame.joinGame(unstartedGameId, playerId);

			expect(result).toBeInstanceOf(PlayerJoinedGame);
			expect(result).toHaveProperty("gameId", unstartedGameId);
			expect(result).toHaveProperty("addedPlayerId", playerId);
		});

		test("Joining the game again produces nothing", async () => {
			await addPlayerToGame.joinGame(unstartedGameId, playerId);

			const result = await addPlayerToGame.joinGame(unstartedGameId, playerId);

			expect(result).toBeUndefined();
		});
	});
});
