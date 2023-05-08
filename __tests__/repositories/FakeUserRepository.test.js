const { FakeUserRepository } = require("../../doubles/repositories/FakeUserRepository");
const { User } = require("../../src/entities/User");

describe("FakeUserRepository", () => {
    /** @type {FakeUserRepository} */
    let repo;
    /** @type {import("../../src/repositories/UserRepository").UserWithId} */
    let user1;
    /** @type {import("../../src/repositories/UserRepository").UserWithId} */
    let user2;

    beforeEach(async () => {
        repo = new FakeUserRepository();
        user1 = await repo.add(new User());
        user2 = await repo.add(new User());
    });

    test("adding users creates unique ids", () => {
        expect(user1.id).not.toBeUndefined();
        expect(user2.id).not.toBeUndefined();
        expect(user1.id).not.toEqual(user2.id);
    });

    test("retreives users by id", async () => {
        expect(await repo.get(user1.id)).toBe(user1);
        expect(await repo.get(user2.id)).toBe(user2);
    });
});
