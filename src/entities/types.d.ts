import { Range } from "../utils/range";
import { StorySnapshot } from "./Game.Story";
import { PlayerActivity } from "./playerActivities/types";

export interface Game<ID extends string | undefined> {
	id: ID;

	readonly playerIds: string[];
	addPlayer(playerId: string): Game<ID> | undefined;
	hasPlayer(playerId: string): boolean;
	playerActivity(playerId: string): PlayerActivity | undefined;

	readonly isStarted: boolean;
	readonly isCompleted: boolean;
	/**
	 * @throws {GameAlreadyStarted} if the game was already started
	 */
	start(maximumEntriesPerStory?: number): Game<ID> | undefined;
	readonly maxStoryEntries?: number;

	readonly stories: StorySnapshot[];
	/**
	 *
	 * @param playerId the id of the player starting the story
	 * @param content the content of the new story
	 *
	 * @returns the index of the newly created story
	 */
	startStory(playerId: string, content: string): number;
	actionRequiredInStory(storyIndex: number): string | undefined;
	playerAssignedToStory(storyIndex: number): string | undefined;
	storyEntry(storyIndex: number, entryIndex: number): string | undefined;

	censorStory(playerId: string, storyIndex: number, wordIndices: number[]): UseCases.StoryCensored;
	truncateStory(
		playerId: string,
		storyIndex: number,
		truncationCount: number
	): {
		truncatedContent: string;
		truncationBounds: Range;
	};
	repairCensoredStory(playerId: string, storyIndex: number, replacements: string[]): string;
	repairTruncatedStory(playerId: string, storyIndex: number, replacement: string): string;

	/**
	 * @deprecated use repairCensoredStory instead
	 */
	repairStory(playerId: string, storyIndex: number, replacements: string[]): void;
	/**
	 * @deprecated use repairTruncatedStory instead
	 */
	repairStory(playerId: string, storyIndex: number, replacement: string): void;

	continueStory(playerId: string, storyIndex: number, content: string): void;
}

export type GameWithId = Game<string>;
