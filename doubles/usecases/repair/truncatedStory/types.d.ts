import { UpdateGameRepository } from "../../../../src/repositories/GameRepository";
import { PlayerNotifier } from "../../../../src/repositories/PlayerNotifier";
import { ReadOnlySubscribedPlayerRepository } from "../../../../src/repositories/SubscribedPlayerRepository";

export type RepairTruncatedStoryContext = {
    games?: () => UpdateGameRepository;
    subscriptions?: () => ReadOnlySubscribedPlayerRepository;
    playerNotifier?: () => PlayerNotifier;
};
