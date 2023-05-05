const { makeGame } = require("../../doubles/entities/makeGame");
const { FakeGameRepository } = require("../../doubles/repositories/FakeGameRepository");
const { gameRepositoryContract } = require("../../doubles/repositories/gameRepositoryContract");

describe("FakeGameRepository", () => {
    gameRepositoryContract(FakeGameRepository);

    test("modifications made to retreived game are not reflected in saved game", async () => {
        const repo = new FakeGameRepository();
        const gameId = (await repo.add(makeGame())).id;
        const modifiedGame = (await repo.get(gameId)) || fail("failed to get game.");
        modifiedGame.addUser("user-1");

        const storedGame = (await repo.get(gameId)) || fail("failed to get game.");
        expect(storedGame.hasUser("user-1")).toBeFalsy();
    });
});
