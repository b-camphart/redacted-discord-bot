const { ParamValidation } = require("./index");
const { mustBeInRange } = require("./numbers");
/** @typedef {import("./numbers").RangeEnd} RangeEnd */

/**
 * @param {ParamValidation<{ length: number }>} validation
 * @param {number} exactLength
 * @returns {ParamValidation<{ length: number }>}
 */
exports.mustHaveLength = (validation, exactLength) => {
    if (validation.value === undefined) return validation;
    if (validation.value.length !== exactLength)
        throw new TypeError(`${validation.name} must have length ${exactLength}.`);
    return validation;
};

/**
 * @param {ParamValidation<{ length: number }>} validation
 * @param {RangeEnd} start
 * @param {RangeEnd} end
 * @returns {ParamValidation<{ length: number }>}
 */
exports.mustHaveLengthInRange = (validation, start, end) => {
    if (validation.value === undefined) return validation;
    const lengthParam = new ParamValidation(`length of ${validation.name}`, validation.value.length);
    mustBeInRange(lengthParam, start, end);
    return validation;
};

/**
 * @template T
 * @param {ParamValidation<T[]>} validation
 * @param {(valueParam: ParamValidation<T>) => void} check
 * @returns {ParamValidation<T[]>}
 */
exports.eachValueOf = (validation, check) => {
    if (validation.value === undefined) return validation;
    const eachValidationName = `each value of ${validation.name}`;
    validation.value.forEach((value) => {
        check(new ParamValidation(eachValidationName, value));
    });
    return validation;
};
