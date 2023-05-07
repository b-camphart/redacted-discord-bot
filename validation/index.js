/**
 * @template T
 */
class ParamValidation {
    /**
     *
     * @param {string} name
     * @param {T} value
     */
    constructor(name, value) {
        this.name = name;
        this.value = value;
    }
}

/**
 * @template T
 * @this {ParamValidation<T | undefined>}
 * @returns {ParamValidation<T>}
 */
ParamValidation.prototype.isRequired = function () {
    if (this.value === undefined) throw new TypeError(`${this.name} is required.`);
    return /** @type {ParamValidation<T>} */ (this);
};

/**
 *
 * @param {"string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function"} expectedType
 * @param {any | undefined} value
 * @param {string} name
 * @returns
 */
exports.mustBeType = (expectedType, value, name) => {
    if (value === undefined) return;
    const actualType = typeof value;
    if (actualType !== expectedType) throw new TypeError(`${name} must be a ${expectedType}.  Found: ${actualType}`);
};

/**
 *
 * @returns {ParamValidation<string>}
 */
ParamValidation.prototype.mustBeString = function () {
    exports.mustBeType("string", this.value, this.name);
    return this;
};

/**
 *
 * @returns {ParamValidation<number>}
 */
ParamValidation.prototype.mustBeNumber = function () {
    exports.mustBeType("number", this.value, this.name);
    return this;
};

/**
 * @template T
 * @returns {ParamValidation<T[]>}
 */
ParamValidation.prototype.mustBeArray = function () {
    if (this.value === undefined) return /** @type {ParamValidation<[]>} */ (this);
    if (!Array.isArray(this.value)) throw new TypeError(`${this.name} must be an array.`);
    return /** @type {ParamValidation<[]>} */ (this);
};

exports.ParamValidation = ParamValidation;

/**
 * @template T
 * @returns {ParamValidation<T>}
 */
ParamValidation.prototype.mustBeObject = function () {
    exports.mustBeType("object", this.value, this.name);
    return this;
};

exports.ParamValidation = ParamValidation;

/**
 *
 * @param {string} propertyName
 * @returns {ParamValidation<unknown>}
 */
ParamValidation.prototype.mustHaveProperty = function (propertyName) {
    if (this.value === undefined) return this;
    if (!(propertyName in this.value)) throw new TypeError(`${this.name} must have property ${propertyName}.`);
    return new ParamValidation(`${this.name}.${propertyName}`, this.value[propertyName]);
};

/**
 *
 * @param {string} name
 * @param {any} value
 */
exports.param = function (name, value) {
    return new ParamValidation(name, value);
};
