import { UpdateGameRepository } from "../../../../src/repositories/GameRepository";

export type RepairCensoredStoryContext = {
    games?: () => UpdateGameRepository;
    subscriptions?: () => ReadOnlySubscribedPlayerRepository;
    playerNotifier?: () => PlayerNotifier;
};
