import {
    PlayerActivityViewModel,
    RedactingStoryViewModel,
    RepairingCensoredStoryViewModel,
    RepairingTruncatedStoryViewModel,
    ContinuingStoryViewModel,
    StartingStoryViewModel,
    ReadingFinishedStoriesViewModel,
    StartingGameViewModel,
} from "./PlayerActivityViewModel";

export interface PlayerActivityView {
    generateEmptyGame(viewModel: PlayerActivityViewModel): string;
    generateStartingGame(viewModel: StartingGameViewModel): string;
    generateStartingStory(viewModel: StartingStoryViewModel): string;
    generateRedactingStory(viewModel: RedactingStoryViewModel): string;
    generateRepairingCensoredStory(viewModel: RepairingCensoredStoryViewModel): string;
    generateRepairingTruncatedStory(viewModel: RepairingTruncatedStoryViewModel): string;
    generateContinuingStory(viewModel: ContinuingStoryViewModel): string;
    generateReadingFinishedStories(viewModel: ReadingFinishedStoriesViewModel): string;
}
