const { makeGame, createStartedGame } = require("../../../../doubles/entities/makeGame");
const { FakeGameRepository } = require("../../../../doubles/repositories/FakeGameRepository");
const PlayerActivity = require("../../../../src/entities/playerActivities");
const { StoryStatus } = require("../../../../src/entities/Game.Story.Status");
const { GameNotFound } = require("../../../../src/repositories/GameRepositoryExceptions");
const { MustHaveLength } = require("../../../../src/usecases/validation");
const { contract, isRequired, mustBeString, mustBeNumber, mustBeArray } = require("../../../contracts");
const { UnauthorizedGameModification, GameNotStarted } = require("../../../../src/entities/Game.Exceptions");
const {
	UnauthorizedStoryModification,
	StoryNotFound,
	IncorrectStoryModification,
	InvalidWordCount,
} = require("../../../../src/entities/Game.Story.Exceptions");
const { MustNotBeBlank } = require("../../../../src/validation/strings");
const { OutOfRange } = require("../../../../src/validation/numbers");

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
let censoredStoryIndex;
const initialContent = "Some initial story content.";
/** @type {string} */
let repairingPlayerId;
/** @type {string} */
let nextPlayerId;
/** @type {string[]} ["replacement1", "replacement2"] */
let replacementWords;
beforeEach(async () => {
	unstartedGame = await games.add(makeGame({ userIds: playerIds }));
	game = await games.add(createStartedGame({ includedPlayerIds: playerIds }));
	censoredStoryIndex = game.startStory(playerIds[0], initialContent);
	game.censorStory(playerIds[1], censoredStoryIndex, [1, 3]);
	repairingPlayerId = playerIds[2];
	nextPlayerId = playerIds[3];
	replacementWords = ["replacement1", "replacement2"];
});
const nonExistentStoryId = 5;

describe("inputs", () => {
	contract("gameId", (name) => {
		isRequired(name, (gameId) => {
			return repairCensoredStory(gameId, repairingPlayerId, censoredStoryIndex, replacementWords);
		});
		mustBeString(name, (gameId) => {
			return repairCensoredStory(gameId, repairingPlayerId, censoredStoryIndex, replacementWords);
		});
	});
	contract("playerId", (name) => {
		isRequired(name, (playerId) => {
			return repairCensoredStory(game.id, playerId, censoredStoryIndex, replacementWords);
		});
		mustBeString(name, (playerId) => {
			return repairCensoredStory(game.id, playerId, censoredStoryIndex, replacementWords);
		});
	});
	contract("storyIndex", (name) => {
		isRequired(name, (storyIndex) => {
			return repairCensoredStory(game.id, repairingPlayerId, storyIndex, replacementWords);
		});
		mustBeNumber(name, (storyIndex) => {
			return repairCensoredStory(game.id, repairingPlayerId, storyIndex, replacementWords);
		});
	});
	contract("replacements", (name) => {
		isRequired(name, (replacements) => {
			return repairCensoredStory(game.id, repairingPlayerId, censoredStoryIndex, replacements);
		});
		mustBeArray(name, (replacements) => {
			return repairCensoredStory(game.id, repairingPlayerId, censoredStoryIndex, replacements);
		});
		describe("each replacement", () => {
			mustBeString("each replacement", (nonString) => {
				return repairCensoredStory(game.id, repairingPlayerId, censoredStoryIndex, [nonString, nonString]);
			});
			describe("must be exactly one word", () => {
				["", "      ", "\t\n"].forEach((whitespace) => {
					test("whitespace is rejected", async () => {
						const action = repairCensoredStory(game.id, repairingPlayerId, censoredStoryIndex, [
							whitespace,
							whitespace,
						]);
						await expect(action).rejects.toThrow(MustNotBeBlank);
					});
				});
				["  word", "word    "].forEach((exactlyOneWord) => {
					test("trailing whitespace is filtered out", async () => {
						const result = await repairCensoredStory(game.id, repairingPlayerId, censoredStoryIndex, [
							exactlyOneWord,
							exactlyOneWord,
						]);
						expect(result.repairedContent).not.toBe(initialContent);
						expect(result.repairedContent).toBe("Some word story word.");
					});
				});
				test("more than two words is rejected", async () => {
					const action = repairCensoredStory(game.id, repairingPlayerId, censoredStoryIndex, [
						"two words",
						"too many",
					]);
					await expect(action).rejects.toThrow(InvalidWordCount);
				});
			});
			it("must not be longer than 32 characters", async () => {
				const action = repairCensoredStory(game.id, repairingPlayerId, censoredStoryIndex, [
					"single-very-long-hyphenated-word-",
					"single",
				]);
				await expect(action).rejects.toThrow(OutOfRange);
			});
		});
	});
});

describe("Preconditions", () => {
	describe("the game must exist", () => {
		test("fails to repair a story in a non-existent game", async () => {
			const nonExistentGameId = "unknown-game-id";
			const action = repairCensoredStory(
				nonExistentGameId,
				repairingPlayerId,
				censoredStoryIndex,
				replacementWords
			);
			await expect(action).rejects.toThrow(GameNotFound);
		});
	});
	describe("the player must be in the game", () => {
		test("player not in game fails to repair a story", async () => {
			const action = repairCensoredStory(game.id, notIncludedPlayerId, censoredStoryIndex, replacementWords);
			await expect(action).rejects.toThrow(UnauthorizedStoryModification);
		});
	});
	describe("the game must have been started", () => {
		test("player in story fails to repair a story in a game that hasn't been started", async () => {
			const action = repairCensoredStory(
				unstartedGame.id,
				repairingPlayerId,
				censoredStoryIndex,
				replacementWords
			);
			await expect(action).rejects.toThrow(GameNotStarted);
		});
	});
	describe("the story must exist", () => {
		test("player in story fails to repair a story that doesn't exist", async () => {
			const action = repairCensoredStory(game.id, repairingPlayerId, nonExistentStoryId, replacementWords);
			await expect(action).rejects.toThrow(StoryNotFound);
		});
	});
	describe("the player must be assigned to the story", () => {
		test("player in story fails to repair a story not assigned to them", async () => {
			const unassignedCensoredStoryIndex = game.startStory(playerIds[1], "Some initial story content.");
			game.censorStory(playerIds[2], unassignedCensoredStoryIndex, [1, 3]);
			const action = repairCensoredStory(
				game.id,
				repairingPlayerId,
				unassignedCensoredStoryIndex,
				replacementWords
			);
			await expect(action).rejects.toThrow(UnauthorizedStoryModification);
		});
		test("player in story fails to repair an assigned story that has ended", async () => {
			const shortGame = createStartedGame({ includedPlayerIds: playerIds, maxStoryEntries: 1 });
			const storyIndex = shortGame.startStory(playerIds[1], "Some initial story content.");
			shortGame.censorStory(playerIds[2], storyIndex, [1, 3]);
			shortGame.repairStory(playerIds[3], storyIndex, replacementWords);
			await games.add(shortGame);

			const action = repairCensoredStory(shortGame.id, playerIds[0], storyIndex, replacementWords);
			await expect(action).rejects.toThrow(UnauthorizedStoryModification);
		});
	});
	describe("the story must be ready to be repaired", () => {
		test("player in story fails to repair an assigned story that is being redacted", async () => {
			const storyIndex = game.startStory(playerIds[1], "Some initial story content.");
			const action = repairCensoredStory(game.id, playerIds[2], storyIndex, replacementWords);
			await expect(action).rejects.toThrow(IncorrectStoryModification);
		});
		test("player in story fails to repair an assigned story that is being continued", async () => {
			const storyIndex = game.startStory(playerIds[1], "Some initial story content.");
			game.censorStory(playerIds[2], storyIndex, [1, 3]);
			game.repairStory(playerIds[3], storyIndex, replacementWords);
			const action = repairCensoredStory(game.id, playerIds[0], storyIndex, replacementWords);
			await expect(action).rejects.toThrow(IncorrectStoryModification);
		});
	});
	describe("the story must have been censored", () => {
		test("player in story fails to repair an assigned story that was truncated", async () => {
			const storyIndex = game.startStory(playerIds[1], "Some initial story content.");
			game.truncateStory(playerIds[2], storyIndex, 2);
			const action = repairCensoredStory(game.id, playerIds[3], storyIndex, replacementWords);
			await expect(action).rejects.toThrow(IncorrectStoryModification);
		});
	});
});

describe("Requirements", () => {
	describe("the number of supplied replacements must match the number of censored words in the story", () => {
		test("too few words are rejected", async () => {
			const action = repairCensoredStory(game.id, repairingPlayerId, censoredStoryIndex, ["replacement"]);
			await expect(action).rejects.toThrow(InvalidWordCount);
		});
		test("too many words are rejected", async () => {
			const action = repairCensoredStory(
				game.id,
				repairingPlayerId,
				censoredStoryIndex,
				replacementWords.concat("replacement3")
			);
			await expect(action).rejects.toThrow(InvalidWordCount);
		});
	});
});

describe("Postconditions", () => {
	/** @type {UseCases.CensoredStoryRepaired} */
	let result;
	beforeEach(async () => {
		result = await repairCensoredStory(game.id, repairingPlayerId, censoredStoryIndex, replacementWords);
	});
	describe("the censored words in the story entry are replaced by the supplied replacement words", () => {
		test("return value contains repaired content", () => {
			expect(result.repairedContent).not.toBe(initialContent);
			expect(result.repairedContent).toBe("Some replacement1 story replacement2.");
		});
	});
	describe("the next player in the game is assigned to the story", () => {
		test("the player fails to continue the story", async () => {
			const action = continueStory(game.id, repairingPlayerId, censoredStoryIndex, "Some new content");
			expect(action).rejects.toThrow(UnauthorizedStoryModification);
		});
	});
	describe("the story is ready to be continued", () => {
		test("the next player can continue the story", async () => {
			await continueStory(game.id, nextPlayerId, censoredStoryIndex, "Some new content");
		});
	});
});

describe("Alternate paths", () => {
	describe("the final story entry has been repaired", () => {
		describe("the story is complete", () => {
			test("the next player cannot continue the story", async () => {
				const shortGame = createStartedGame({ includedPlayerIds: playerIds, maxStoryEntries: 1 });
				const storyIndex = shortGame.startStory(playerIds[0], "Some initial story content.");
				shortGame.censorStory(playerIds[1], storyIndex, [1, 3]);
				await games.add(shortGame);
				await repairCensoredStory(shortGame.id, playerIds[2], storyIndex, replacementWords);

				const action = continueStory(shortGame.id, playerIds[3], storyIndex, "Some new content");
				await expect(action).rejects.toThrow();
			});
		});
	});
});

const repairCensoredStory = require("../../../../doubles/usecases").make.repairCensoredStory({
	games: () => games,
});
const continueStory = require("../../../../doubles/usecases/index").make.continueStory({
	games: () => games,
});
