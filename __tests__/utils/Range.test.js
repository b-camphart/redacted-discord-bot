const { range, inclusive, exclusive } = require("../../src/utils/range");

describe("random", () => {
    it.each([
        [inclusive(0), inclusive(0), 0, 0],
        [inclusive(0), inclusive(1), 0, 1],
        [exclusive(0), inclusive(1), 1, 1],
        [exclusive(0), exclusive(2), 1, 1],
        [inclusive(0), exclusive(1), 0, 0],
    ])("returns random number in the range", function (start, end, greater, lesser) {
        const result = range(start, end).random();
        expect(result).toBeGreaterThanOrEqual(greater);
        expect(result).toBeLessThanOrEqual(lesser);
    });
});
