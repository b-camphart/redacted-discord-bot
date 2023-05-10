import { ReadOnlyGameRepository } from "../../../src/repositories/GameRepository";
import { SubscribedPlayerRepository } from "../../../src/repositories/SubscribedPlayerRepository";

export type TrackPersonalActivityContext = {
    games?: () => ReadOnlyGameRepository;
    subscriptions?: () => SubscribedPlayerRepository;
};
