import { GameRepository } from "../../../src/repositories/GameRepository";
import { PlayerNotifier } from "../../../src/repositories/PlayerNotifier";
import { ReadOnlySubscribedPlayerRepository } from "../../../src/repositories/SubscribedPlayerRepository";

export type StartStoryContext = {
    games?: () => GameRepository;
    subscriptions?: () => ReadOnlySubscribedPlayerRepository;
    playerNotifier?: () => PlayerNotifier;
};
