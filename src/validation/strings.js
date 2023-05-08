/**
 * @template T
 *  @typedef {import("./index").ParamValidation<T>} ParamValidation<T>
 */

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

/**
 *
 * @param {ParamValidation<string>} validation
 */
exports.mustNotBeBlank = (validation) => {
    if (validation.value === undefined) return this;
    if (this.isStringBlank(validation.value)) throw new this.MustNotBeBlank("content");
    return this;
};
