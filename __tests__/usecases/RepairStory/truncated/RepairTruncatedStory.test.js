const { makeGame, createStartedGame } = require("../../../../doubles/entities/makeGame");
const { FakeGameRepository } = require("../../../../doubles/repositories/FakeGameRepository");
const { UnauthorizedGameModification, GameNotStarted } = require("../../../../src/entities/Game.Exceptions");
const {
	UnauthorizedStoryModification,
	StoryNotFound,
	IncorrectStoryModification,
} = require("../../../../src/entities/Game.Story.Exceptions");
const { StoryStatus } = require("../../../../src/entities/Game.Story.Status");
const PlayerActivity = require("../../../../src/entities/playerActivities");
const { GameNotFound } = require("../../../../src/repositories/GameRepositoryExceptions");
const { contract, isRequired, mustBeString, mustBeNumber } = require("../../../contracts");

/** @type {FakeGameRepository} */
let games;

beforeEach(() => {
	games = new FakeGameRepository();
});

const playerIds = ["player-1", "player-2", "player-3", "player-4"];
const notIncludedPlayerId = "player-18";
/** @type {import("../../../../src/entities/types").Game<string>} */
let game;
/** @type {import("../../../../src/entities/types").Game<string>} */
let unstartedGame;
/** @type {number} */
let truncatedStoryIndex;
const initialContent = "Some initial story content.";
/** @type {string} */
let repairingPlayerId;
/** @type {string} */
let nextPlayerId;
/** @type {string} "replacement content" */
let replacement;
beforeEach(async () => {
	unstartedGame = await games.add(makeGame({ userIds: playerIds }));
	game = await games.add(createStartedGame({ includedPlayerIds: playerIds }));
	truncatedStoryIndex = game.startStory(playerIds[0], initialContent);
	game.truncateStory(playerIds[1], truncatedStoryIndex, 2);
	repairingPlayerId = playerIds[2];
	nextPlayerId = playerIds[3];
	replacement = "replacement content";
});
const nonExistentStoryId = 5;

describe("inputs", () => {
	contract("gameId", (name) => {
		isRequired(name, (gameId) => {
			return repairTruncatedStory(gameId, repairingPlayerId, truncatedStoryIndex, replacement);
		});
		mustBeString(name, (gameId) => {
			return repairTruncatedStory(gameId, repairingPlayerId, truncatedStoryIndex, replacement);
		});
	});
	contract("playerId", (name) => {
		isRequired(name, (playerId) => {
			return repairTruncatedStory(game.id, playerId, truncatedStoryIndex, replacement);
		});
		mustBeString(name, (playerId) => {
			return repairTruncatedStory(game.id, playerId, truncatedStoryIndex, replacement);
		});
	});
	contract("storyIndex", (name) => {
		isRequired(name, (storyIndex) => {
			return repairTruncatedStory(game.id, repairingPlayerId, storyIndex, replacement);
		});
		mustBeNumber(name, (storyIndex) => {
			return repairTruncatedStory(game.id, repairingPlayerId, storyIndex, replacement);
		});
	});
});

describe("Preconditions", () => {
	describe("the game must exist", () => {
		test("fails to repair a story in a non-existent game", async () => {
			const nonExistentGameId = "unknown-game-id";
			const action = repairTruncatedStory(nonExistentGameId, repairingPlayerId, truncatedStoryIndex, replacement);
			await expect(action).rejects.toThrow(GameNotFound);
		});
	});
	describe("the player must be in the game", () => {
		test("player not in game fails to repair a story", async () => {
			const action = repairTruncatedStory(game.id, notIncludedPlayerId, truncatedStoryIndex, replacement);
			await expect(action).rejects.toThrow(UnauthorizedStoryModification);
		});
	});
	describe("the game must have been started", () => {
		test("player in story fails to repair a story in a game that hasn't been started", async () => {
			const action = repairTruncatedStory(unstartedGame.id, repairingPlayerId, truncatedStoryIndex, replacement);
			await expect(action).rejects.toThrow(GameNotStarted);
		});
	});
	describe("the story must exist", () => {
		test("player in story fails to repair a story that doesn't exist", async () => {
			const action = repairTruncatedStory(game.id, repairingPlayerId, nonExistentStoryId, replacement);
			await expect(action).rejects.toThrow(StoryNotFound);
		});
	});
	describe("the player must be assigned to the story", () => {
		test("player in story fails to repair a story not assigned to them", async () => {
			const unassignedCensoredStoryIndex = game.startStory(playerIds[1], "Some initial story content.");
			game.censorStory(playerIds[2], unassignedCensoredStoryIndex, [1, 3]);
			const action = repairTruncatedStory(game.id, repairingPlayerId, unassignedCensoredStoryIndex, replacement);
			await expect(action).rejects.toThrow(UnauthorizedStoryModification);
		});
		test("player in story fails to repair an assigned story that has ended", async () => {
			const shortGame = createStartedGame({ includedPlayerIds: playerIds, maxStoryEntries: 1 });
			const storyIndex = shortGame.startStory(playerIds[1], "Some initial story content.");
			shortGame.truncateStory(playerIds[2], storyIndex, 2);
			shortGame.repairTruncatedStory(playerIds[3], storyIndex, replacement);
			await games.add(shortGame);

			const action = repairTruncatedStory(shortGame.id, playerIds[0], storyIndex, replacement);
			await expect(action).rejects.toThrow(UnauthorizedStoryModification);
		});
	});
	describe("the story must be ready to be repaired", () => {
		test("player in story fails to repair an assigned story that is being redacted", async () => {
			const storyIndex = game.startStory(playerIds[1], "Some initial story content.");
			const action = repairTruncatedStory(game.id, playerIds[2], storyIndex, replacement);
			await expect(action).rejects.toThrow(IncorrectStoryModification);
		});
		test("player in story fails to repair an assigned story that is being continued", async () => {
			const storyIndex = game.startStory(playerIds[1], "Some initial story content.");
			game.truncateStory(playerIds[2], storyIndex, 2);
			game.repairTruncatedStory(playerIds[3], storyIndex, replacement);
			const action = repairTruncatedStory(game.id, playerIds[0], storyIndex, replacement);
			await expect(action).rejects.toThrow(IncorrectStoryModification);
		});
	});
	describe("the story must have been truncated", () => {
		test("player in story fails to repair an assigned story that was censored", async () => {
			const storyIndex = game.startStory(playerIds[1], "Some initial story content.");
			game.censorStory(playerIds[2], storyIndex, [2]);
			const action = repairTruncatedStory(game.id, playerIds[3], storyIndex, replacement);
			await expect(action).rejects.toThrow(IncorrectStoryModification);
		});
	});
});

describe("Postconditions", () => {
	/** @type {UseCases.TruncatedStoryRepaired} */
	let result;
	beforeEach(async () => {
		result = await repairTruncatedStory(game.id, repairingPlayerId, truncatedStoryIndex, replacement);
	});
	describe("the truncated words in the story entry are replaced by the supplied replacement", () => {
		test("return value contains repaired content", () => {
			expect(result.repairedContent).not.toBe(initialContent);
			expect(result.repairedContent).toBe("Some initial replacement content");
		});
	});
	describe("the next player in the game is assigned to the story", () => {
		test("the player fails to continue the story", async () => {
			const action = continueStory(game.id, repairingPlayerId, truncatedStoryIndex, "Some new content");
			expect(action).rejects.toThrow(UnauthorizedStoryModification);
		});
	});
	describe("the story is ready to be continued", () => {
		test("the next player can continue the story", async () => {
			await continueStory(game.id, nextPlayerId, truncatedStoryIndex, "Some new content");
		});
	});
});

describe("Alternate paths", () => {
	describe("the final story entry has been repaired", () => {
		describe("the story is complete", () => {
			test("the next player cannot continue the story", async () => {
				const shortGame = createStartedGame({ includedPlayerIds: playerIds, maxStoryEntries: 1 });
				const storyIndex = shortGame.startStory(playerIds[0], "Some initial story content.");
				shortGame.truncateStory(playerIds[1], storyIndex, 2);
				await games.add(shortGame);
				await repairTruncatedStory(shortGame.id, playerIds[2], storyIndex, replacement);

				const action = continueStory(shortGame.id, playerIds[3], storyIndex, "Some new content");
				await expect(action).rejects.toThrow();
			});
		});
	});
});

const repairTruncatedStory = require("../../../../doubles/usecases").make.repairTruncatedStory({
	games: () => games,
});
const continueStory = require("../../../../doubles/usecases/index").make.continueStory({
	games: () => games,
});
