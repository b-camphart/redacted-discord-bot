import { Game } from "../entities/Game";

export type GameWithId = Game & { id: String };

export interface ReadOnlyGameRepository {
    get(gameId: string): Promise<GameWithId | undefined>;
}

export interface CreateGameRepository extends ReadOnlyGameRepository {
    add(game: Game): Promise<GameWithId>;
}

export interface UpdateGameRepository extends ReadOnlyGameRepository {
    replace(game: GameWithId): Promise<void>;
}

export interface GameRepository extends CreateGameRepository, UpdateGameRepository {}
