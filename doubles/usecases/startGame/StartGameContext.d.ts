import { GameRepository, UpdateGameRepository } from "../../../src/repositories/GameRepository";
import { PlayerNotifier } from "../../../src/repositories/PlayerNotifier";
import { ReadOnlySubscribedPlayerRepository } from "../../../src/repositories/SubscribedPlayerRepository";

export interface StartGameContext {
    games?: () => UpdateGameRepository;
    subscriptions?: () => ReadOnlySubscribedPlayerRepository;
    playerNotifier?: () => PlayerNotifier;
}
