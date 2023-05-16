const { Story } = require("./Game.Story");
const { param } = require("../validation");
const { eachValueOf } = require("../validation/arrays");
const { UnauthorizedGameModification, GameNotStarted, ConflictingStory } = require("./Game.Exceptions");
const { UnauthorizedStoryModification, StoryNotFound } = require("./Game.Story.Exceptions");
const { AwaitingGameStart, StartingStory, AwaitingStory, ReadingFinishedStories } = require("./playerActivities");
/** @typedef {import("./Game.Story").StorySnapshot} StorySnapshot */
/**
 * @template {string | undefined} T
 * @typedef {import("./types").Game<T>} IGame
 */

/**
 * @template {string | undefined} ID
 * @implements {IGame<ID>}
 */
class Game {
	/** @type {ID} */
	id;
	/** @type {string[]} */
	#users;
	#isStarted;
	/** @type {Story[]} */
	#stories;

	/**
	 *
	 * @param {string} [id]
	 * @param {string[]} [users]
	 * @param {boolean} [isStarted]
	 * @param {StorySnapshot[]} [stories]
	 * @param {number} [maxStoryEntries]
	 */
	constructor(id = undefined, users = [], isStarted = false, stories = [], maxStoryEntries = 6) {
		// @ts-ignore
		this.id = id;
		this.#users = Array.from(users);
		this.#isStarted = isStarted;
		this.#stories = stories.map(
			(story, index) => new Story(id || "", index, story.entries, this.#users, story.status)
		);
		this.maxStoryEntries = maxStoryEntries;
	}

	/**
	 * @param {string} userId the id of the user to add to the game
	 */
	addPlayer(userId) {
		if (this.hasPlayer(userId)) return;
		this.#users.push(userId);
		return this;
	}

	/**
	 * @returns {string[]} the ids of users ids that have been added to the game so far.
	 */
	get playerIds() {
		const usersCopy = Array.from(this.#users);
		return usersCopy;
	}

	/**
	 * Checks if the userId is in the game.
	 * @param {string} userId The user id to check
	 * @returns {boolean} `true` if the user is in the game, `false` otherwise.
	 */
	hasPlayer(userId) {
		return this.#users.find((id) => id === userId) !== undefined;
	}

	/**
	 *
	 * @param {string} userId
	 * @return {import("./playerActivities/types").PlayerActivity | undefined}
	 */
	playerActivity(userId) {
		if (!this.hasPlayer(userId)) return undefined;
		if (!this.#isStarted) return AwaitingGameStart;

		const playerHasNotStartedAStory = this.#stories.every((story) => !story.wasStartedBy(userId));
		if (playerHasNotStartedAStory) return StartingStory;

		const storyForPlayer = this.#stories.find((story) => story.isAssignedTo(userId));
		const playerHasNoAssignedStory = storyForPlayer === undefined;
		if (playerHasNoAssignedStory) return this.#noAssignedStory();

		return storyForPlayer.currentPlayerActivity(this.#stories.indexOf(storyForPlayer));
	}

	#noAssignedStory() {
		const everyStoryIsCompleted = this.#stories.every((story) => story.isCompleted);
		if (everyStoryIsCompleted)
			return new ReadingFinishedStories(this.#stories.map((story) => story.toFinishedStory()));
		return AwaitingStory;
	}

	get isStarted() {
		return this.#isStarted;
	}

	get isCompleted() {
		return this.#stories.every((story) => story.isCompleted);
	}

	get stories() {
		return this.#stories.map((story) => story.snapshot);
	}

	start(maximumEntriesPerStory = 6) {
		if (this.#isStarted) return;
		this.maxStoryEntries = maximumEntriesPerStory;
		this.#isStarted = true;
		return this;
	}

	/**
	 *
	 * @param {string} playerId
	 * @param {string} content
	 *
	 * @returns {number}
	 */
	startStory(playerId, content) {
		if (!this.hasPlayer(playerId)) throw new UnauthorizedGameModification(this.id || "", playerId);
		if (!this.isStarted) throw new GameNotStarted(this.id || "");

		const existingStory = this.#stories.find((story) => story.wasStartedBy(playerId));
		if (existingStory !== undefined)
			throw new ConflictingStory(
				this.id || "",
				playerId,
				existingStory?.entries()?.at(0)?.initialContent || "",
				content
			);

		const storyIndex = this.#stories.length;
		this.#stories.push(Story.start(this.id || "", storyIndex, content, playerId, this.#users));
		return storyIndex;
	}

	/**
	 *
	 * @param {number} storyIndex
	 * @param {number} entryIndex
	 * @return {string | undefined} The content of the entry of the story, or undefined if the story, or entry, are not in the game.
	 */
	storyEntry(storyIndex, entryIndex) {
		const entry = this.#stories[storyIndex]?.entry(entryIndex);
		if (entry === undefined) return undefined;
		if (entry.finalContent !== undefined) return entry.finalContent;
		return entry?.initialContent;
	}

	/**
	 *
	 * @param {number} storyIndex
	 */
	actionRequiredInStory(storyIndex) {
		return this.#stories[storyIndex]?.requiredAction;
	}

	/**
	 *
	 * @param {number} storyIndex
	 */
	playerAssignedToStory(storyIndex) {
		return this.#stories[storyIndex]?.assignedTo;
	}

	/**
	 *
	 * @param {string} playerId
	 * @param {number} storyIndex
	 */
	#getStoryIfValidated(playerId, storyIndex) {
		param("playerId", playerId).isRequired().mustBeString();
		param("storyIndex", storyIndex).isRequired().mustBeNumber();
		if (!this.hasPlayer(playerId)) throw new UnauthorizedStoryModification(this.id || "", storyIndex, playerId);
		if (!this.isStarted) throw new GameNotStarted(this.id || "");
		const story = this.#stories[storyIndex];
		if (story === undefined) throw new StoryNotFound(this.id || "", storyIndex);
		return story;
	}

	/**
	 *
	 * @param {string} playerId
	 * @param {number} storyIndex
	 * @param {number[]} wordIndices
	 * @returns {UseCases.StoryCensored}
	 */
	censorStory(playerId, storyIndex, wordIndices) {
		eachValueOf(param("wordIndices", wordIndices).isRequired().mustBeArray(), (it) =>
			it.isRequired().mustBeNumber()
		);
		const story = this.#getStoryIfValidated(playerId, storyIndex);
		const censored = story.censor(playerId, wordIndices);
		return { ...censored, storyIndex, gameId: this.id || "" };
	}

	/**
	 *
	 * @param {string} playerId
	 * @param {number} storyIndex
	 * @param {number} truncationCount
	 */
	truncateStory(playerId, storyIndex, truncationCount) {
		param("truncationCount", truncationCount).isRequired().mustBeNumber();
		const story = this.#getStoryIfValidated(playerId, storyIndex);
		return story.truncate(playerId, truncationCount);
	}

	/**
	 *
	 * @param {string} playerId
	 * @param {number} storyIndex
	 * @param {string[]} replacements
	 */
	repairCensoredStory(playerId, storyIndex, replacements) {
		const story = this.#getStoryIfValidated(playerId, storyIndex);
		return story.repairCensor(this.maxStoryEntries, playerId, replacements);
	}

	/**
	 * {@link IGame.repairTruncatedStory}
	 *
	 * @param {string} playerId
	 * @param {number} storyIndex
	 * @param {string} replacement
	 */
	repairTruncatedStory(playerId, storyIndex, replacement) {
		const story = this.#getStoryIfValidated(playerId, storyIndex);
		return story.repairTruncation(this.maxStoryEntries, playerId, replacement);
	}

	/**
	 * @deprecated
	 *
	 * @param {string} playerId
	 * @param {number} storyIndex
	 * @param {string | string[]} replacements
	 */
	repairStory(playerId, storyIndex, replacements) {
		if (typeof replacements === "string") return this.repairTruncatedStory(playerId, storyIndex, replacements);
		return this.repairCensoredStory(playerId, storyIndex, replacements);
	}

	/**
	 *
	 * @param {string} playerId
	 * @param {number} storyIndex
	 * @param {string} content
	 */
	continueStory(playerId, storyIndex, content) {
		param("content", content).isRequired().mustBeString();
		const story = this.#getStoryIfValidated(playerId, storyIndex);
		story.continue(content, playerId);
	}
}

class UserInGame {
	#id;

	/**
	 *
	 * @param {string} id
	 */
	constructor(id) {
		this.#id = id;
	}

	id() {
		return this.#id;
	}
}

module.exports = {
	Game,
	UserInGame,
};
