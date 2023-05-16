const { makeGame } = require("../../../../doubles/entities/makeGame");
const { FakeGameRepository } = require("../../../../doubles/repositories/FakeGameRepository");
const { PlayerNotifierSpy } = require("../../../../doubles/repositories/PlayerNotifierDoubles");
const {
	FakeSubscribedPlayerRepository,
} = require("../../../../doubles/repositories/SubscribedPlayerRepositoryDoubles");
const { StartingStory } = require("../../../../src/entities/playerActivities");
const { repeat } = require("../../../../src/utils/iteration");

/** @type {import("../../../../src/repositories/GameRepository").UpdateGameRepository} */
let games;
/** @type {import("../../../../src/entities/types").Game<string>} */
let game;
/**
 * @type {FakeSubscribedPlayerRepository}
 */
let subscribers;
/** @type {PlayerNotifierSpy} */
let notifierSpy;
beforeEach(async () => {
	const fakeGames = new FakeGameRepository();
	game = await fakeGames.add(makeGame());
	repeat(4, (i) => game.addPlayer(`player-${i + 1}`));
	games = fakeGames;
	notifierSpy = new PlayerNotifierSpy();
	subscribers = new FakeSubscribedPlayerRepository();
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
	test.each(["player-1", "player-3"])(
		"the player is notified regardless of which player started the game",
		async (starterId) => {
			await startGame(game.id, starterId);
			expect(notifierSpy.playersNotified).toHaveLength(1);
			expect(notifierSpy.playersNotified[0]).toEqual({
				userId: "player-1",
				notification: {
					gameId: game.id,
					playerId: "player-1",
					activity: StartingStory,
				},
			});
		}
	);
});

const context = {
	games: () => games,
	playerNotifier: () => notifierSpy,
	subscriptions: () => subscribers,
};
const trackPersonalActivity = require("../../../../doubles/usecases/trackPersonalActivity").makeTrackPersonalActivity(
	context
);
const startGame = require("../../../../doubles/usecases/startGame").makeStartGame(context);
