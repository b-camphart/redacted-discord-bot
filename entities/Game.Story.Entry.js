const { IndexOutOfBounds } = require("../usecases/validation");
const { repeat } = require("../utils/iteration");
const { param } = require("../validation");
const { eachValueOf, mustHaveLength } = require("../validation/arrays");
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

        wordIndices.forEach((wordIndex) => {
            if (wordIndex < 0 || wordIndex >= wordBoundaries.length) throw new IndexOutOfBounds("");
        });

        const censors = wordIndices.map((index) => wordBoundaries[index]);

        let censoredContent = this.initialContent;
        censors.forEach((boundary) => {
            let censor = "";
            repeat(boundary[1] - boundary[0], () => (censor += "_"));
            censoredContent =
                censoredContent.substring(0, boundary[0]) + censor + censoredContent.substring(boundary[1]);
        });

        this.censors = censors;
        this.contributors.push(playerId);

        return { censoredContent, censors };
    }

    /**
     *
     * @param {string} playerId
     * @param {number} truncationCount
     */
    truncate(playerId, truncationCount) {
        const wordBoundaries = censorableWords(this.initialContent);

        if (truncationCount >= wordBoundaries.length)
            throw new IndexOutOfBounds(`truncationCount must be less than <${wordBoundaries.length}>.`);

        const truncateFrom = wordBoundaries.at(-truncationCount)?.at(0);
        if (truncateFrom === undefined) throw "Could not find index to truncate from.";
        let censor = "";
        repeat(this.initialContent.length - truncateFrom, () => (censor += "_"));
        const censoredContent = this.initialContent.substring(0, truncateFrom) + censor;

        // @ts-ignore
        this.censors = [truncateFrom, censoredContent.length];
        this.contributors.push(playerId);

        return { censoredContent, truncateFrom };
    }

    /**
     *
     * @param {string} playerId
     * @param {string | string[]} replacement
     */
    repair(playerId, replacement) {
        let repairedContent = this.initialContent;

        const censors = this.censors;
        if (censors === undefined) throw "Censors have not been defined yet.";

        if (censors.length === 2 && typeof censors[0] === "number" && typeof censors[1] === "number") {
            replacement = /** @type {string} */ (param("replacement", replacement).isRequired().mustBeString().value);
            repairedContent = repairedContent.substring(0, censors[0]) + replacement;

            /** @type {[number, number]} */ (censors)[1] = repairedContent.length;
        } else {
            const replacementParam = param("replacements", replacement).isRequired().mustBeArray();
            eachValueOf(replacementParam, (it) => it.mustBeString());
            mustHaveLength(replacementParam, censors.length);
            replacement = /** @type {string[]} */ (replacementParam.value);

            Array.from(/** @type {[Number, number][]} */ (censors))
                .reverse()
                .forEach((boundary, index) => {
                    repairedContent =
                        repairedContent.substring(0, boundary[0]) +
                        replacement[index] +
                        repairedContent.substring(boundary[1]);
                });

            /** @type {[Number, number][]} */ (censors).reduce((offset, boundary, index) => {
                const currentReplacement = replacement[index];
                censors[index] = [boundary[0] + offset, boundary[0] + offset + currentReplacement.length];

                return offset + (currentReplacement.length - (boundary[1] - boundary[0]));
            }, 0);
        }

        this.contributors.push(playerId);
        this.finalContent = repairedContent;

        return repairedContent;
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
