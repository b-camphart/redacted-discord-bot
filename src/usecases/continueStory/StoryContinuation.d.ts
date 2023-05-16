import {
	IncorrectStoryModification,
	StoryNotFound,
	UnauthorizedStoryModification,
} from "../../entities/Game.Story.Exceptions";
import { GameNotFound } from "../../repositories/GameRepositoryExceptions";

export interface StoryContinuation {
	/**
	 *
	 * @param gameId the id of the game in which to start the story
	 * @param storyIndex the index of the story in the game to continue
	 * @param playerId the id of the player starting the story
	 * @param content the initial content of the first entry to the story
	 * @throws
	 * - {@link TypeError} if the input does not meet expected types
	 * - {@link GameNotFound} if the game does not exist
	 * - {@link StoryNotFound} if the story does not exist in the game
	 * - {@link UnauthorizedStoryModification} if the player is not in the game, or is not
	 *                                         currently assigned to modify this story
	 * - {@link IncorrectStoryModification} if the player is assigned to modify the story, but
	 *                                      the story is in the wrong stage.
	 * - {@link InvalidLength} if the content is empty, or exceeds the maximum story entry length
	 *
	 */
	continueStory(gameId: string, storyIndex: number, playerId: string, content: string): Promise<void>;
}
