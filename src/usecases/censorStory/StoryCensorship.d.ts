import {
	IncorrectStoryModification,
	StoryNotFound,
	UnauthorizedStoryModification,
} from "../../entities/Game.Story.Exceptions";
import { GameNotFound } from "../../repositories/GameRepositoryExceptions";
import { Range } from "../../utils/range";
import { OutOfRange } from "../../validation/numbers";

export interface StoryCensorship {
	/**
	 *
	 * @param gameId the id of the game in which to censor the story
	 * @param storyIndex the story in the game to censor
	 * @param playerId the id of the player censoring the story
	 * @param wordIndices the indices of the words within the story entry's content to censor
	 * @throws
	 * - {@link TypeError} if the input does not meet expected types
	 * - {@link OutOfRange} if `wordIndices` is empty, has more than 3 elements, or has more
	 *                      elements than there are available words to censor in the story entry
	 * - {@link GameNotFound} if the game does not exist
	 * - {@link StoryNotFound} if the story does not exist in the game
	 * - {@link IndexOutOfBounds} if any index in `wordIndices` is less than `0`, or greater
	 *                            than the number of available words to censor in the story entry
	 * - {@link UnauthorizedStoryModification} if the player is not in the game, or is not
	 *                                         currently assigned to modify this story
	 * - {@link IncorrectStoryModification} if the player is assigned to modify the story, but
	 *                                      the story is in the wrong stage.
	 */
	censorStory(gameId: string, storyIndex: number, playerId: string, wordIndices: number[]): Promise<StoryCensored>;
}

export type StoryCensored = {
	gameId: string;
	storyIndex: number;
	censoredBy: string;
	censoredContent: string;
	censorBounds: Range[];
};
