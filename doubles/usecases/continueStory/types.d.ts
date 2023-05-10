import { UpdateGameRepository } from "../../../src/repositories/GameRepository";
import { ReadOnlySubscribedPlayerRepository } from "../../../src/repositories/SubscribedPlayerRepository";
import { PlayerNotifier } from "../../repositories/PlayerNotifierDoubles";

export type ContinueStoryContext = {
    games?: () => UpdateGameRepository;
    subscriptions?: () => ReadOnlySubscribedPlayerRepository;
    playerNotifier?: () => PlayerNotifier;
};
