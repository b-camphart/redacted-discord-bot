const ParamValidation = require("./index").ParamValidation;

class OutOfRange extends Error {
    /**
     *
     * @param {string} message
     */
    constructor(message) {
        super(message);
    }
}
exports.OutOfRange = OutOfRange;

/**
 * @typedef {object} RangeEnd
 * @prop {number} value
 * @prop {boolean} included
 */

/**
 * @param {ParamValidation<number>} validation
 * @param {RangeEnd} start
 * @param {RangeEnd} end
 */
exports.mustBeInRange = (validation, start, end) => {
    if (validation.value === undefined || typeof validation.value !== "number") return this;
    if (start.included && validation.value < start.value)
        throw new OutOfRange(
            `${validation.name} <${validation.value}> must be greater than or equal to ${start.value}.`
        );
    if (!start.included && validation.value <= start.value)
        throw new OutOfRange(`${validation.name} <${validation.value}> must be greater than ${start.value}.`);
    if (end.included && validation.value > end.value)
        throw new OutOfRange(`${validation.name} <${validation.value}> must be less than or equal to ${end.value}.`);
    if (!end.included && validation.value >= end.value)
        throw new OutOfRange(`${validation.name} <${validation.value}> must be less than ${end.value}.`);
    return validation;
};

/**
 *
 * @param {number} num
 * @returns {RangeEnd}
 */
exports.exclusive = function (num) {
    return {
        value: num,
        included: false,
    };
};

/**
 *
 * @param {number} num
 * @returns {RangeEnd}
 */
exports.inclusive = function (num) {
    return {
        value: num,
        included: true,
    };
};
