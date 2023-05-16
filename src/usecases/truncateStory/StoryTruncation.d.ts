import {
	IncorrectStoryModification,
	StoryNotFound,
	UnauthorizedStoryModification,
} from "../../entities/Game.Story.Exceptions";
import { GameNotFound } from "../../repositories/GameRepositoryExceptions";
import { Range } from "../../utils/range";
import { OutOfRange } from "../../validation/numbers";
import { IndexOutOfBounds } from "../validation";

export interface StoryTruncation {
	/**
	 *
	 * @param gameId the id of the game in which to truncate the story
	 * @param storyIndex the story in the game to truncate
	 * @param playerId the id of the player truncateing the story
	 * @param truncationCount the number of words to remove from the end of the story
	 * @throws
	 * - {@link TypeError} if the input does not meet expected types
	 * - {@link OutOfRange} if `truncationCount` is less than 1, greater than 7.
	 * - {@link IndexOutOfBounds} if `truncationCount` is greater than the number of available
	 * 							  words in the story entry.
	 * - {@link GameNotFound} if the game does not exist
	 * - {@link StoryNotFound} if the story does not exist in the game
	 * - {@link UnauthorizedStoryModification} if the player is not in the game, or is not
	 *                                         currently assigned to modify this story
	 * - {@link IncorrectStoryModification} if the player is assigned to modify the story, but
	 *                                      the story is in the wrong stage.
	 */
	truncateStory(
		gameId: string,
		storyIndex: number,
		playerId: string,
		truncationCount: number
	): Promise<StoryTruncated>;
}

export type StoryTruncated = {
	gameId: string;
	truncatedBy: string;
	storyIndex: number;
	truncatedContent: string;
	truncationBounds: Range;
};
