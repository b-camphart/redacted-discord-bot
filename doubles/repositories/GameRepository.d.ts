import { Game } from "../../entities/Game";

export type GameWithId = Game & { id: string };

export interface GameRepository {
    get(gameId: string): Promise<GameWithId | undefined>;
    add(game: Game): Promise<GameWithId>;
    replace(game: GameWithId): Promise<void>;
}

export interface GameRepositoryConstructor {
    new (): GameRepository;
}
