import { Range } from "../utils/range";
import { StorySnapshot } from "./Game.Story";

export interface Game<ID extends string | undefined> {
    id: ID;

    readonly playerIds: string[];
    addPlayer(playerId: string): void;
    hasPlayer(playerId: string): boolean;
    playerActivity(playerId: string): PlayerActivity | undefined;

    readonly isStarted: boolean;
    readonly isCompleted: boolean;
    /**
     * @throws {GameAlreadyStarted} if the game was already started
     */
    start(maximumEntriesPerStory?: number): void;
    readonly maxStoryEntries?: number;

    readonly stories: StorySnapshot[];
    startStory(playerId: string, content: string): void;
    actionRequiredInStory(storyIndex: number): string | undefined;
    playerAssignedToStory(storyIndex: number): string | undefined;
    storyEntry(storyIndex: number, entryIndex: number): string | undefined;

    censorStory(playerId: string, storyIndex: number, wordIndices: number[]): void;
    truncateStory(playerId: string, storyIndex: number, truncationCount: number): void;
    repairStory(playerId: string, storyIndex: number, replacements: string[]): void;
    repairStory(playerId: string, storyIndex: number, replacement: string): void;
    continueStory(playerId: string, storyIndex: number, content: string): void;
}

export type GameWithId = Game<string>;

export interface PlayerActivity {
    accept<T>(visitor: PlayerActivityVisitor<T>): T;
}

export interface PlayerActivityVisitor<T> {
    awaitingGameStart(): T;
    awaitingStory(): T;
    startingStory(): T;
    redactingStory(content: string, possibleRedactions: Range[], storyIndex: number): T;
    repairingCensor(content: string, redactions: Range[], storyIndex: number): T;
    repairingTruncation(content: string, truncatedFrom: number, storyIndex: number): T;
    continuingStory(repairedContent: string, storyIndex: number): T;
    readingFinishedStories(stories: FinishedStory[]): T;
}

export interface FinishedStory {
    entries: FinishedStoryEntry[];
}

export interface FinishedStoryEntry {
    repairedContent: string;
    redactions: Range[];
    contributors: string[];
}
