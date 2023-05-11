const { Range, range, inclusive, exclusive } = require("../utils/range");

const LETTER_MATCHER = new RegExp("[a-zA-Z]");
/**
 *
 * @param {string} char
 */
const isLetter = (char) => {
    return LETTER_MATCHER.test(char);
};

/**
 *
 * @param {string} char
 */
const isApostrophe = (char) => char === "'";

/**
 *
 * @param {string} content
 * @param {number} startIndex
 * @param {boolean} [singleQuoteStarted]
 * @returns {{ boundary: Range | undefined, singleQuoteStarted: boolean}}
 */
const findNextWordBoundary = (content, startIndex, singleQuoteStarted = false) => {
    let wordStart = -1;
    /** @type {string | undefined} */
    let char;

    for (let charIndex = startIndex; charIndex < content.length; charIndex++) {
        char = content.charAt(charIndex);
        const canStartWord = isLetter(char);
        const isPartOfWord = canStartWord || isApostrophe(char);
        const wordStarted = wordStart >= 0;

        if (wordStarted && !isPartOfWord)
            return { boundary: range(inclusive(wordStart), exclusive(charIndex)), singleQuoteStarted };
        if (!wordStarted) {
            if (canStartWord) wordStart = charIndex;
            if (isApostrophe(char)) singleQuoteStarted = true;
        }
    }

    const wordStarted = wordStart >= 0;
    if (char !== undefined && wordStarted) {
        const canEndWord = isLetter(char) || (!singleQuoteStarted && isApostrophe(char));
        if (canEndWord) return { boundary: range(inclusive(wordStart), exclusive(content.length)), singleQuoteStarted };
        if (!canEndWord)
            return { boundary: range(inclusive(wordStart), exclusive(content.length - 1)), singleQuoteStarted };
    }
    return { boundary: undefined, singleQuoteStarted };
};

/**
 *
 * @param {string} content
 * @returns {Range[]} A list of the index ranges for every word in the content.  [inclusive, exclusive]
 */
exports.censorableWords = (content) => {
    /** @type {Range[]} */
    const words = [];
    let wordBoundary;
    let _singleQuoteStarted = false;
    do {
        const { boundary, singleQuoteStarted } = findNextWordBoundary(
            content,
            wordBoundary?.endExclusive || 0,
            _singleQuoteStarted
        );
        wordBoundary = boundary;
        _singleQuoteStarted = singleQuoteStarted;
        if (wordBoundary !== undefined) {
            words.push(wordBoundary);
        }
    } while (wordBoundary !== undefined);
    return words;
};
