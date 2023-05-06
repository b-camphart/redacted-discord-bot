const { makeGame } = require("../entities/makeGame");
/** @typedef {import("../../repositories/GameRepository").GameRepository} GameRepository */
/** @typedef {import("../../repositories/GameRepository").GameWithId} GameWithId */

/**
 * @param {() => GameRepository} gameRepo
 */
exports.gameRepositoryContract = (gameRepo) => {
    describe("GameRepository", () => {
        /** @type {GameWithId} */
        let game1;
        /** @type {GameWithId} */
        let game2;
        const repo = gameRepo();

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
            expect(await repo.get(game1.id)).toEqual(game1);
            expect(await repo.get(game2.id)).toEqual(game2);
        });
    });
};
