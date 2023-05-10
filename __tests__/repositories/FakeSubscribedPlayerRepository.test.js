const { FakeSubscribedPlayerRepository } = require("../../doubles/repositories/SubscribedPlayerRepositoryDoubles");

const repo = new FakeSubscribedPlayerRepository();

test("added subscriptions are subscribed", async () => {
    await repo.add({ gameId: "game-4", playerId: "player-3" });
    await repo.add({ gameId: "game-4", playerId: "player-4" });

    expect(await repo.isSubscribed("game-4", "player-3")).toBe(true);
    expect(await repo.isSubscribed("game-4", "player-4")).toBe(true);
});

test("not subscribed to non-existant subscriptions", async () => {
    await repo.add({ gameId: "game-4", playerId: "player-3" });

    expect(await repo.isSubscribed("game-4", "player-2")).toBe(false);
    expect(await repo.isSubscribed("game-3", "player-3")).toBe(false);
});

test("returns list of subscribed players", async () => {
    await repo.add({ gameId: "game-4", playerId: "player-3" });
    await repo.add({ gameId: "game-4", playerId: "player-2" });

    const players = await repo.playersSubscribedToGame("game-4");
    expect(players).toContain("player-3");
    expect(players).toContain("player-2");
});

test("returns empty list of subscribed players if no one has subscribed", async () => {
    await repo.add({ gameId: "game-4", playerId: "player-3" });
    await repo.add({ gameId: "game-4", playerId: "player-2" });

    const players = await repo.playersSubscribedToGame("game-2");
    expect(players).toHaveLength(0);
});
