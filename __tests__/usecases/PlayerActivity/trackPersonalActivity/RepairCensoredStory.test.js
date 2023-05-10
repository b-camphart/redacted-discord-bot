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

const expectActivityNotification = () => {
    expect(notifierSpy.playersNotified).toHaveLength(1);
    expect(notifierSpy.playersNotified[0].userId).toBe("player-1");
    expect(notifierSpy.playersNotified[0].notification).not.toBeUndefined();
    expect(notifierSpy.playersNotified[0].notification.gameId).toBe(game.id);
    expect(notifierSpy.playersNotified[0].notification.playerId).toBe("player-1");
    expect(notifierSpy.playersNotified[0].notification.activity).not.toBeUndefined();
};

describe("given the player has not subscribed to their activity in the game", () => {
    test("player is not notified", async () => {
        game.startStory("player-3", "Player 3's initial story content.");
        game.censorStory("player-4", 0, [2]);

        await repairCensoredStory(game.id, "player-1", 0, ["amazing"]);

        expect(notifierSpy.playersNotified).toHaveLength(0);
    });
});

describe("given the player has subscribed to their activity in the game", () => {
    beforeEach(() => {
        subscribers.add({ gameId: game.id, playerId: "player-1" });
    });

    test("player is notified after repairing a censored story", async () => {
        game.startStory("player-3", "Player 3's initial story content.");
        game.censorStory("player-4", 0, [2]);

        await repairCensoredStory(game.id, "player-1", 0, ["amazing"]);

        expectActivityNotification();
    });

    test("player is notified after repairing a censored story, even if they have nothing left to do", async () => {
        game.startStory("player-1", "My initial content");
        game.startStory("player-3", "Player 3's initial story content.");
        game.censorStory("player-4", 1, [2]);

        await repairCensoredStory(game.id, "player-1", 1, ["amazing"]);

        expectActivityNotification();
    });

    describe("given player is awaiting a new story", () => {
        beforeEach(() => {
            game.startStory("player-1", "My initial content");
        });

        test("player is notified after another player repairs a censored story", async () => {
            game.startStory("player-2", "Player 2's initial story content.");
            game.censorStory("player-3", 1, [2]);

            await repairCensoredStory(game.id, "player-4", 1, ["amazing"]);

            expectActivityNotification();
        });

        describe("when another player repairs a story that did not get assigned to the player", () => {
            beforeEach(() => {
                game.censorStory("player-2", 0, [2]);
            });
            test("the player is not notified", async () => {
                await repairCensoredStory(game.id, "player-3", 0, ["amazing"]);
                expect(notifierSpy.playersNotified).toHaveLength(0);
            });
        });
    });
});

const repairCensoredStory = require("../../../../doubles/usecases").make.repairCensoredStory({
    games: () => games,
    subscriptions: () => subscribers,
    playerNotifier: () => notifierSpy,
});
