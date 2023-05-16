const { makeGame } = require("../../../../doubles/entities/makeGame");
const { FakeGameRepository } = require("../../../../doubles/repositories/FakeGameRepository");
const { PlayerNotifierSpy } = require("../../../../doubles/repositories/PlayerNotifierDoubles");
const {
	FakeSubscribedPlayerRepository,
} = require("../../../../doubles/repositories/SubscribedPlayerRepositoryDoubles");
const PlayerActivity = require("../../../../src/entities/playerActivities");
const { repeat } = require("../../../../src/utils/iteration");
const { range } = require("../../../../src/utils/range");

/** @type {FakeGameRepository} */
let games;
/** @type {import("../../../../src/entities/types").Game<string>} */
let game;
/**
 * @type {FakeSubscribedPlayerRepository}
 */
let subscribers;
/** @type {PlayerNotifierSpy} */
let notifierSpy;
beforeEach(() => {
	games = new FakeGameRepository();
	notifierSpy = new PlayerNotifierSpy();
	subscribers = new FakeSubscribedPlayerRepository();
});

beforeEach(async () => {
	game = await games.add(makeGame());
	repeat(4, (i) => game.addPlayer(`player-${i + 1}`));
	game.start();
});

describe("given the player is not subscribed", () => {
	test("the player is not notified", async () => {
		await startStory(game.id, "player-1", "My initial story content.");
		expect(notifierSpy.playersNotified).toHaveLength(0);
	});

	describe("given the player before them has started a story", () => {
		beforeEach(async () => {
			game.startStory("player-4", "Player 4's initial story content.");
		});

		test("the player is not notified", async () => {
			await startStory(game.id, "player-1", "My initial story content.");
			expect(notifierSpy.playersNotified).toHaveLength(0);
		});
	});
});

describe("given the player has subscribed", () => {
	beforeEach(async () => {
		await trackPersonalActivity(game.id, "player-1");
	});

	test("player is notified that they are awaiting a new story", async () => {
		await startStory(game.id, "player-1", "My initial story content.");
		expect(notifierSpy.playersNotified).toHaveLength(1);
		expect(notifierSpy.playersNotified[0]).toEqual({
			userId: "player-1",
			notification: {
				gameId: game.id,
				playerId: "player-1",
				activity: PlayerActivity.AwaitingStory,
			},
		});
	});

	describe("given the player before them has started a story", () => {
		beforeEach(async () => {
			game.startStory("player-4", "Player 4's initial story content.");
		});

		test("the player is notified that they are redacting the other player's story", async () => {
			await startStory(game.id, "player-1", "My initial story content.");
			expect(notifierSpy.playersNotified).toHaveLength(1);
			expect(notifierSpy.playersNotified[0]).toEqual({
				userId: "player-1",
				notification: {
					gameId: game.id,
					playerId: "player-1",
					activity: new PlayerActivity.RedactingStory(0, "Player 4's initial story content."),
				},
			});
		});
	});

	describe("given the player has already started their story", () => {
		beforeEach(async () => {
			game.startStory("player-1", "My initial story content.");
		});

		test("the player is not notified if a story is started and not assigned to them", async () => {
			await startStory(game.id, "player-3", "Player 3's initial story content.");
			expect(notifierSpy.playersNotified).toHaveLength(0);
		});

		test("the player is notified when the previous player starts their story", async () => {
			await startStory(game.id, "player-4", "Player 4's initial story content.");
			expect(notifierSpy.playersNotified).toHaveLength(1);
			expect(notifierSpy.playersNotified[0]).toEqual({
				userId: "player-1",
				notification: {
					gameId: game.id,
					playerId: "player-1",
					activity: new PlayerActivity.RedactingStory(1, "Player 4's initial story content."),
				},
			});
		});
	});

	describe("given the previous two players have started their stories", () => {
		beforeEach(() => {
			game.startStory("player-3", "Player 3's initial story content.");
			game.startStory("player-4", "Player 4's initial story content.");
		});

		test("player is notified of needing to repair a censored story", async () => {
			game.censorStory("player-4", 0, [2]);

			await startStory(game.id, "player-1", "My initial story content.");

			expect(notifierSpy.playersNotified).toHaveLength(1);
			expect(notifierSpy.playersNotified[0]).toEqual({
				userId: "player-1",
				notification: {
					gameId: game.id,
					playerId: "player-1",
					activity: new PlayerActivity.RepairingCensoredStory(0, "Player 3's _______ story content.", [
						range(11, 18),
					]),
				},
			});
		});

		test("player is notified of needing to repair a truncated story", async () => {
			game.truncateStory("player-4", 0, 2);

			await startStory(game.id, "player-1", "My initial story content.");

			expect(notifierSpy.playersNotified).toHaveLength(1);
			expect(notifierSpy.playersNotified[0]).toEqual({
				userId: "player-1",
				notification: {
					gameId: game.id,
					playerId: "player-1",
					activity: new PlayerActivity.RepairingTruncatedStory(0, "Player 3's initial ______________", 19),
				},
			});
		});
	});

	describe("given the previous three stories have progressed", () => {
		beforeEach(() => {
			game.startStory("player-2", "Player 2's initial story content.");
			game.startStory("player-3", "Player 3's initial story content.");
			game.startStory("player-4", "Player 4's initial story content.");
			game.truncateStory("player-3", 0, 2);
			game.truncateStory("player-4", 1, 2);
			game.repairStory("player-4", 0, "attempt at writing.");
		});

		test("player is notified to continue the first story", async () => {
			await startStory(game.id, "player-1", "My initial story content.");
			expect(notifierSpy.playersNotified).toHaveLength(1);
			expect(notifierSpy.playersNotified[0]).toEqual({
				userId: "player-1",
				notification: {
					gameId: game.id,
					playerId: "player-1",
					activity: new PlayerActivity.ContinuingStory(0, "Player 2's initial attempt at writing."),
				},
			});
		});
	});
});

const context = {
	games: () => games,
	playerNotifier: () => notifierSpy,
	subscriptions: () => subscribers,
};
const trackPersonalActivity = require("../../../../doubles/usecases/trackPersonalActivity").makeTrackPersonalActivity(
	context
);
const startStory = require("../../../../doubles/usecases/startStory").makeStartStory(context);
