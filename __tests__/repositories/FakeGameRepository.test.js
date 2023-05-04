const { FakeGameRepository } = require("../../doubles/repositories/FakeGameRepository");
const { gameRepositoryContract } = require("../../doubles/repositories/gameRepositoryContract");

describe("FakeGameRepository", () => {
    gameRepositoryContract(FakeGameRepository);
});
