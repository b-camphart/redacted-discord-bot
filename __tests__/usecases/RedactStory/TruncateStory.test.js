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
const { range } = require("../../../src/utils/range");
const { OutOfRange } = require("../../../src/validation/numbers");
const { contract, isRequired, mustBeString, mustBeNumber } = require("../../contracts");

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
const censorableWordCount = censorableWords(initialStoryContent).length;
const maxTruncationCount = Math.max(7, censorableWordCount - 1);
const minTruncationCount = 1;
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
			return truncateStory(gameId, firstPlayerStoryIndex, playerIds[1], maxTruncationCount);
		});
		mustBeString(name, (gameId) => {
			return truncateStory(gameId, firstPlayerStoryIndex, playerIds[1], maxTruncationCount);
		});
	});
	contract("storyIndex", (name) => {
		isRequired(name, (storyIndex) => {
			return truncateStory(startedGame.id, storyIndex, playerIds[1], maxTruncationCount);
		});
		mustBeNumber(name, (storyIndex) => {
			return truncateStory(startedGame.id, storyIndex, playerIds[1], maxTruncationCount);
		});
	});
	contract("playerId", (name) => {
		isRequired(name, (playerId) => {
			return truncateStory(startedGame.id, firstPlayerStoryIndex, playerId, maxTruncationCount);
		});
		mustBeString(name, (playerId) => {
			return truncateStory(startedGame.id, firstPlayerStoryIndex, playerId, maxTruncationCount);
		});
	});
	contract("truncationCount", (name) => {
		isRequired(name, (truncationCount) => {
			return truncateStory(startedGame.id, firstPlayerStoryIndex, playerIds[1], truncationCount);
		});
		mustBeNumber(name, (truncationCount) => {
			return truncateStory(startedGame.id, firstPlayerStoryIndex, playerIds[1], truncationCount);
		});
		it("must be greater than 0", async () => {
			const action = truncateStory(startedGame.id, firstPlayerStoryIndex, playerIds[1], 0);
			await expect(action).rejects.toThrow(OutOfRange);
			await expect(action).rejects.toThrow("truncationCount <0> must be greater than 0.");
		});
		it("must be less than 7", async () => {
			const action = truncateStory(startedGame.id, firstPlayerStoryIndex, playerIds[1], 8);
			await expect(action).rejects.toThrow(OutOfRange);
			await expect(action).rejects.toThrow("truncationCount <8> must be less than or equal to 7.");
		});
		it("must be less than the number of available, censorable words", async () => {
			const action = truncateStory(startedGame.id, firstPlayerStoryIndex, playerIds[1], censorableWordCount);
			await expect(action).rejects.toThrow(IndexOutOfBounds);
		});
	});
});

describe("Preconditions", () => {
	describe("Game must exist", () => {
		test("Truncating a story in a non-existant game fails", async () => {
			const action = truncateStory(unknownGameId, firstPlayerStoryIndex, "", minTruncationCount);
			await expect(action).rejects.toThrow(GameNotFound);
			await expect(action).rejects.toHaveProperty("gameId", unknownGameId);
		});
	});
	describe("The game must have been started", () => {
		test("Truncating a story in a game that has not started fails", async () => {
			const action = truncateStory(unstartedGameId, firstPlayerStoryIndex, playerIds[1], minTruncationCount);
			await expect(action).rejects.toThrow(GameNotStarted);
		});
	});
	describe("The story must exist in the game", () => {
		test("Truncating a non-existant story in the game fails", async () => {
			const action = truncateStory(startedGame.id, unknownStoryIndex, playerIds[1], minTruncationCount);
			await expect(action).rejects.toThrow(StoryNotFound);
		});
	});
	describe("Player must be in the game", () => {
		test("Truncating a story as a player that hasn't joined the game fails", async () => {
			const action = truncateStory(startedGame.id, firstPlayerStoryIndex, unincludedPlayerId, minTruncationCount);
			await expect(action).rejects.toThrow(UnauthorizedStoryModification);
		});
	});
	describe("Player must be assigned to the story", () => {
		test("Truncating a story assiged to a different player fails", async () => {
			const action = truncateStory(startedGame.id, firstPlayerStoryIndex, playerIds[2], minTruncationCount);
			await expect(action).rejects.toThrow(UnauthorizedStoryModification);
		});
		test("Truncating a story that has finished fails", async () => {
			const game = createStartedGame({ includedPlayerIds: playerIds, maxStoryEntries: 1 });
			game.startStory(playerIds[0], initialStoryContent);
			game.censorStory(playerIds[1], firstPlayerStoryIndex, [1]);
			game.repairStory(playerIds[2], firstPlayerStoryIndex, ["replacement"]);
			const gameId = (await games.add(game)).id;

			const action = truncateStory(gameId, firstPlayerStoryIndex, playerIds[3], minTruncationCount);
			await expect(action).rejects.toThrow(UnauthorizedStoryModification);
		});
	});
	describe("The story must be ready to be redacted", () => {
		const Redactions = require("./Redactions");
		Object.entries(Redactions).forEach(([redactionName, redaction]) => {
			test(`Truncating a story that has had ${redactionName} applied, fails`, async () => {
				redaction.redact(startedGame, playerIds[1], firstPlayerStoryIndex);

				const action = truncateStory(startedGame.id, firstPlayerStoryIndex, playerIds[2], minTruncationCount);
				await expect(action).rejects.toThrow(IncorrectStoryModification);
			});
			test(`Truncating a story that has had ${redactionName} applied and repaired, fails`, async () => {
				redaction.redact(startedGame, playerIds[1], firstPlayerStoryIndex);
				redaction.repair(startedGame, playerIds[2], firstPlayerStoryIndex);

				const action = truncateStory(startedGame.id, firstPlayerStoryIndex, playerIds[3], minTruncationCount);
				await expect(action).rejects.toThrow(IncorrectStoryModification);
			});
		});
	});
});

describe("Postconditions", () => {
	describe("The story is truncated", () => {
		test("Truncating a story produces an event", async () => {
			const storyCensored = await truncateStory(startedGame.id, firstPlayerStoryIndex, playerIds[1], 2);
			expect(storyCensored.gameId).toBe(startedGame.id);
			expect(storyCensored.truncatedBy).toBe(playerIds[1]);
			expect(storyCensored.storyIndex).toBe(0);
			expect(storyCensored.truncatedContent).not.toBe(initialStoryContent);
			expect(storyCensored.truncatedContent).toBe("Some initial ______________");
			expect(storyCensored.truncationBounds).toEqual(range(13, 27));
		});
	});
	describe("The game is persisted", () => {
		test("Truncating the same story twice fails", async () => {
			await truncateStory(startedGame.id, firstPlayerStoryIndex, playerIds[1], minTruncationCount);

			const action = truncateStory(startedGame.id, firstPlayerStoryIndex, playerIds[1], minTruncationCount);
			expect(action).rejects.toThrow(UnauthorizedStoryModification);
		});
	});
	describe("The next player is assigned to the story", () => {
		test("The story can be repaired by the next player", async () => {
			const storyCensored = await truncateStory(
				startedGame.id,
				firstPlayerStoryIndex,
				playerIds[1],
				minTruncationCount
			);
			await repairTruncation(
				storyCensored.gameId,
				playerIds[2],
				storyCensored.storyIndex,
				"newly written conten."
			);
		});
	});
});

const context = { games: () => games };
const truncateStory = require("../../../doubles/usecases/truncateStory").makeTruncateStory(context);
const repairTruncation = require("../../../doubles/usecases/repair/truncatedStory").make(context);
