const { param } = require("../validation");

/**
 * @template T, K, V
 * @param {T[]} inputArray
 * @param {(value: T, index: number, array: T[]) => [K, V]} transform
 * @returns {Map<K, V>}
 */
exports.associate = (inputArray, transform) => {
    param("inputArray", inputArray).isRequired().mustBeArray();
    param("transform", transform).isRequired();
    const retMap = new Map();
    inputArray.forEach((value, index, arr) => {
        const [key, newValue] = transform(value, index, arr);
        retMap.set(key, newValue);
    });
    return retMap;
};

/**
 * @template T, V
 * @param {T[]} inputArray
 * @param {(value: T, index: number, array: T[]) => V} transform
 * @returns {Map<T, V>}
 */
exports.associateWith = (inputArray, transform) => {
    param("inputArray", inputArray).isRequired().mustBeArray();
    param("transform", transform).isRequired();
    const retMap = new Map();
    inputArray.forEach((value, index, arr) => {
        const newValue = transform(value, index, arr);
        retMap.set(value, newValue);
    });
    return retMap;
};
