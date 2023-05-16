const { IndexOutOfBounds } = require("../usecases/validation");
const { param } = require("../validation");
const { eachValueOf, mustHaveLengthInRange } = require("../validation/arrays");
const { inclusive } = require("../validation/numbers");
const { AwaitingStory } = require("./playerActivities");
const { StoryEntry } = require("./Game.Story.Entry");
const { UnauthorizedStoryModification, IncorrectStoryModification } = require("./Game.Story.Exceptions");
const { StoryStatus, StoryStatusWithCorrespondingActivity } = require("./Game.Story.Status");
const { range } = require("../utils/range");
/** @typedef {import("./Game.Story.Entry").StoryEntrySnapshot} StoryEntrySnapshot */

/**
 * @typedef {object} StorySnapshot
 * @prop {StoryEntrySnapshot[]} entries
 * @prop {string[]} playerIds
 * @prop {StoryStatus} status
 * @property {(playerId: string) => boolean} wasStartedBy
 */

/**
 * A story within a game.  Has multiple entries and is responsible for making sure that the correct player makes the correct change in the correct order.
 */
class Story {
	#gameId;
	#index;
	#entries;
	#playerIds;
	#status;

	/**
	 * Start a new story.
	 *
	 * @param {string} gameId
	 * @param {number} index
	 * @param {string} content
	 * @param {string} creatorId
	 * @param {string[]} playerIds
	 * @returns {Story}
	 */
	static start(gameId, index, content, creatorId, playerIds) {
		param("gameId", gameId).isRequired().mustBeString();
		param("index", index).isRequired().mustBeNumber();
		param("content", content).isRequired().mustBeString();
		param("creatorId", creatorId).isRequired().mustBeString();
		this.#validatePlayerIds(playerIds);
		const firstEntry = StoryEntry.new(content, creatorId);
		const nextPlayer = Story.#getNextPlayerId(playerIds, creatorId);
		return new Story(gameId, index, [firstEntry], playerIds, StoryStatus.Redact(nextPlayer, content));
	}

	/**
	 * Validates that the story entry snapshots is an array of objects with required fields.
	 *
	 * @param {StoryEntrySnapshot[]} entries
	 */
	static #validateEntries(entries) {
		const entriesParam = param("entries", entries).mustBeArray();
		mustHaveLengthInRange(entriesParam, inclusive(1));
		eachValueOf(entriesParam, (it) => {
			it.mustBeObject();
			it.mustHaveProperty("initialContent").mustBeString();
			const contributorsProp = it.mustHaveProperty("contributors").mustBeArray();
			mustHaveLengthInRange(contributorsProp, inclusive(1));
			eachValueOf(contributorsProp, (it) => it.mustBeString());
		});
	}

	/**
	 * Validates that the provided playerIds is an array of strings.
	 *
	 * @param {string[]} playerIds
	 */
	static #validatePlayerIds(playerIds) {
		eachValueOf(param("playerIds", playerIds).isRequired().mustBeArray(), (it) => it.mustBeString());
	}

	/**
	 *
	 * @param {string} gameId
	 * @param {number} index
	 * @param {StoryEntrySnapshot[]} entries
	 * @param {string[]} playerIds
	 * @param {StoryStatus} status
	 */
	constructor(gameId, index, entries, playerIds, status) {
		param("gameId", gameId).isRequired().mustBeString();
		param("index", index).isRequired().mustBeNumber();
		Story.#validateEntries(entries);
		Story.#validatePlayerIds(playerIds);
		this.#entries = entries.map((entry) => StoryEntry.fromSnapshot(entry));
		this.#playerIds = playerIds;
		this.#status = status;
		this.#gameId = gameId;
		this.#index = index;
	}

	/**
	 *
	 * @param {string} playerId
	 * @returns {boolean}
	 */
	wasStartedBy(playerId) {
		return this.#entries[0].contributors[0] === playerId;
	}

	/**
	 *
	 * @param {number} index
	 * @returns {StoryEntrySnapshot | undefined}
	 */
	entry(index) {
		if (index < 0 || index > this.#entries.length)
			throw new IndexOutOfBounds(`${index} is out of bounds [0 .. ${this.#entries.length}]`);
		return this.#entries[index]?.snapshot;
	}

	/**
	 *
	 * @returns {StoryEntrySnapshot[]}
	 */
	entries() {
		return this.#entries.map((entry) => entry.snapshot);
	}

	/**
	 *
	 * @param {number} storyIndex
	 * @returns {import("./playerActivities/types").PlayerActivity}
	 */
	currentPlayerActivity(storyIndex) {
		if (this.#status instanceof StoryStatusWithCorrespondingActivity) {
			return this.#status.toPlayerActivity(storyIndex);
		}
		return AwaitingStory;
	}

	/**
	 *
	 * @param {string} playerId
	 * @returns {boolean}
	 */
	isAssignedTo(playerId) {
		return this.assignedTo === playerId;
	}

	get assignedTo() {
		return this.#status.playerId;
	}

	get isCompleted() {
		return this.#status === StoryStatus.Completed;
	}

	get requiredAction() {
		return this.#status.action;
	}

	/**
	 *
	 * @param {string} action
	 * @returns
	 */
	requiresAction(action) {
		return this.requiredAction === action;
	}

	/**
	 * @returns {StorySnapshot}
	 */
	get snapshot() {
		return {
			entries: this.entries(),
			playerIds: Array.from(this.#playerIds),
			status: this.#status,
			wasStartedBy: (playerId) => this.#entries[0].contributors[0] === playerId,
		};
	}

	/**
	 *
	 * @returns {import("./playerActivities/types").FinishedStory}
	 */
	toFinishedStory() {
		return {
			entries: this.#entries.map((entry) => entry.toFinishedEntry()),
		};
	}

	/**
	 * @param {string[]} playerIds
	 * @param {string} currentPlayerId
	 * @returns {string}
	 */
	static #getNextPlayerId(playerIds, currentPlayerId) {
		const currentPlayerIndex = playerIds.indexOf(currentPlayerId);
		const nextPlayerIndex = currentPlayerIndex + 1;
		let nextPlayerId;
		if (nextPlayerIndex === playerIds.length) nextPlayerId = playerIds[0];
		else {
			nextPlayerId = playerIds[nextPlayerIndex];
		}
		return nextPlayerId;
	}

	/**
	 *
	 * @param {string} playerId
	 */
	#ensureCurrentlyAssignedTo(playerId) {
		if (!this.isAssignedTo(playerId)) throw new UnauthorizedStoryModification(this.#gameId, this.#index, playerId);
	}

	/**
	 *
	 * @param {string} playerId
	 * @param {string} action
	 */
	#ensureRequiresAction(playerId, action) {
		if (!this.requiresAction(action))
			throw new IncorrectStoryModification(this.#gameId, this.#index, playerId, this.requiredAction, action);
	}

	/**
	 *
	 * @param {number} entryIndex
	 */
	#getEntryOrThrow(entryIndex) {
		const entry = this.#entries[entryIndex];
		if (entry === undefined) throw "Entry not found in story.";
		return entry;
	}

	/**
	 *
	 * @param {string} playerId
	 * @param {number[]} wordIndices
	 */
	censor(playerId, wordIndices) {
		this.#ensureCurrentlyAssignedTo(playerId);
		this.#ensureRequiresAction(playerId, "redact");

		const entry = this.#getEntryOrThrow(this.#entries.length - 1);

		const { censoredContent, censors } = entry.censor(playerId, wordIndices);

		const nextPlayer = Story.#getNextPlayerId(this.#playerIds, this.assignedTo);

		this.#status = StoryStatus.RepairCensor(nextPlayer, censoredContent, censors);

		return {
			censoredContent,
			censorBounds: censors,
			censoredBy: playerId,
		};
	}

	/**
	 *
	 * @param {string} playerId
	 * @param {number} truncationCount
	 */
	truncate(playerId, truncationCount) {
		this.#ensureCurrentlyAssignedTo(playerId);
		this.#ensureRequiresAction(playerId, "redact");

		const entry = this.#getEntryOrThrow(this.#entries.length - 1);

		const { censoredContent, truncateFrom } = entry.truncate(playerId, truncationCount);

		const nextPlayer = Story.#getNextPlayerId(this.#playerIds, this.assignedTo);
		this.#status = StoryStatus.RepairTruncation(nextPlayer, censoredContent, truncateFrom);
		return {
			truncatedContent: censoredContent,
			truncationBounds: range(truncateFrom, censoredContent.length),
		};
	}

	/**
	 *
	 * @param {number} maxEntries
	 * @param {string} playerId
	 * @param {string[]} replacements
	 */
	repairCensor(maxEntries, playerId, replacements) {
		this.#ensureCurrentlyAssignedTo(playerId);
		this.#ensureRequiresAction(playerId, "repair");

		const entry = this.#getEntryOrThrow(this.#entries.length - 1);

		const repairedContent = entry.repairCensor(playerId, replacements);

		if (this.#entries.length === maxEntries) {
			this.#status = StoryStatus.Completed;
		} else {
			const nextPlayer = Story.#getNextPlayerId(this.#playerIds, this.assignedTo);
			this.#status = StoryStatus.Continue(nextPlayer, repairedContent);
		}

		return repairedContent;
	}

	/**
	 *
	 * @param {number} maxEntries
	 * @param {string} playerId
	 * @param {string} replacement
	 */
	repairTruncation(maxEntries, playerId, replacement) {
		this.#ensureCurrentlyAssignedTo(playerId);
		this.#ensureRequiresAction(playerId, "repair");

		const entry = this.#getEntryOrThrow(this.#entries.length - 1);

		const repairedContent = entry.repairTruncation(playerId, replacement);

		if (this.#entries.length === maxEntries) {
			this.#status = StoryStatus.Completed;
		} else {
			const nextPlayer = Story.#getNextPlayerId(this.#playerIds, this.assignedTo);
			this.#status = StoryStatus.Continue(nextPlayer, repairedContent);
		}

		return repairedContent;
	}

	/**
	 *
	 * @param {string} content
	 * @param {string} playerId
	 */
	continue(content, playerId) {
		this.#ensureCurrentlyAssignedTo(playerId);
		this.#ensureRequiresAction(playerId, "continue");

		const newEntry = StoryEntry.new(content, playerId);
		const nextPlayer = Story.#getNextPlayerId(this.#playerIds, this.assignedTo);
		this.#status = StoryStatus.Redact(nextPlayer, this.#entries[0].initialContent);
		this.#entries.push(newEntry);
	}
}

exports.Story = Story;
