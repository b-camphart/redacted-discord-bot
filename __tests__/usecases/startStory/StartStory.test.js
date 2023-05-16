const { makeGame } = require("../../../doubles/entities/makeGame");
const { FakeGameRepository } = require("../../../doubles/repositories/FakeGameRepository");
const { DumbPlayerNotifier } = require("../../../doubles/repositories/PlayerNotifierDoubles");
const { DumbSubscribedPlayerRepository } = require("../../../doubles/repositories/SubscribedPlayerRepositoryDoubles");
const {
	UnauthorizedGameModification,
	GameNotStarted,
	ConflictingStory,
} = require("../../../src/entities/Game.Exceptions");
const { InvalidWordCount } = require("../../../src/entities/Game.Story.Exceptions");
const { GameNotFound } = require("../../../src/repositories/GameRepositoryExceptions");
const { StartStory } = require("../../../src/usecases/startStory/StartStory");
const { OutOfRange } = require("../../../src/validation/numbers");
const { MustNotBeBlank } = require("../../../src/validation/strings");
const { contract, isRequired, mustBeString } = require("../../contracts");

describe("Start Story", () => {
	/** @type {StartStory} */
	let startStory;
	/** @type {FakeGameRepository} */
	let gameRepository;

	beforeEach(() => {
		gameRepository = new FakeGameRepository();
		startStory = makeStartStory(gameRepository);
	});

	describe("contract", () => {
		contract("gameId", (name) => {
			isRequired(name, () => {
				// @ts-ignore
				return startStory.startStory();
			});
			mustBeString(name, (gameId) => {
				// @ts-ignore
				return startStory.startStory(gameId);
			});
		});
		contract("playerId", (name) => {
			isRequired(name, () => {
				// @ts-ignore
				return startStory.startStory("game-id");
			});
			mustBeString(name, (playerId) => {
				// @ts-ignore
				return startStory.startStory("game-id", playerId);
			});
		});
		contract("content", (name) => {
			isRequired(name, () => {
				// @ts-ignore
				return startStory.startStory("game-id", "player-id");
			});
			mustBeString(name, (content) => {
				// @ts-ignore
				return startStory.startStory("game-id", "player-id", content);
			});

			it.each([[""], ["  "], ["\n\r\r\n"]])("the content must not be blank", async (content) => {
				const action = startStory.startStory("game-id", "player-id", content);
				await expect(action).rejects.toThrow(MustNotBeBlank);
			});

			it("the content must not be greater than 256 characters", async () => {
				let content = "";
				for (let i = 0; i < 257; i++) content += "a";

				const action = startStory.startStory("game-id", "player-id", content);
				await expect(action).rejects.toThrow(OutOfRange);
			});

			it("must have at least two censorable words", async () => {
				const action = startStory.startStory("game-id", "player-id", "one");
				await expect(action).rejects.toThrow(InvalidWordCount);
			});
		});
	});

	test("game must exist", async () => {
		const action = startStory.startStory("unknown-game-id", "player-id", "initial content");
		await expect(action).rejects.toThrow(GameNotFound);
	});

	describe("given the game exists", () => {
		/** @type {import("../../../src/entities/types").GameWithId} */
		let game;
		/**
		 *
		 * @param {string} playerId
		 * @param {string} content
		 */
		const startStoryInGame = (playerId, content) => {
			return startStory.startStory(game.id, playerId, content);
		};

		beforeEach(async () => {
			game = await gameRepository.add(makeGame());
		});

		test("the player must be in the game", async () => {
			const action = startStoryInGame("unknown-player-id", "initial content");
			await expect(action).rejects.toThrow(UnauthorizedGameModification);
		});

		describe("given the player is in the game", () => {
			/** @type {string} */
			let playerId;
			beforeEach(() => {
				for (let i = 0; i < 4; i++) game.addPlayer(`player-${i + 1}`);
				playerId = "player-2";
			});
			/**
			 *
			 * @param {string} content
			 */
			const playerStartsStoryInGame = (content) => {
				return startStoryInGame(playerId, content);
			};

			test("the game must have been started", async () => {
				const action = playerStartsStoryInGame("initial content");
				await expect(action).rejects.toThrow(GameNotStarted);
			});

			describe("given the game has been started", () => {
				beforeEach(() => {
					game.start();
				});

				test("the story is started", async () => {
					const storyStarted = await playerStartsStoryInGame("Some content");
					if (storyStarted == null) throw new Error("Expected to receive story started event.");
					expect(storyStarted.gameId).toBe(game.id);
					expect(storyStarted.startedBy).toBe(playerId);
					expect(storyStarted.storyIndex).toBe(0);
					expect(storyStarted.content).toBe("Some content");
				});

				describe("given the player has started their story", () => {
					beforeEach(async () => {
						await playerStartsStoryInGame("Some content");
					});

					test("the next player's story has the next index", async () => {
						const storyStarted = await startStory.startStory(game.id, "player-3", "Initial content.");
						if (storyStarted == null) throw new Error("Expected to receive story started event.");
						expect(storyStarted.storyIndex).toBe(1);
					});

					test("the player may not start another story", async () => {
						const action = playerStartsStoryInGame("Some content");
						await expect(action).rejects.toThrow(ConflictingStory);
					});
				});
			});
		});
	});
});

/**
 *
 * @param {import("../../../src/repositories/GameRepository").UpdateGameRepository} gameRepository
 * @returns {StartStory}
 */
const makeStartStory = (gameRepository = new FakeGameRepository()) => {
	return new StartStory(gameRepository, new DumbSubscribedPlayerRepository(), new DumbPlayerNotifier());
};

exports.makeStartStory = makeStartStory;
