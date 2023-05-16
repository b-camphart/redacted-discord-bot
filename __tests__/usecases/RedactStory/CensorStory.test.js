const { makeGame, createStartedGame } = require("../../../doubles/entities/makeGame");
const { FakeGameRepository } = require("../../../doubles/repositories/FakeGameRepository");
const { GameNotStarted } = require("../../../src/entities/Game.Exceptions");
const {
	UnauthorizedStoryModification,
	StoryNotFound,
	IncorrectStoryModification,
} = require("../../../src/entities/Game.Story.Exceptions");
const { censorableWords } = require("../../../src/entities/Words");
const { GameNotFound } = require("../../../src/repositories/GameRepositoryExceptions");
const { IndexOutOfBounds } = require("../../../src/usecases/validation");
const { OutOfRange } = require("../../../src/validation/numbers");
const { isRequired, mustBeString, contract, mustBeNumber } = require("../../contracts");

/** @type {FakeGameRepository} */
let games;

beforeEach(() => {
	games = new FakeGameRepository();
});

const unknownGameId = "unknown-game-id";
const unincludedPlayerId = "unknown-player-id";
const playerIds = ["player-1", "player-2", "player-3", "player-4"];

/** @type {string} */
let unstartedGameId;
beforeEach(async () => {
	const game = makeGame({ userIds: playerIds });
	unstartedGameId = (await games.add(game)).id;
});

/** @type {import("../../../src/entities/types").Game<string>} */
let startedGame;
const initialStoryContent = "Some initial story content.";
const maxCensoredWordIndex = censorableWords(initialStoryContent).length - 1;
/** @type {number} */
let firstPlayerStoryIndex;
beforeEach(async () => {
	const game = createStartedGame({ includedPlayerIds: playerIds });
	firstPlayerStoryIndex = game.startStory(playerIds[0], initialStoryContent);
	startedGame = await games.add(game);
});

const unknownStoryIndex = 18;

describe("contract", () => {
	contract("gameId", (name) => {
		isRequired(name, (gameId) => {
			return censorStory(gameId, firstPlayerStoryIndex, playerIds[1], [0]);
		});
		mustBeString(name, (gameId) => {
			return censorStory(gameId, firstPlayerStoryIndex, playerIds[1], [0]);
		});
	});
	contract("storyIndex", (name) => {
		isRequired(name, (storyIndex) => {
			return censorStory(startedGame.id, storyIndex, playerIds[1], [0]);
		});
		mustBeNumber(name, (storyIndex) => {
			return censorStory(startedGame.id, storyIndex, playerIds[1], [0]);
		});
	});
	contract("playerId", (name) => {
		isRequired(name, (playerId) => {
			return censorStory(startedGame.id, firstPlayerStoryIndex, playerId, [0]);
		});
		mustBeString(name, (playerId) => {
			return censorStory(startedGame.id, firstPlayerStoryIndex, playerId, [0]);
		});
	});
	contract("wordIndices", (name) => {
		isRequired(name, (wordIndices) => {
			return censorStory(startedGame.id, firstPlayerStoryIndex, playerIds[1], wordIndices);
		});
		describe("must be an array of numbers", () => {
			[
				["empty string", ""],
				["object", {}],
				["number", 12],
				["boolean", true],
				["array of string", [""]],
				["array with string", [1, 2, "16"]],
			].forEach(([name, wordIndices]) => {
				it(`rejects ${name}`, async () => {
					const action = censorStory(startedGame.id, firstPlayerStoryIndex, playerIds[1], wordIndices);
					const rejection = expect(action).rejects;
					await rejection.toThrow(TypeError);
				});
			});
		});
		it("must have at least one number", async () => {
			const action = censorStory(startedGame.id, firstPlayerStoryIndex, playerIds[1], []);
			const rejection = expect(action).rejects;
			await rejection.toThrow(OutOfRange);
			await rejection.toThrow("length of wordIndices <0> must be greater than 0.");
		});
		it("must have at most three numbers", async () => {
			const action = censorStory(startedGame.id, firstPlayerStoryIndex, playerIds[1], [0, 0, 0, 0]);
			const rejection = expect(action).rejects;
			await rejection.toThrow(OutOfRange);
			await rejection.toThrow("length of wordIndices <4> must be less than or equal to 3.");
		});
		it("must have no more censors than there are censorable words", async () => {
			const storyIndex = startedGame.startStory(playerIds[1], "Short content.");
			const action = censorStory(startedGame.id, storyIndex, playerIds[2], [0, 1]);
			const rejection = expect(action).rejects;
			await rejection.toThrow(OutOfRange);
		});
		describe("must not contain numbers out of range of the available censorable words", () => {
			it("does not accept negative values", async () => {
				const action = censorStory(startedGame.id, firstPlayerStoryIndex, playerIds[1], [-1]);
				const rejection = expect(action).rejects;
				await rejection.toThrow(IndexOutOfBounds);
			});
			it("does not accept values over the number of censorable words", async () => {
				const action = censorStory(startedGame.id, firstPlayerStoryIndex, playerIds[1], [
					maxCensoredWordIndex + 1,
				]);
				const rejection = expect(action).rejects;
				await rejection.toThrow(IndexOutOfBounds);
			});
		});
	});
});

describe("Preconditions", () => {
	describe("Game must exist", () => {
		test("Censoring a story in a non-existant game fails", async () => {
			const action = censorStory(unknownGameId, firstPlayerStoryIndex, "", [0]);
			await expect(action).rejects.toThrow(GameNotFound);
			await expect(action).rejects.toHaveProperty("gameId", unknownGameId);
		});
	});
	describe("The game must have been started", () => {
		test("Censoring a story in a game that has not started fails", async () => {
			const action = censorStory(unstartedGameId, firstPlayerStoryIndex, playerIds[1], [0]);
			await expect(action).rejects.toThrow(GameNotStarted);
		});
	});
	describe("The story must exist in the game", () => {
		test("Censoring a non-existant story in the game fails", async () => {
			const action = censorStory(startedGame.id, unknownStoryIndex, playerIds[1], [0]);
			await expect(action).rejects.toThrow(StoryNotFound);
		});
	});
	describe("Player must be in the game", () => {
		test("Censoring a story as a player that hasn't joined the game fails", async () => {
			const action = censorStory(startedGame.id, firstPlayerStoryIndex, unincludedPlayerId, [0]);
			await expect(action).rejects.toThrow(UnauthorizedStoryModification);
		});
	});
	describe("Player must be assigned to the story", () => {
		test("Censoring a story assiged to a different player fails", async () => {
			const action = censorStory(startedGame.id, firstPlayerStoryIndex, playerIds[2], [0]);
			await expect(action).rejects.toThrow(UnauthorizedStoryModification);
		});
		test("Censoring a story that has finished fails", async () => {
			const game = createStartedGame({ includedPlayerIds: playerIds, maxStoryEntries: 1 });
			game.startStory(playerIds[0], initialStoryContent);
			game.censorStory(playerIds[1], firstPlayerStoryIndex, [1]);
			game.repairStory(playerIds[2], firstPlayerStoryIndex, ["replacement"]);
			const gameId = (await games.add(game)).id;

			const action = censorStory(gameId, firstPlayerStoryIndex, playerIds[3], [0]);
			await expect(action).rejects.toThrow(UnauthorizedStoryModification);
		});
	});
	describe("The story must be ready to be redacted", () => {
		const Redactions = require("./Redactions");
		Object.entries(Redactions).forEach(([redactionName, redaction]) => {
			test(`Censoring a story that has had ${redactionName} applied, fails`, async () => {
				redaction.redact(startedGame, playerIds[1], firstPlayerStoryIndex);

				const action = censorStory(startedGame.id, firstPlayerStoryIndex, playerIds[2], [0]);
				await expect(action).rejects.toThrow(IncorrectStoryModification);
			});
			test(`Censoring a story that has had ${redactionName} applied and repaired, fails`, async () => {
				redaction.redact(startedGame, playerIds[1], firstPlayerStoryIndex);
				redaction.repair(startedGame, playerIds[2], firstPlayerStoryIndex);

				const action = censorStory(startedGame.id, firstPlayerStoryIndex, playerIds[3], [0]);
				await expect(action).rejects.toThrow(IncorrectStoryModification);
			});
		});
	});
});

describe("Postconditions", () => {
	describe("The story is censored", () => {
		test("Censoring a story produces an event", async () => {
			const storyCensored = await censorStory(startedGame.id, firstPlayerStoryIndex, playerIds[1], [1, 3]);
			expect(storyCensored.gameId).toBe(startedGame.id);
			expect(storyCensored.censoredBy).toBe(playerIds[1]);
			expect(storyCensored.storyIndex).toBe(0);
			expect(storyCensored.censoredContent).not.toBe(initialStoryContent);
			expect(storyCensored.censoredContent).toBe("Some _______ story _______.");
			expect(storyCensored.censorBounds).toHaveLength(2);
		});
	});
	describe("The game is persisted", () => {
		test("Censoring the same story twice fails", async () => {
			await censorStory(startedGame.id, firstPlayerStoryIndex, playerIds[1], [1, 3]);

			const action = censorStory(startedGame.id, firstPlayerStoryIndex, playerIds[1], [1, 3]);
			expect(action).rejects.toThrow(UnauthorizedStoryModification);
		});
	});
	describe("The next player is assigned to the story", () => {
		test("The story can be repaired by the next player", async () => {
			const storyCensored = await censorStory(startedGame.id, firstPlayerStoryIndex, playerIds[1], [1, 3]);
			await repairStory(storyCensored.gameId, playerIds[2], storyCensored.storyIndex, ["word1", "word2"]);
		});
	});
});

const context = { games: () => games };
const repairStory = require("../../../doubles/usecases/repair/censoredStory").make(context);
const censorStory = require("../../../doubles/usecases/censorStory").makeCensorStory(context);
