const { IndexOutOfBounds } = require("../usecases/validation");
const { param, mustBeType } = require("../validation");
const { eachValueOf, mustHaveLengthInRange } = require("../validation/arrays");
const { inclusive } = require("../validation/numbers");
const { InvalidPlayerActivity } = require("./Game.Exceptions");
const { PlayerActivity } = require("./Game.PlayerActivity");
const { StoryEntry } = require("./Game.Story.Entry");
const { StoryStatus, StoryStatusWithCorrespondingActivity } = require("./Game.Story.Status");
const { censorableWords } = require("./Words");
/** @typedef {import("./Game.Story.Entry").StoryEntrySnapshot} StoryEntrySnapshot */

/**
 * @typedef {object} StorySnapshot
 * @prop {StoryEntrySnapshot[]} entries
 * @prop {string[]} playerIds
 * @prop {StoryStatus} status
 */

/**
 * A story within a game.  Has multiple entries and is responsible for making sure that the correct player makes the correct change in the correct order.
 */
class Story {
    #entries;
    #playerIds;
    #status;

    /**
     * Start a new story.
     *
     * @param {string} content
     * @param {string} creatorId
     * @param {string[]} playerIds
     * @returns {Story}
     */
    static start(content, creatorId, playerIds) {
        param("content", content).isRequired().mustBeString();
        param("creatorId", creatorId).isRequired().mustBeString();
        this.#validatePlayerIds(playerIds);
        const firstEntry = StoryEntry.new(content, creatorId);
        const nextPlayer = Story.#getNextPlayerId(playerIds, creatorId);
        return new Story([firstEntry], playerIds, StoryStatus.Redact(nextPlayer, content));
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
     * @param {StoryEntrySnapshot[]} entries
     * @param {string[]} playerIds
     * @param {StoryStatus} status
     */
    constructor(entries, playerIds, status) {
        Story.#validateEntries(entries);
        Story.#validatePlayerIds(playerIds);
        this.#entries = entries.map((entry) => StoryEntry.fromSnapshot(entry));
        this.#playerIds = playerIds;
        this.#status = status;
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
     * @return {{ name: string }}
     */
    currentPlayerActivity(storyIndex) {
        if (this.#status instanceof StoryStatusWithCorrespondingActivity) {
            return this.#status.toPlayerActivity(storyIndex);
        }
        return PlayerActivity.AwaitingStory;
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
        };
    }

    toFinishedStory() {
        return this.#entries.map((entry) => entry.toFinishedEntry());
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
        if (!this.isAssignedTo(playerId)) throw new InvalidPlayerActivity();
    }

    /**
     *
     * @param {string} action
     */
    #ensureRequiresAction(action) {
        if (!this.requiresAction(action)) throw new InvalidPlayerActivity(action, this.requiredAction);
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
        this.#ensureRequiresAction("redact");

        const entry = this.#getEntryOrThrow(0);

        const { censoredContent, censors } = entry.censor(playerId, wordIndices);

        const nextPlayer = Story.#getNextPlayerId(this.#playerIds, this.assignedTo);

        this.#status = StoryStatus.RepairCensor(nextPlayer, censoredContent, censors);
    }

    /**
     *
     * @param {string} playerId
     * @param {number} truncationCount
     */
    truncate(playerId, truncationCount) {
        this.#ensureCurrentlyAssignedTo(playerId);
        this.#ensureRequiresAction("redact");

        const entry = this.#getEntryOrThrow(0);

        const { censoredContent, truncateFrom } = entry.truncate(playerId, truncationCount);

        const nextPlayer = Story.#getNextPlayerId(this.#playerIds, this.assignedTo);
        this.#status = StoryStatus.RepairTruncation(nextPlayer, censoredContent, truncateFrom);
    }

    /**
     *
     * @param {number} maxEntries
     * @param {string} playerId
     * @param {string | string[]} replacement
     */
    repair(maxEntries, playerId, replacement) {
        this.#ensureCurrentlyAssignedTo(playerId);
        this.#ensureRequiresAction("repair");

        const entry = this.#getEntryOrThrow(0);

        const repairedContent = entry.repair(playerId, replacement);

        if (this.#entries.length === maxEntries) {
            this.#status = StoryStatus.Completed;
        } else {
            const nextPlayer = Story.#getNextPlayerId(this.#playerIds, this.assignedTo);
            this.#status = StoryStatus.Continue(nextPlayer, repairedContent);
        }
    }

    /**
     *
     * @param {string} content
     * @param {string} playerId
     */
    continue(content, playerId) {
        this.#ensureCurrentlyAssignedTo(playerId);
        this.#ensureRequiresAction("continue");

        const newEntry = StoryEntry.new(content, playerId);
        const nextPlayer = Story.#getNextPlayerId(this.#playerIds, this.assignedTo);
        this.#status = StoryStatus.Redact(nextPlayer, this.#entries[0].initialContent);
        this.#entries.push(newEntry);
    }
}

exports.Story = Story;
