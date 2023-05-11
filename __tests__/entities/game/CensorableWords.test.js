// want to know how many words there are
// want to know the bounds of each word, by index
// return value should look something like: [[number, number]]

const { censorableWords } = require("../../../src/entities/Words");
const { exclusive, inclusive, range } = require("../../../src/utils/range");

test("no censorable words", () => {
    expect(censorableWords("")).toEqual([]);
    expect(censorableWords("   ")).toEqual([]);
    expect(censorableWords(" \n  ")).toEqual([]);
    expect(censorableWords('" " . ?  ! ( ) [ ] < > - - + _ =')).toEqual([]);
});

test("one censorable word", () => {
    expect(censorableWords("hello!")).toEqual(censoredIndices("_____!"));
    expect(censorableWords("  hello! ")).toEqual(censoredIndices("  _____! "));
    expect(censorableWords("  hello")).toEqual(censoredIndices("  _____"));
});

test("two censorable words", () => {
    expect(censorableWords("  Hello, there! ")).toEqual(censoredIndices("  _____, _____! "));
});

test("contractions", () => {
    expect(censorableWords("\"I'm quoting Bob: 'I can't swim!' \"")).toEqual(
        censoredIndices("\"___ _______ ___: '_ _____ ____!' \"")
    );
    expect(censorableWords("'Simple quote'")).toEqual(censoredIndices("'______ _____'"));
    expect(censorableWords("'The words' censors can be tricky'")).toEqual(
        censoredIndices("'___ ______ _______ ___ __ ______'")
    );
    expect(censorableWords("'The words' censors can be tricky!'")).toEqual(
        censoredIndices("'___ ______ _______ ___ __ ______!'")
    );
    expect(censorableWords("This bad grammar is the words'")).toEqual(
        censoredIndices("____ ___ _______ __ ___ ______")
    );
});

/**
 *
 * @param {string} censoredContent
 * @returns
 */
const censoredIndices = (censoredContent) => {
    let censorStart = -1;
    const censors = [];
    for (let charIndex = 0; charIndex < censoredContent.length; charIndex++) {
        const char = censoredContent.charAt(charIndex);
        if (char !== "_") {
            if (censorStart >= 0) censors.push(range(inclusive(censorStart), exclusive(charIndex)));
            censorStart = -1;
            continue;
        }
        if (censorStart < 0) censorStart = charIndex;
    }
    if (censorStart >= 0) censors.push(range(inclusive(censorStart), exclusive(censoredContent.length)));
    return censors;
};
