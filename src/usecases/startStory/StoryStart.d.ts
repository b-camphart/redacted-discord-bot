import { ConflictingStory, UnauthorizedGameModification, GameNotStarted } from "../../entities/Game.Exceptions";
import { InvalidWordCount } from "../../entities/Game.Story.Exceptions";
import { GameNotFound } from "../../repositories/GameRepositoryExceptions";
import { StoryStarted } from "./StoryStarted";

export interface StoryStart {
	/**
	 *
	 * @param gameId the id of the game in which to start the story
	 * @param playerId the id of the player starting the story
	 * @param content the initial content of the first entry to the story
	 * @throws
	 * - {@link TypeError} if the input does not meet expected types
	 * - {@link InvalidWordCount} if the content does not have at least two censorable words.
	 * - {@link InvalidLength} if the content is empty, or exceeds the maximum story entry length
	 * - {@link GameNotFound} if the game does not exist
	 * - {@link UnauthorizedGameModification} if the user is not part of the game
	 * - {@link GameNotStarted} if the game has not yet been started
	 * - {@link ConflictingStory} if the player has already started a story with different content
	 * @returns {Promise<StoryStarted>} {@link StoryStarted} if the game was successfully started
	 *
	 */
	startStory(gameId: string, playerId: string, content: string): Promise<StoryStarted>;
}
