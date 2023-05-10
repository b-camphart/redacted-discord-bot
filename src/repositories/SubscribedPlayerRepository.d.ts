import { SubscribedPlayer } from "../entities/SubscribedPlayer";

export interface ReadOnlySubscribedPlayerRepository {
    isSubscribed(gameId: string, playerId: string): Promise<boolean>;
    playersSubscribedToGame(gameId: string): Promise<string[]>;
}

export interface SubscribedPlayerRepository extends ReadOnlySubscribedPlayerRepository {
    add(subscription: SubscribedPlayer): Promise<void>;
}
