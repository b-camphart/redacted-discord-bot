/**
 * @typedef {object} RangeEnd
 * @prop {number} value
 * @prop {boolean} included
 */

/**
 *
 * @param {number} num
 * @returns {RangeEnd}
 */
exports.exclusive = function (num) {
    if (typeof num !== "number") throw "Number is required.";
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
    if (typeof num !== "number") throw "Number is required.";
    return {
        value: num,
        included: true,
    };
};

/**
 *
 * @param {RangeEnd} start
 * @param {RangeEnd} end
 */
exports.range = (start, end) => {
    return new this.Range(start, end);
};

exports.Range = class Range {
    /**
     *
     * @param {RangeEnd} start
     * @param {RangeEnd} end
     */
    constructor(start, end) {
        this.start = start.included ? start.value : start.value + 1;
        this.endExclusive = end.included ? end.value + 1 : end.value;
    }

    [Symbol.iterator]() {
        /** @type {number} */
        let value = this.start;

        return {
            next: () => {
                return {
                    value: ++value,
                    done: value >= this.endExclusive,
                };
            },
        };
    }

    random() {
        const result = Math.floor(Math.random() * (this.endExclusive - this.start)) + this.start;
        if (result === null || Number.isNaN(result)) throw "SOMETHING WENT WRONG";
        return result;
    }

    /**
     *
     * @param {number} num
     * @returns {boolean}
     */
    contains(num) {
        if (this.start > num) return false;
        if (this.endExclusive <= num) return false;
        return true;
    }
};
