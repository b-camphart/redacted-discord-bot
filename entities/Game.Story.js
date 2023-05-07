const { param, mustBeType } = require("../validation");
const { eachValueOf, mustHaveLengthInRange } = require("../validation/arrays");
const { inclusive } = require("../validation/numbers");
const { InvalidPlayerActivity } = require("./Game.Exceptions");
const { PlayerActivity } = require("./Game.PlayerActivity");
const { StoryEntry } = require("./Game.Story.Entry");
const { StoryStatus, StoryStatusWithCorrespondingActivity } = require("./Game.Story.Status");
/** @typedef {import("./Game.Story.Entry").StoryEntrySnapshot} StoryEntrySnapshot */

/**
 * @typedef {object} StorySnapshot
 * @prop {StoryEntrySnapshot[]} entries
 * @prop {string[]} playerIds
 * @prop {StoryStatus} status
 */

class Story {
    #entries;
    #playerIds;
    #status;

    /**
     *
     * @param {string} content
     * @param {string} creatorId
     * @param {string[]} playerIds
     */
    static new(content, creatorId, playerIds) {
        param("content", content).isRequired().mustBeString();
        param("creatorId", creatorId).isRequired().mustBeString();
        param("playerIds", playerIds).isRequired().mustBeArray();
        const firstEntry = StoryEntry.new(content, creatorId);
        const nextPlayer = Story.#getNextPlayerId(playerIds, creatorId);
        return new Story([firstEntry], playerIds, StoryStatus.Redact(nextPlayer, content));
    }

    /**
     *
     * @param {StoryEntrySnapshot[]} entries
     * @param {string[]} playerIds
     * @param {StoryStatus} status
     */
    constructor(entries, playerIds, status) {
        const entriesParam = param("entries", entries).mustBeArray();
        mustHaveLengthInRange(entriesParam, inclusive(1));
        eachValueOf(entriesParam, (it) => {
            mustBeType("object", it.value, it.name);
            const contributorsProp = it.mustHaveProperty("contributors").mustBeArray();
            mustHaveLengthInRange(contributorsProp, inclusive(1));
            eachValueOf(contributorsProp, (it) => it.mustBeString());
            it.mustHaveProperty("initialContent").mustBeString();
        });
        eachValueOf(param("playerIds", playerIds).isRequired().mustBeArray(), (it) => it.mustBeString());
        this.#entries = entries.map((entry) => StoryEntry.fromSnapshot(entry));
        this.#playerIds = playerIds;
        this.#status = status;
    }

    /**
     *
     * @param {string} playerId
     * @returns
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
        return this.#entries[index].snapshot;
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
     * @param {string} currentPlayerId
     * @returns {string}
     */
    #getNextPlayer(currentPlayerId) {
        return Story.#getNextPlayerId(this.#playerIds, currentPlayerId);
    }

    /**
     *
     * @param {string} playerId
     * @param {number[]} wordIndices
     */
    censor(playerId, wordIndices) {
        if (!this.isAssignedTo(playerId) || !this.requiresAction("redact"))
            throw new InvalidPlayerActivity("redact", this.requiredAction);

        const entry = this.#entries[0];
        if (entry === undefined) throw "Entry not found in story.";

        const { censoredContent, censors } = entry.censor(playerId, wordIndices);

        const nextPlayer = this.#getNextPlayer(this.#status.playerId);

        this.#status = StoryStatus.RepairCensor(nextPlayer, censoredContent, censors);
    }

    /**
     *
     * @param {string} playerId
     * @param {number} truncationCount
     */
    truncate(playerId, truncationCount) {
        if (!this.isAssignedTo(playerId) || !this.requiresAction("redact"))
            throw new InvalidPlayerActivity("redact", this.requiredAction);

        const entry = this.#entries[0];
        if (entry === undefined) throw "Entry not found in story.";

        const { censoredContent, truncateFrom } = entry.truncate(playerId, truncationCount);
        const nextPlayer = this.#getNextPlayer(this.#status.playerId);
        this.#status = StoryStatus.RepairTruncation(nextPlayer, censoredContent, truncateFrom);
    }

    /**
     *
     * @param {number} maxEntries
     * @param {string} playerId
     * @param {string | string[]} replacement
     */
    repair(maxEntries, playerId, replacement) {
        if (!this.isAssignedTo(playerId) || !this.requiresAction("repair"))
            throw new InvalidPlayerActivity("repair", this.requiredAction);

        const entry = this.#entries[0];
        if (entry === undefined) throw "Entry not found in story.";

        const repairedContent = entry.repair(playerId, replacement);

        if (this.#entries.length === maxEntries) {
            this.#status = StoryStatus.Completed;
        } else {
            const nextPlayer = this.#getNextPlayer(this.#status.playerId);
            this.#status = StoryStatus.Continue(nextPlayer, repairedContent);
        }
    }

    /**
     *
     * @param {string} content
     * @param {string} playerId
     */
    continue(content, playerId) {
        if (!this.isAssignedTo(playerId) || !this.requiresAction("continue"))
            throw new InvalidPlayerActivity("continue", this.requiredAction);
        const nextPlayer = this.#getNextPlayer(this.#status.playerId);
        this.#status = StoryStatus.Redact(nextPlayer, this.#entries[0].initialContent);
        this.#entries.push(StoryEntry.new(content, playerId));
    }
}

exports.Story = Story;
