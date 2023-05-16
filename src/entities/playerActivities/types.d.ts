import { Range } from "../../utils/range";

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
