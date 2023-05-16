const { makeGame } = require("../../../doubles/entities/makeGame");
const { FakeGameRepository } = require("../../../doubles/repositories/FakeGameRepository");
const { PlayerActivityService } = require("../../../src/usecases/PlayerActivityService");
const { expectActionToThrowGameNotFound, expectActionToThrowUserNotInGame } = require("../expectErrors");
const { repeat } = require("../../../src/utils/iteration");
const { getOrThrow } = require("../../../doubles/repositories/extensions");
const { contract, isRequired, mustBeString } = require("../../contracts");
const { range } = require("../../../src/utils/range");
const {
	AwaitingGameStart,
	StartingStory,
	AwaitingStory,
	RedactingStory,
	RepairingCensoredStory,
	ContinuingStory,
	ReadingFinishedStories,
} = require("../../../src/entities/playerActivities");

/** @type {PlayerActivityService} */
let playerActivity;
/** @type {FakeGameRepository} */
let gameRepo;

beforeEach(() => {
	gameRepo = new FakeGameRepository();
	playerActivity = new PlayerActivityService(gameRepo);
});

describe("contract", () => {
	contract("gameId", (name) => {
		isRequired(name, () => {
			// @ts-ignore
			return playerActivity.getPlayerActivity();
		});
		mustBeString(name, (nonString) => {
			// @ts-ignore
			return playerActivity.getPlayerActivity(nonString);
		});
	});
	contract("playerId", (name) => {
		isRequired(name, () => {
			// @ts-ignore
			return playerActivity.getPlayerActivity("game-id");
		});
		mustBeString(name, (nonString) => {
			// @ts-ignore
			return playerActivity.getPlayerActivity("game-id", nonString);
		});
	});
});

test("game must exist", async () => {
	const action = playerActivity.getPlayerActivity("unknown-game-id", "player-id");
	await expectActionToThrowGameNotFound(action, "unknown-game-id");
});

describe("given the game exists", () => {
	/** @type {string} */
	let gameId;

	beforeEach(async () => {
		gameId = (await gameRepo.add(makeGame())).id;
	});

	/**
	 *
	 * @param {(game: import("../../../src/entities/types").GameWithId) => void} setup
	 */
	const gameSetup = (setup) => {
		return async () => {
			const game = await getOrThrow(gameRepo, gameId);
			setup(game);
			await gameRepo.replace(game);
		};
	};

	test("the player must be in the game", async () => {
		const userId = "player-id";
		const action = playerActivity.getPlayerActivity(gameId, userId);
		await expectActionToThrowUserNotInGame(action, userId, gameId);
	});

	describe("given 4 players have joined the game", () => {
		const playerId = "player-1";
		beforeEach(
			gameSetup((game) => {
				repeat(4, (i) => game.addPlayer(`player-${i + 1}`));
			})
		);

		test("I am awaiting the start of the game", async () => {
			const activity = await playerActivity.getPlayerActivity(gameId, playerId);
			expect(activity).toEqual(AwaitingGameStart);
		});

		describe("given the game has been started", () => {
			beforeEach(gameSetup((game) => game.start()));

			test("I am starting a story", async () => {
				const activity = await playerActivity.getPlayerActivity(gameId, playerId);
				expect(activity).toEqual(StartingStory);
			});

			describe("given I have started a story", () => {
				beforeEach(gameSetup((game) => game.startStory(playerId, "content one")));

				test("I am awaiting another story", async () => {
					const activity = await playerActivity.getPlayerActivity(gameId, playerId);
					expect(activity).toEqual(AwaitingStory);
				});

				describe("given the previous player has started a story", () => {
					beforeEach(gameSetup((game) => game.startStory("player-4", "content four")));

					test("I am be redacting their story", async () => {
						const activity = await playerActivity.getPlayerActivity(gameId, playerId);
						expect(activity).toEqual(new RedactingStory(1, "content four"));
					});

					describe("given I have redacted their story", () => {
						beforeEach(gameSetup((game) => game.censorStory(playerId, 1, [1])));

						test("I am awaiting another story", async () => {
							const activity = await playerActivity.getPlayerActivity(gameId, playerId);
							expect(activity).toEqual(AwaitingStory);
						});

						describe("given a story is available for repair", () => {
							beforeEach(gameSetup((game) => game.startStory("player-3", "content three")));
							beforeEach(gameSetup((game) => game.censorStory("player-4", 2, [1])));

							test("I am repairing the story", async () => {
								const activity = await playerActivity.getPlayerActivity(gameId, playerId);
								expect(activity).toEqual(
									new RepairingCensoredStory(2, "content _____", [range(8, 13)])
								);
							});

							describe("given I have repaired the story", () => {
								beforeEach(gameSetup((game) => game.repairStory(playerId, 2, ["replacement"])));

								test("I am awaiting another story", async () => {
									const activity = await playerActivity.getPlayerActivity(gameId, playerId);
									expect(activity).toEqual(AwaitingStory);
								});

								describe("given a story is available to continue", () => {
									beforeEach(gameSetup((game) => game.startStory("player-2", "content two")));
									beforeEach(gameSetup((game) => game.censorStory("player-3", 3, [1])));
									beforeEach(gameSetup((game) => game.repairStory("player-4", 3, ["replacement"])));

									test("I am continuing the story", async () => {
										const activity = await playerActivity.getPlayerActivity(gameId, playerId);
										expect(activity).toEqual(new ContinuingStory(3, "content replacement"));
									});

									describe("given I have continued the story", () => {
										beforeEach(
											gameSetup((game) =>
												game.continueStory(playerId, 3, "content two point two")
											)
										);

										test("I am awaiting another story", async () => {
											const activity = await playerActivity.getPlayerActivity(gameId, playerId);
											expect(activity).toEqual(AwaitingStory);
										});
									});
								});
							});
						});
					});
				});
			});
		});

		describe("given the game has been started with a maximum story length of 1 entry", () => {
			beforeEach(gameSetup((game) => game.start(1)));

			describe("given I have started a story", () => {
				beforeEach(gameSetup((game) => game.startStory(playerId, "content one")));

				describe("given a story is available for repair", () => {
					beforeEach(gameSetup((game) => game.startStory("player-4", "content four")));
					beforeEach(gameSetup((game) => game.censorStory(playerId, 1, [1])));
					beforeEach(gameSetup((game) => game.startStory("player-3", "content three")));
					beforeEach(gameSetup((game) => game.censorStory("player-4", 2, [1])));

					describe("given I have repaired the story", () => {
						beforeEach(gameSetup((game) => game.repairStory(playerId, 2, ["replacement"])));

						describe("given the story that would normally have been available to continue has been repaired", () => {
							beforeEach(gameSetup((game) => game.startStory("player-2", "content two")));
							beforeEach(gameSetup((game) => game.censorStory("player-3", 3, [1])));
							beforeEach(gameSetup((game) => game.repairStory("player-4", 3, ["replacement"])));

							test("I am awaiting another story", async () => {
								const activity = await playerActivity.getPlayerActivity(gameId, playerId);
								expect(activity).toEqual(AwaitingStory);
							});

							describe("given all stories in the game have been finished", () => {
								beforeEach(gameSetup((game) => game.censorStory("player-2", 0, [1])));
								beforeEach(gameSetup((game) => game.repairStory("player-3", 0, ["replacement"])));
								beforeEach(gameSetup((game) => game.repairStory("player-2", 1, ["replacement"])));

								test("I am reading all the finished stories", async () => {
									const activity = await playerActivity.getPlayerActivity(gameId, playerId);
									expect(activity).toEqual(
										new ReadingFinishedStories([
											{
												entries: [
													{
														repairedContent: "content replacement",
														redactions: [range(8, 19)],
														contributors: [playerId, "player-2", "player-3"],
													},
												],
											},
											{
												entries: [
													{
														repairedContent: "content replacement",
														redactions: [range(8, 19)],
														contributors: ["player-4", playerId, "player-2"],
													},
												],
											},
											{
												entries: [
													{
														repairedContent: "content replacement",
														redactions: [range(8, 19)],
														contributors: ["player-3", "player-4", playerId],
													},
												],
											},
											{
												entries: [
													{
														repairedContent: "content replacement",
														redactions: [range(8, 19)],
														contributors: ["player-2", "player-3", "player-4"],
													},
												],
											},
										])
									);
								});
							});
						});
					});
				});
			});
		});
	});
});
