/**
 *
 * @param {string} content
 * @returns {boolean} `true` if the content is blank, `false` otherwise.
 */
exports.isStringBlank = (content) => {
    return /^\s*$/.test(content);
};

exports.MustNotBeBlank = class MustNotBeBlank extends Error {
    /**
     *
     * @param {string} parameterName - The name of the parameter that was blank.
     */
    constructor(parameterName) {
        super(`${parameterName} must not be blank.`);
        this.parameterName = parameterName;
    }
};

exports.MustHaveLength = class MustHaveLength extends Error {
    /**
     *
     * @param {string} parameterName - The name of the parameter that was blank.
     * @param {number} min - The minimum length of the parameter that was out of bounds.
     * @param {number} [max] - The maximum length of the parameter that was out of bounds.
     */
    constructor(parameterName, min, max) {
        super(`${parameterName} must have length within [>=${min}, <=${max}]`);
        this.parameterName = parameterName;
        this.min = min;
        this.max = max;
    }
};

exports.IndexOutOfBounds = class IndexOutOfBounds extends Error {
    /**
     *
     * @param {string} message
     */
    constructor(message) {
        super(message);
    }
};
