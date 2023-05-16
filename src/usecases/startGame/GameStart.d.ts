import { InsufficientPlayers, UnauthorizedGameModification } from "../../entities/Game.Exceptions";
import { GameNotFound } from "../../repositories/GameRepositoryExceptions";
import { GameStarted } from "./GameStarted";

export interface GameStart {
	/**
	 *
	 * @param gameId the id of the game to join
	 * @param playerId the id of the player joining the game
	 * @param maxEntries the maximum number of entries each story in the game will have.
	 * @throws
	 * - {@link TypeError} if the input does not meet expected types
	 * - {@link GameNotFound} if the game does not exist
	 * - {@link UnauthorizedGameModification} if the user is not part of the game
	 * - {@link InsufficientPlayers} if there are less than 4 players in the game
	 * @returns {Promise<GameStarted | void>}
	 *  - {@link GameStarted} if the game was successfully started
	 *  - `void` if the game has already been started
	 */
	startGame(gameId: string, playerId: string, maxEntries?: number): Promise<GameStarted | void>;
}
