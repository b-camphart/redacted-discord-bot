const { IndexOutOfBounds } = require("../usecases/validation");
const { repeat } = require("../utils/iteration");
const { param } = require("../validation");
const { eachValueOf, mustHaveLength } = require("../validation/arrays");
const { mustBeLessThan } = require("../validation/numbers");
const { censorableWords } = require("./Words");

/**
 * @typedef {object} StoryEntrySnapshot
 * @prop {string} initialContent
 * @prop {string[]} contributors
 * @prop {[number, number][] | [number, number]} [censors]
 * @prop {string} [finalContent]
 */

class StoryEntry {
    /**
     *
     * @param {string} initialContent
     * @param {string} creatorId
     * @returns
     */
    static new(initialContent, creatorId) {
        param("initialContent", initialContent).isRequired().mustBeString();
        param("creatorId", creatorId).isRequired().mustBeString();
        return new StoryEntry(initialContent, [creatorId]);
    }

    /**
     *
     * @param {StoryEntrySnapshot} snapshot
     */
    static fromSnapshot(snapshot) {
        return new StoryEntry(snapshot.initialContent, snapshot.contributors, snapshot.censors, snapshot.finalContent);
    }

    /**
     *
     * @param {string} initialContent
     * @param {string[]} contributors
     * @param {[number, number][] | [number, number]} [censors]
     * @param {string} [finalContent]
     */
    constructor(initialContent, contributors, censors, finalContent) {
        const availableCensors = censorableWords(initialContent);
        if (availableCensors.length === 0) throw new Error("Content is empty of meaningful words.");

        this.initialContent = initialContent;
        this.contributors = contributors;
        this.censors = censors;
        this.finalContent = finalContent;
    }

    /**
     * @returns {StoryEntrySnapshot}
     */
    get snapshot() {
        return {
            initialContent: this.initialContent,
            contributors: this.contributors,
            censors: this.censors,
            finalContent: this.finalContent,
        };
    }

    /**
     *
     * @param {string} playerId
     * @param {number[]} wordIndices
     */
    censor(playerId, wordIndices) {
        const wordBoundaries = censorableWords(this.initialContent);
        const censors = this.#getCensoredWordBoundaries(wordIndices, wordBoundaries);
        const censoredContent = this.#censorInitialContent(censors);

        if (!Array.isArray(censors) || censors.length === 0 || !Array.isArray(censors[0])) {
            const report =
                "  Content: " +
                this.initialContent +
                "\n  wordBoundaries: " +
                JSON.stringify(wordBoundaries) +
                "\n  wordIndices: " +
                JSON.stringify(wordIndices);
            throw `Censors should be an array of arrays.  Found: <${JSON.stringify(censors)}>\n` + report;
        }

        this.censors = censors;
        this.contributors.push(playerId);

        return { censoredContent, censors };
    }

    /**
     *
     * @param {number[]} wordIndices
     * @param {[number, number][]} wordBoundaries
     * @returns
     */
    #getCensoredWordBoundaries(wordIndices, wordBoundaries) {
        eachValueOf(param("wordIndices", wordIndices).isRequired().mustBeArray(), (it) =>
            it.isRequired().mustBeNumber()
        );
        return wordIndices.map((wordIndex) => {
            if (wordIndex < 0 || wordIndex >= wordBoundaries.length) throw new IndexOutOfBounds("");
            return wordBoundaries[wordIndex];
        });
    }

    /**
     *
     * @param {[number, number][]} censors
     * @returns
     */
    #censorInitialContent(censors) {
        return censors.reduce((content, boundary) => {
            let censor = "";
            repeat(boundary[1] - boundary[0], () => (censor += "_"));
            return content.substring(0, boundary[0]) + censor + content.substring(boundary[1]);
        }, this.initialContent);
    }

    /**
     *
     * @param {string} playerId
     * @param {number} truncationCount
     *
     * @returns {{ censoredContent: string, truncateFrom: number }}
     */
    truncate(playerId, truncationCount) {
        const wordBoundaries = censorableWords(this.initialContent);
        mustBeLessThan(param("truncationCount", truncationCount).mustBeNumber(), wordBoundaries.length);

        const truncateFrom = wordBoundaries.at(-truncationCount)?.at(0);
        if (truncateFrom === undefined)
            throw `Illegal state.  Word boundaries does not have element at index ${-truncationCount}`;
        const censoredContent = this.#truncateInitialContent(truncateFrom);

        this.censors = /** @type {[number, number]} */ ([truncateFrom, censoredContent.length]);
        this.contributors.push(playerId);

        return { censoredContent, truncateFrom };
    }

    /**
     *
     * @param {number} truncateFrom
     */
    #truncateInitialContent(truncateFrom) {
        let censor = "";
        repeat(this.initialContent.length - truncateFrom, () => (censor += "_"));
        return this.initialContent.substring(0, truncateFrom) + censor;
    }

    /**
     *
     * @param {string} playerId
     * @param {string | string[]} replacement
     */
    repair(playerId, replacement) {
        const censors = this.#getCensorBoundariesOrThrow();

        let repairedContent;
        const expectingTruncation =
            censors.length === 2 && typeof censors[0] === "number" && typeof censors[1] === "number";
        if (expectingTruncation) {
            repairedContent = this.#repairTruncation(replacement, /** @type {[number, number]} */ (censors));
        } else {
            if (!Array.isArray(censors) || censors.length === 0 || !Array.isArray(censors[0])) {
                throw `Censors should be an array of arrays.  Found: <${JSON.stringify(censors)}>`;
            }
            repairedContent = this.#repairCensor(replacement, /** @type {[Number, number][]} */ (censors));
        }

        if (repairedContent === undefined) {
            throw "Did not properly repair the story entry.";
        }

        this.contributors.push(playerId);
        this.finalContent = repairedContent;

        return repairedContent;
    }

    /**
     *
     * @param {string | string[]} replacements
     * @param {[number, number][]} censors
     * @returns
     */
    #repairCensor(replacements, censors) {
        const replacementParam = param("replacements", replacements).isRequired().mustBeArray();
        eachValueOf(replacementParam, (it) => it.mustBeString());
        mustHaveLength(replacementParam, censors.length);
        replacements = /** @type {string[]} */ (replacementParam.value);

        const repairedContent = Array.from(censors)
            .reverse()
            .reduce((content, boundary, index) => {
                return (
                    content.substring(0, boundary[0]) +
                    replacements[censors.length - 1 - index] +
                    content.substring(boundary[1])
                );
            }, this.initialContent);

        censors.reduce((offset, boundary, index) => {
            const currentReplacement = replacements[index];
            censors[index] = [boundary[0] + offset, boundary[0] + offset + currentReplacement.length];

            return offset + (currentReplacement.length - (boundary[1] - boundary[0]));
        }, 0);
        return repairedContent;
    }

    /**
     *
     * @param {string | string[]} replacement
     * @param {[number, number]} censors
     * @returns
     */
    #repairTruncation(replacement, censors) {
        replacement = param("replacement", replacement).isRequired().mustBeString().value;
        const repairedContent = this.initialContent.substring(0, censors[0]) + replacement;

        censors[1] = repairedContent.length;
        return repairedContent;
    }

    #getCensorBoundariesOrThrow() {
        const censors = this.censors;
        if (censors === undefined) throw "Censors have not been defined yet.";
        return censors;
    }

    /**
     * @returns {import("./Game.PlayerActivity").FinishedStoryEntry}
     */
    toFinishedEntry() {
        if (this.finalContent === undefined) throw "Entry not yet finished.";
        if (this.censors === undefined) throw "Entry not yet finished.";
        return {
            content: this.finalContent,
            censors: /** @type {[number, number][]} */ (
                typeof this.censors[0] === "number" ? [this.censors] : this.censors
            ),
            contributors: this.contributors,
        };
    }
}

exports.StoryEntry = StoryEntry;
