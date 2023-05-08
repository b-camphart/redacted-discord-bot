/**
 *
 * @param {number} times
 * @param {(index: number) => void} action
 */
exports.repeat = (times, action) => {
    for (let i = 0; i < times; i++) action(i);
};
/**
 *
 * @param {number} times
 * @param {(index: number) => Promise<void>} action
 */
exports.repeatAsync = async (times, action) => {
    for (let i = 0; i < times; i++) await action(i);
};
