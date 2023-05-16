import { GameCreated } from "./GameCreated";
import { PlayerNotFound } from "../../repositories/UserRepositoryExceptions";

export interface GameCreation {
	/**
	 *
	 * @param creatorId the id of the user creating the game.
	 * @throws
	 *  - {@link TypeError} if the input does not meet expected types
	 *  - {@link PlayerNotFound} if the `creatorId` does not refer to an existing user
	 */
	createGame(creatorId: string): Promise<GameCreated>;
}
