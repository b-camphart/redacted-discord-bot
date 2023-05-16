const { makeGame } = require("../../../doubles/entities/makeGame");
const { FakeGameRepository } = require("../../../doubles/repositories/FakeGameRepository");
const { PlayerNotifierSpy } = require("../../../doubles/repositories/PlayerNotifierDoubles");
const { FakeSubscribedPlayerRepository } = require("../../../doubles/repositories/SubscribedPlayerRepositoryDoubles");
const {
	StartingStory,
	AwaitingStory,
	RedactingStory,
	RepairingCensoredStory,
	RepairingTruncatedStory,
} = require("../../../src/entities/playerActivities");
const { repeat } = require("../../../src/utils/iteration");
const { range } = require("../../../src/utils/range");
const { expectActionToThrowGameNotFound, expectActionToThrowUserNotInGame } = require("../expectErrors");

/** @type {import("../../../src/repositories/GameRepository").GameRepository} */
let games;
/** @type {FakeSubscribedPlayerRepository} */
let subscriptions;
/** @type {PlayerNotifierSpy} */
let notifierSpy;
beforeEach(() => {
	games = new FakeGameRepository();
	subscriptions = new FakeSubscribedPlayerRepository();
	notifierSpy = new PlayerNotifierSpy();
});

test("game must exist", async () => {
	const action = trackPersonalActivity("unknown-game-id", "player-id");
	await expectActionToThrowGameNotFound(action, "unknown-game-id");
});

describe("given the game has been created", () => {
	/** @type {import("../../../src/entities/types").Game<string>} */
	let game;
	beforeEach(async () => {
		game = await games.add(makeGame());
		repeat(4, (i) => game.addPlayer(`player-${i + 1}`));
	});

	test("the player must be in the game", async () => {
		const action = trackPersonalActivity(game.id, "player-5");
		await expectActionToThrowUserNotInGame(action, "player-5", game.id);
	});

	describe("given the player is not subscribed", () => {
		test("no notification is delivered when the game is started", async () => {
			await startGame(game.id, "player-1");
			expect(notifierSpy.playersNotified).toHaveLength(0);
		});
	});

	describe("given the player has subscribed", () => {
		beforeEach(async () => {
			await trackPersonalActivity(game.id, "player-1");
		});
		test("notification is delivered when the game is started", async () => {
			await startGame(game.id, "player-1");
			expect(notifierSpy.playersNotified).toHaveLength(1);
		});
		test("notification is delivered when the game is started by another player", async () => {
			await startGame(game.id, "player-3");
			expect(notifierSpy.playersNotified).toHaveLength(1);
		});
		test("notified of starting a story when game is started", async () => {
			await startGame(game.id, "player-3");
			expectPlayerToHaveBeenNotifiedOfActivityChange("player-1", game.id, StartingStory);
		});
		describe("given the game has started", () => {
			beforeEach(async () => {
				await startGame(game.id, "player-3");
				notifierSpy.playersNotified = [];
			});
			test("notified of awaiting a story when the player starts their story", async () => {
				await startStory(game.id, "player-1", "Player 1's intial story content.");
				expect(notifierSpy.playersNotified).toContainEqual({
					userId: "player-1",
					notification: {
						gameId: game.id,
						playerId: "player-1",
						activity: AwaitingStory,
					},
				});
			});
			describe("given another story is available", () => {
				beforeEach(async () => {
					await startStory(game.id, "player-4", "Player 4's initial story content.");
					notifierSpy.playersNotified = [];
				});
				test("notified of redacting the available story", async () => {
					await startStory(game.id, "player-1", "Player 1's intial story content.");
					expect(notifierSpy.playersNotified).toContainEqual({
						userId: "player-1",
						notification: {
							gameId: game.id,
							playerId: "player-1",
							activity: new RedactingStory(0, "Player 4's initial story content."),
						},
					});
				});
			});
			describe("given the player has started their story", () => {
				beforeEach(async () => {
					await startStory(game.id, "player-1", "Player 1's intial story content.");
					notifierSpy.playersNotified = [];
				});
				test("when another story becomes available, the player is notified", async () => {
					await startStory(game.id, "player-4", "Player 4's initial story content.");
					expect(notifierSpy.playersNotified).toContainEqual({
						userId: "player-1",
						notification: {
							gameId: game.id,
							playerId: "player-1",
							activity: new RedactingStory(1, "Player 4's initial story content."),
						},
					});
				});
				test("if a story is started that does not get assigned, the player is not notified", async () => {
					await startStory(game.id, "player-3", "Player 3's initial story content.");
					expect(notifierSpy.playersNotified).toHaveLength(0);
				});

				test("player is notified when a censored story is assigned to them", async () => {
					await startStory(game.id, "player-3", "Player 3's initial story content.");
					await censorStory(game.id, 1, "player-4", [2]);
					expectPlayerToHaveBeenNotifiedOfActivityChange(
						"player-1",
						game.id,
						new RepairingCensoredStory(1, "Player 3's _______ story content.", [range(11, 18)])
					);
				});
				test("player is not notified when a censored story is not assigned to them", async () => {
					await startStory(game.id, "player-2", "Player 2's initial story content.");
					await censorStory(game.id, 1, "player-3", [2]);
					expect(notifierSpy.playersNotified).toHaveLength(0);
				});
				test("player is notified when a truncated story is assigned to them", async () => {
					await startStory(game.id, "player-3", "Player 3's initial story content.");
					await truncateStory(game.id, 1, "player-4", 2);
					expectPlayerToHaveBeenNotifiedOfActivityChange(
						"player-1",
						game.id,
						new RepairingTruncatedStory(1, "Player 3's initial ______________", 19)
					);
				});
				test("player is not notified when a truncated story is not assigned to them", async () => {
					await startStory(game.id, "player-2", "Player 2's initial story content.");
					await truncateStory(game.id, 1, "player-3", 2);
					expect(notifierSpy.playersNotified).toHaveLength(0);
				});
				describe("given the previous player has started a story", () => {
					beforeEach(async () => {
						await startStory(game.id, "player-4", "Player 4's initial story content.");
						notifierSpy.playersNotified = [];
					});
					test("player is notified after they censor a story", async () => {
						await censorStory(game.id, 1, "player-1", [2]);
						expectPlayerToHaveBeenNotifiedOfActivityChange("player-1", game.id, AwaitingStory);
					});
					test("player is notified after they truncate a story", async () => {
						await truncateStory(game.id, 1, "player-1", 2);
						expectPlayerToHaveBeenNotifiedOfActivityChange("player-1", game.id, AwaitingStory);
					});
				});
			});
		});
	});
});

/**
 *
 * @param {string} playerId
 * @param {string} gameId
 * @param {any} activity
 */
const expectPlayerToHaveBeenNotifiedOfActivityChange = (playerId, gameId, activity) => {
	expect(notifierSpy.playersNotified).toContainEqual({
		userId: playerId,
		notification: {
			gameId: gameId,
			playerId,
			activity,
		},
	});
};

const context = {
	games: () => games,
	subscriptions: () => subscriptions,
	playerNotifier: () => notifierSpy,
};

const trackPersonalActivity = require("../../../doubles/usecases/trackPersonalActivity").makeTrackPersonalActivity(
	context
);
const startGame = require("../../../doubles/usecases/startGame").makeStartGame(context);
const startStory = require("../../../doubles/usecases/startStory").makeStartStory(context);
const censorStory = require("../../../doubles/usecases/censorStory").makeCensorStory(context);
const truncateStory = require("../../../doubles/usecases/truncateStory").makeTruncateStory(context);
