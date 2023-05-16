import { GameAlreadyStarted } from "../../entities/Game.Exceptions";
import { GameNotFound } from "../../repositories/GameRepositoryExceptions";
import { PlayerNotFound } from "../../repositories/UserRepositoryExceptions";
import { PlayerJoinedGame } from "./PlayerJoinedGame";

export interface GameJoining {
	/**
	 *
	 * @param gameId the id of the game to join
	 * @param playerId the id of the player joining the game
	 * @throws
	 *  - {@link TypeError} if the input does not meet expected types
	 *  - {@link GameNotFound} if the game does not exist
	 *  - {@link PlayerNotFound} if the player does not exist
	 *  - {@link GameAlreadyStarted} if the game was already started
	 * @returns {Promise<PlayerJoinedGame | void>}
	 *  - {@link PlayerJoinedGame} if the player successfully joined the game
	 *  - `void` if the player was already in the game
	 */
	joinGame(gameId: string, playerId: string): Promise<PlayerJoinedGame | void>;
}
