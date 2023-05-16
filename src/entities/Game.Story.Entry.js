const { IndexOutOfBounds } = require("../usecases/validation");
const { repeat } = require("../utils/iteration");
const { Range, range, inclusive, exclusive } = require("../utils/range");
const { param } = require("../validation");
const { eachValueOf, mustHaveLength } = require("../validation/arrays");
const { mustBeLessThan, OutOfRange } = require("../validation/numbers");
const { IncorrectStoryModification, InvalidWordCount } = require("./Game.Story.Exceptions");
const { censorableWords } = require("./Words");

/**
 * @typedef {object} StoryEntrySnapshot
 * @prop {string} initialContent
 * @prop {string[]} contributors
 * @prop {{type: "censor", bounds: Range[]} | {type: "truncate", range: Range}} [redaction]
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
		return new StoryEntry(
			snapshot.initialContent,
			snapshot.contributors,
			snapshot.redaction,
			snapshot.finalContent
		);
	}

	/**
	 *
	 * @param {string} initialContent
	 * @param {string[]} contributors
	 * @param {{type: "censor", bounds: Range[]} | {type: "truncate", range: Range}} [redaction]
	 * @param {string} [finalContent]
	 */
	constructor(initialContent, contributors, redaction, finalContent) {
		const availableCensors = censorableWords(initialContent);
		if (availableCensors.length <= 1) throw new Error("Content is empty of meaningful words.");

		this.initialContent = initialContent;
		this.contributors = contributors;
		this.redaction = redaction;
		this.finalContent = finalContent;
	}

	/**
	 * @returns {StoryEntrySnapshot}
	 */
	get snapshot() {
		return {
			initialContent: this.initialContent,
			contributors: this.contributors,
			redaction: this.redaction,
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
		if (wordIndices.length >= wordBoundaries.length)
			throw new OutOfRange("May not censor all the words in the story entry.");

		const censors = this.#getCensoredWordBoundaries(wordIndices, wordBoundaries);
		const censoredContent = this.#censorInitialContent(censors);

		if (!Array.isArray(censors) || censors.length === 0 || !(censors[0] instanceof Range)) {
			const report =
				"  Content: " +
				this.initialContent +
				"\n  wordBoundaries: " +
				JSON.stringify(wordBoundaries) +
				"\n  wordIndices: " +
				JSON.stringify(wordIndices);
			throw `Censors should be an array of ranges.  Found: <${JSON.stringify(censors)}>\n` + report;
		}

		this.redaction = { type: "censor", bounds: censors };
		this.contributors.push(playerId);

		return { censoredContent, censors };
	}

	/**
	 *
	 * @param {number[]} wordIndices
	 * @param {Range[]} wordBoundaries
	 * @returns
	 */
	#getCensoredWordBoundaries(wordIndices, wordBoundaries) {
		eachValueOf(param("wordIndices", wordIndices).isRequired().mustBeArray(), (it) =>
			it.isRequired().mustBeNumber()
		);
		return Array.from(new Set(wordIndices)).map((wordIndex) => {
			if (wordIndex < 0 || wordIndex >= wordBoundaries.length) throw new IndexOutOfBounds("");
			return wordBoundaries[wordIndex];
		});
	}

	/**
	 *
	 * @param {Range[]} censors
	 * @returns
	 */
	#censorInitialContent(censors) {
		return censors.reduce((content, boundary) => {
			let censor = "";
			repeat(boundary.size, () => (censor += "_"));
			return content.substring(0, boundary.start) + censor + content.substring(boundary.endExclusive);
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

		const truncateFrom = wordBoundaries.at(-truncationCount)?.start;
		if (truncateFrom === undefined)
			throw `Illegal state.  Word boundaries does not have element at index ${-truncationCount}`;
		const censoredContent = this.#truncateInitialContent(truncateFrom);

		this.redaction = { type: "truncate", range: range(inclusive(truncateFrom), exclusive(censoredContent.length)) };
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
	 * @param {string[]} replacements
	 */
	repairCensor(playerId, replacements) {
		const redaction = this.#getRedactionOrThrow();
		if (redaction.type === "truncate") throw new IncorrectStoryModification("", -1, playerId, "truncate", "censor");
		const repairedContent = this.#repairCensor(replacements, redaction.bounds);

		this.contributors.push(playerId);
		this.finalContent = repairedContent;

		return repairedContent;
	}

	/**
	 *
	 * @param {string} playerId
	 * @param {string} replacement
	 */
	repairTruncation(playerId, replacement) {
		const redaction = this.#getRedactionOrThrow();
		if (redaction.type === "censor") throw new IncorrectStoryModification("", -1, playerId, "truncate", "censor");
		const repairedContent = this.#repairTruncation(replacement, redaction.range);

		this.contributors.push(playerId);
		this.finalContent = repairedContent;

		return repairedContent;
	}

	/**
	 *
	 * @param {string | string[]} replacements
	 * @param {Range[]} censors
	 * @returns
	 */
	#repairCensor(replacements, censors) {
		if (replacements.length !== censors.length) throw new InvalidWordCount("", -1, 2, replacements.length);

		const repairedContent = Array.from(censors)
			.reverse()
			.reduce((content, boundary, index) => {
				return (
					content.substring(0, boundary.start) +
					replacements[censors.length - 1 - index] +
					content.substring(boundary.endExclusive)
				);
			}, this.initialContent);

		censors.reduce((offset, boundary, index) => {
			const currentReplacement = replacements[index];
			censors[index] = range(
				inclusive(boundary.start + offset),
				exclusive(boundary.start + offset + currentReplacement.length)
			);

			return offset + (currentReplacement.length - boundary.size);
		}, 0);
		return repairedContent;
	}

	/**
	 *
	 * @param {string | string[]} replacement
	 * @param {Range} truncatedRange
	 * @returns
	 */
	#repairTruncation(replacement, truncatedRange) {
		replacement = param("replacement", replacement).isRequired().mustBeString().value;
		const repairedContent = this.initialContent.substring(0, truncatedRange.start) + replacement;

		truncatedRange.endExclusive = repairedContent.length;
		return repairedContent;
	}

	#getRedactionOrThrow() {
		const redaction = this.redaction;
		if (redaction === undefined) throw "Redaction has not been defined yet.";
		return redaction;
	}

	/**
	 * @returns {import("./playerActivities/types").FinishedStoryEntry}
	 */
	toFinishedEntry() {
		if (this.finalContent === undefined) throw "Entry not yet finished.";
		if (this.redaction === undefined) throw "Entry not yet finished.";
		return {
			repairedContent: this.finalContent,
			redactions: this.redaction.type === "censor" ? this.redaction.bounds : [this.redaction.range],
			contributors: this.contributors,
		};
	}
}

exports.StoryEntry = StoryEntry;
