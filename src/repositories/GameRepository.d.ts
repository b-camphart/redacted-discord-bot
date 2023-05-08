import { Game } from "../entities/types";

export interface ReadOnlyGameRepository {
    get(gameId: string): Promise<Game<string> | undefined>;
}

export interface CreateGameRepository extends ReadOnlyGameRepository {
    add(game: Game<undefined>): Promise<Game<string>>;
}

export interface UpdateGameRepository extends ReadOnlyGameRepository {
    replace(game: Game<string>): Promise<void>;
}

export interface GameRepository extends CreateGameRepository, UpdateGameRepository {}
