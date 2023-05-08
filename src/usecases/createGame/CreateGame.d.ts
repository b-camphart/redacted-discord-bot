import { GameCreated } from "./GameCreated";

export interface CreateGame {
    createGame(creatorId: string): Promise<GameCreated>;
}
