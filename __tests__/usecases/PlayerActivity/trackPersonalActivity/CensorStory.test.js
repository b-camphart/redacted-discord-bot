const { makeGame } = require("../../../../doubles/entities/makeGame");
const { FakeGameRepository } = require("../../../../doubles/repositories/FakeGameRepository");
const { PlayerNotifierSpy } = require("../../../../doubles/repositories/PlayerNotifierDoubles");
const {
    FakeSubscribedPlayerRepository,
} = require("../../../../doubles/repositories/SubscribedPlayerRepositoryDoubles");
const { PlayerActivity } = require("../../../../src/entities/Game.PlayerActivity");
const { repeat } = require("../../../../src/utils/iteration");

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

beforeEach(async () => {
    await subscribers.add({ gameId: game.id, playerId: "player-1" });
});

test("player is notified of awaiting a new story", async () => {
    game.startStory("player-4", "Player 4's initial story content");
    game.startStory("player-1", "My initial story content.");

    await censorStory(game.id, "player-1", 0, [2]);

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

describe("given other stories are available", () => {
    describe("given the first two stories have been started", () => {
        beforeEach(() => {
            game.startStory("player-3", "Player 3's initial story content");
            game.startStory("player-4", "Player 4's initial story content");
        });
        test("player is notified of needing to repair a censored story", async () => {
            game.censorStory("player-4", 0, [2]);
            game.startStory("player-1", "My initial story content.");

            await censorStory(game.id, "player-1", 1, [2]);

            expect(notifierSpy.playersNotified).toHaveLength(1);
            expect(notifierSpy.playersNotified[0]).toEqual({
                userId: "player-1",
                notification: {
                    gameId: game.id,
                    playerId: "player-1",
                    activity: PlayerActivity.RepairingCensoredStory(0, "Player 3's _______ story content", [[11, 18]]),
                },
            });
        });
        test("player is notified of needing to repair a truncated story", async () => {
            game.truncateStory("player-4", 0, 2);
            game.startStory("player-1", "My initial story content.");

            await censorStory(game.id, "player-1", 1, [2]);

            expect(notifierSpy.playersNotified).toHaveLength(1);
            expect(notifierSpy.playersNotified[0]).toEqual({
                userId: "player-1",
                notification: {
                    gameId: game.id,
                    playerId: "player-1",
                    activity: PlayerActivity.RepairingTruncatedStory(0, "Player 3's initial _____________", 19),
                },
            });
        });
    });
    describe("given the first story is ready to be continued", () => {
        beforeEach(() => {
            game.startStory("player-2", "Player 2's initial story content");
            game.startStory("player-3", "Player 3's initial story content");
            game.startStory("player-4", "Player 4's initial story content");
            game.startStory("player-1", "My initial story content.");
            game.truncateStory("player-3", 0, 2);
            game.truncateStory("player-4", 1, 2);
            game.repairStory("player-4", 0, "attempt at writing");
        });

        test("player is notified of needing to continue the story", async () => {
            await censorStory(game.id, "player-1", 2, [2]);

            expect(notifierSpy.playersNotified).toHaveLength(1);
            expect(notifierSpy.playersNotified[0]).toEqual({
                userId: "player-1",
                notification: {
                    gameId: game.id,
                    playerId: "player-1",
                    activity: PlayerActivity.ContinuingStory(0, "Player 2's initial attempt at writing"),
                },
            });
        });
    });
});

describe("player has already censored their assigned story and is awaiting a new story", () => {
    beforeEach(() => {
        game.startStory("player-4", "Player 4's initial story content");
        game.startStory("player-1", "My initial story content.");
        game.censorStory("player-1", 0, [2]);
    });

    test("the player is notified when a story is censored and assigned to them", async () => {
        game.startStory("player-3", "Player 3's initial story content");

        await censorStory(game.id, "player-4", 2, [2]);

        expect(notifierSpy.playersNotified).toHaveLength(1);
        expect(notifierSpy.playersNotified[0]).toEqual({
            userId: "player-1",
            notification: {
                gameId: game.id,
                playerId: "player-1",
                activity: PlayerActivity.RepairingCensoredStory(2, "Player 3's _______ story content", [[11, 18]]),
            },
        });
    });
});

const censorStory = require("../../../../doubles/usecases/censorStory").makeCensorStory({
    games: () => games,
    subscriptions: () => subscribers,
    playerNotifier: () => notifierSpy,
});
