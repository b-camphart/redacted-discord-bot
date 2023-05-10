import { UpdateGameRepository } from "../../../src/repositories/GameRepository";

export type CensorStoryContext = {
    games?: () => UpdateGameRepository;
    subscriptions?: () => ReadOnlySubscribedPlayerRepository;
    playerNotifier?: () => PlayerNotifier;
};
