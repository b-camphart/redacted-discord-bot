import {
	IncorrectStoryModification,
	InvalidWordCount,
	StoryNotFound,
	UnauthorizedStoryModification,
} from "../../entities/Game.Story.Exceptions";
import { GameNotStarted } from "../../entities/Game.Exceptions";
import { GameNotFound } from "../../repositories/GameRepositoryExceptions";

export interface CensoredStoryRepair {
	/**
	 *
	 * @param gameId the id of the game in which to repair the story
	 * @param storyIndex the story in the game to repair
	 * @param playerId the id of the player repairing the story
	 * @param replacements the words to replace each censor with
	 * @throws
	 * - {@link TypeError} if the input does not meet expected types
	 * - {@link GameNotFound} if the game does not exist
	 * - {@link GameNotStarted} if the game
	 * - {@link StoryNotFound} if the story does not exist in the game
	 * - {@link UnauthorizedStoryModification} if the player is not in the game, or is not
	 *                                         currently assigned to modify this story
	 * - {@link IncorrectStoryModification} if the player is assigned to modify the story, but
	 *                                      the story is in the wrong stage.
	 * - {@link InvalidWordCount} if the number of replacements does not exactly match the
	 *                            number of censored words in the current story entry
	 * - {@link InvalidLength} if any of the `replacements` are empty, or exceed the maximum
	 *                         censor repair length
	 */
	repairCensoredStory(
		gameId: string,
		storyIndex: number,
		playerId: string,
		replacements: string[]
	): Promise<CensoredStoryRepaired>;
}

export type CensoredStoryRepaired = {
	repairedContent: string;
};
