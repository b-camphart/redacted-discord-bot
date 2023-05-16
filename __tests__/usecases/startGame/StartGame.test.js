const { makeGame } = require("../../../doubles/entities/makeGame");
const { FakeGameRepository } = require("../../../doubles/repositories/FakeGameRepository");
const { PlayerNotifierSpy } = require("../../../doubles/repositories/PlayerNotifierDoubles");
const { DumbSubscribedPlayerRepository } = require("../../../doubles/repositories/SubscribedPlayerRepositoryDoubles");
const { UnauthorizedGameModification, InsufficientPlayers } = require("../../../src/entities/Game.Exceptions");
const { GameNotFound } = require("../../../src/repositories/GameRepositoryExceptions");
const { GameStarted } = require("../../../src/usecases/startGame/GameStarted");
const { StartGame } = require("../../../src/usecases/startGame/StartGame");
const { NotEnoughPlayersToStartGame } = require("../../../src/usecases/startGame/validation");
const { contract, isRequired, mustBeString } = require("../../contracts");

/** @type {FakeGameRepository} */
let gameRepository;
/** @type {PlayerNotifierSpy} */
let playerNotifierSpy;

beforeEach(() => {
	gameRepository = new FakeGameRepository();
	playerNotifierSpy = new PlayerNotifierSpy();
});

describe("contract", () => {
	contract("gameId", (name) => {
		isRequired(name, (gameId) => {
			return startGame(gameId, "");
		});
		mustBeString(name, (gameId) => {
			return startGame(gameId, "");
		});
	});
	contract("playerId", (name) => {
		isRequired(name, (playerId) => {
			return startGame("game-id", playerId);
		});
		mustBeString(name, (playerId) => {
			return startGame("game-id", playerId);
		});
	});
});

test("game must exist", async () => {
	const action = startGame("unknown-game-id", "player-id");
	await expect(action).rejects.toThrow(GameNotFound);
});

describe("given the game exists", () => {
	/** @type {import("../../../src/entities/types").Game<string>} */
	let game;
	beforeEach(async () => {
		game = await gameRepository.add(makeGame());
	});

	test("the player must be in the game", async () => {
		const action = startGame(game.id, "unknown-player-id");
		await expect(action).rejects.toThrow(UnauthorizedGameModification);
	});

	describe("given the player is in the game", () => {
		/** @type {string} */
		const playerId = "player-1";
		beforeEach(() => {
			game.addPlayer(playerId);
		});

		test("game must have at least 4 players", async () => {
			game.addPlayer("player-2");
			game.addPlayer("player-3");

			const action = startGame(game.id, playerId);
			await expect(action).rejects.toThrow(InsufficientPlayers);
		});

		describe("given 4 players are in the game", () => {
			beforeEach(async () => {
				for (let i = 0; i < 3; i++) {
					game.addPlayer(`player-${i + 2}`);
				}
			});

			test("the game is started", async () => {
				const result = await startGame(game.id, playerId);
				expect(result).toBeInstanceOf(GameStarted);
				expect(result).toHaveProperty("gameId", game.id);
				expect(result).toHaveProperty("startedBy", playerId);
			});

			describe("given the game was already started", () => {
				beforeEach(async () => {
					await startGame(game.id, playerId);
				});

				test("the game cannot be started twice", async () => {
					const result = await startGame(game.id, playerId);
					expect(result).toBeUndefined();
				});
			});
		});
	});
});

/**
 *
 * @param {any} [gameId]
 * @param {any} [playerId]
 * @param {any} [maxEntries]
 * @returns
 */
function startGame(gameId, playerId, maxEntries) {
	const useCase = new StartGame(gameRepository, new DumbSubscribedPlayerRepository(), playerNotifierSpy);
	return useCase.startGame(gameId, playerId, maxEntries);
}
