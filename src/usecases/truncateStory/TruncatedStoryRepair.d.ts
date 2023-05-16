import {
	IncorrectStoryModification,
	StoryNotFound,
	UnauthorizedStoryModification,
} from "../../entities/Game.Story.Exceptions";
import { GameNotFound } from "../../repositories/GameRepositoryExceptions";

export interface TruncatedStoryRepair {
	/**
	 *
	 * @param gameId the id of the game in which to repair the story
	 * @param storyIndex the story in the game to repair
	 * @param playerId the id of the player repairing the story
	 * @param replacement the text with which to repair the truncated story entry
	 * @throws
	 * - {@link TypeError} if the input does not meet expected types
	 * - {@link GameNotFound} if the game does not exist
	 * - {@link StoryNotFound} if the story does not exist in the game
	 * - {@link UnauthorizedStoryModification} if the player is not in the game, or is not
	 *                                         currently assigned to modify this story
	 * - {@link IncorrectStoryModification} if the player is assigned to modify the story, but
	 *                                      the story is in the wrong stage.
	 * - {@link InvalidLength} if the `replacement` is empty, or exceeds the maximum truncation
	 *                         repair length
	 * @returns {TruncatedStoryRepaired}
	 */
	repairTruncatedStory(
		gameId: string,
		storyIndex: number,
		playerId: string,
		replacement: string
	): Promise<TruncatedStoryRepaired>;
}

export type TruncatedStoryRepaired = {
	repairedContent: string;
};
