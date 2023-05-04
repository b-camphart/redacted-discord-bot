const { makeGame } = require("../entities/makeGame");

/**
 * @param {import("./GameRepository").GameRepositoryConstructor} gameRepo
 */
exports.gameRepositoryContract = (gameRepo) => {
    describe("GameRepository", () => {
        /** @type {import("./GameRepository").GameWithId} */
        let game1;
        /** @type {import("./GameRepository").GameWithId} */
        let game2;
        const repo = new gameRepo();

        beforeEach(async () => {
            game1 = await repo.add(makeGame());
            game2 = await repo.add(makeGame());
        });

        test("games receive unique ids", () => {
            expect(game1.id).not.toBeUndefined();
            expect(game2.id).not.toBeUndefined();
            expect(game1.id).not.toEqual(game2.id);
        });

        test("retreives games by id", async () => {
            expect(await repo.get(game1.id)).toBe(game1);
            expect(await repo.get(game2.id)).toBe(game2);
        });
    });
};
