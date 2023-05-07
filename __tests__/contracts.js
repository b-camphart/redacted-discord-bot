/**
 *
 * @param {string} paramName
 * @param {(name: string) => void} fn
 */
exports.contract = (paramName, fn) => {
    describe(paramName, () => {
        fn(paramName);
    });
};

/**
 *
 * @param {string} paramName
 * @param {() => Promise<any>} callWithoutParam
 */
exports.isRequired = (paramName, callWithoutParam) => {
    it("is required", async () => {
        // @ts-ignore
        const action = callWithoutParam();
        await expect(action).rejects.toThrow(TypeError);
        await expect(action).rejects.toThrow(`${paramName} is required.`);
    });
};

/**
 *
 * @param {string} paramName
 * @param {(garbage: any) => Promise<any>} callWithGarbage
 */
exports.mustBeString = (paramName, callWithGarbage) => {
    const falseStrings = [13, [], {}, true];
    describe("must be a string", () => {
        falseStrings.forEach((garbage) => {
            const garbageType = typeof garbage;
            it(`does not accept ${garbageType}`, async () => {
                const action = callWithGarbage(garbage);
                await expect(action).rejects.toThrow(TypeError);
                await expect(action).rejects.toThrow(`${paramName} must be a string.  Found: ${garbageType}`);
            });
        });
    });
};

/**
 *
 * @param {string} paramName
 * @param {(garbage: any) => Promise<any>} callWithGarbage
 */
exports.mustBeNumber = (paramName, callWithGarbage) => {
    const falseNumbers = ["13", [], {}, true];
    describe("must be a number", () => {
        falseNumbers.forEach((garbage) => {
            it(`does not accept ${typeof garbage}`, async () => {
                const action = callWithGarbage(garbage);
                await expect(action).rejects.toThrow(TypeError);
                await expect(action).rejects.toThrow(`${paramName} must be a number.`);
            });
        });
    });
};

/**
 *
 * @param {string} paramName
 * @param {(garbage: any) => Promise<any>} callWithGarbage
 */
exports.mustBeArray = (paramName, callWithGarbage) => {
    const falseArrays = ["13", {}, true, 56];
    describe("must be an array", () => {
        falseArrays.forEach((garbage) => {
            it(`does not accept ${typeof garbage}`, async () => {
                const action = callWithGarbage(garbage);
                await expect(action).rejects.toThrow(TypeError);
                await expect(action).rejects.toThrow(`${paramName} must be an array.`);
            });
        });
    });
};
