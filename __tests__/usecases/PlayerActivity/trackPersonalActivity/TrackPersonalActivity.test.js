const { makeGame } = require("../../../../doubles/entities/makeGame");
const { FakeGameRepository } = require("../../../../doubles/repositories/FakeGameRepository");
const { PlayerNotifierSpy } = require("../../../../doubles/repositories/PlayerNotifierDoubles");
const {
    FakeSubscribedPlayerRepository,
} = require("../../../../doubles/repositories/SubscribedPlayerRepositoryDoubles");
const { repeat } = require("../../../../src/utils/iteration");
const { expectActionToThrowGameNotFound, expectActionToThrowUserNotInGame } = require("../../expectErrors");

/** @type {import("../../../../src/repositories/GameRepository").GameRepository} */
let games;
/** @type {FakeSubscribedPlayerRepository} */
let subscriptions;

beforeEach(() => {
    games = new FakeGameRepository();
    subscriptions = new FakeSubscribedPlayerRepository();
});

test("game must exist", async () => {
    const action = trackPersonalActivity("unknown-game-id", "player-id");
    await expectActionToThrowGameNotFound(action, "unknown-game-id");
});

describe("given the game has been created", () => {
    /** @type {import("../../../../src/entities/types").Game<string>} */
    let game;
    beforeEach(async () => {
        game = await games.add(makeGame());
        repeat(4, (i) => game.addPlayer(`player-${i + 1}`));
    });

    test("the player must be in the game", async () => {
        const action = trackPersonalActivity(game.id, "player-5");
        await expectActionToThrowUserNotInGame(action, "player-5", game.id);
    });

    describe("given the player is in the game", () => {
        test("player is added to list of subscribed players for game", async () => {
            await trackPersonalActivity(game.id, "player-1");
            expect(await subscriptions.isSubscribed(game.id, "player-1")).toBe(true);
            expect(await subscriptions.playersSubscribedToGame(game.id)).toContain("player-1");
        });
    });
});

const trackPersonalActivity = require("../../../../doubles/usecases/trackPersonalActivity").makeTrackPersonalActivity({
    games: () => games,
    subscriptions: () => subscriptions,
});
