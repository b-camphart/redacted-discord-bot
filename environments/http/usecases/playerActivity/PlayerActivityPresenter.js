/**
 * @template T
 * @typedef {import("../../../../src/entities/types").PlayerActivityVisitor<T>} PlayerActivityVisitor<T>
 */

const { repeat } = require("../../../../src/utils/iteration");
const { Range, range } = require("../../../../src/utils/range");
const {
    PlayerActivityViewModel,
    RedactingStoryViewModel,
    RepairingCensoredStoryViewModel,
    RepairingTruncatedStoryViewModel,
    ContinuingStoryViewModel,
    StartingStoryViewModel,
    ReadingFinishedStoriesViewModel,
    StoryEntryViewModel,
} = require("./PlayerActivityViewModel");

/**
 * @implements {PlayerActivityVisitor<PlayerActivityViewModel>}
 */
exports.PlayerActivityPresenter = class PlayerActivityPresenter {
    static MAX_ENTRY_LENGTH = 256;
    static MAX_CENSOR_LENGTH = 64;

    /**
     *
     * @param {string} gameId
     */
    constructor(gameId) {
        this.gameId = gameId;
    }

    awaitingGameStart() {
        return new PlayerActivityViewModel(this.gameId);
    }

    awaitingStory() {
        return new PlayerActivityViewModel(this.gameId);
    }

    startingStory() {
        return new StartingStoryViewModel(this.gameId, PlayerActivityPresenter.MAX_ENTRY_LENGTH, {
            startStory: "Start a Story",
            done: "Done",
        });
    }

    /**
     *
     * @param {string} content
     * @param {Range[]} possibleRedactions
     * @returns {PlayerActivityViewModel}
     */
    redactingStory(content, possibleRedactions) {
        return new RedactingStoryViewModel(
            this.gameId,
            possibleRedactions.reduce(
                /**
                 * @param {{content: string, isRedaction: boolean }[]} collected
                 */
                (collected, range, index) => {
                    const previousRange = index > 0 ? possibleRedactions.at(index - 1) : undefined;
                    if (previousRange !== undefined) {
                        const gap = content.substring(previousRange.endExclusive, range.start);
                        if (gap.length > 0) {
                            collected.push({ content: gap, isRedaction: false });
                        }
                    }
                    const redaction = content.substring(range.start, range.endExclusive);
                    collected.push({ content: redaction, isRedaction: true });
                    if (index === possibleRedactions.length - 1) {
                        const gap = content.substring(range.endExclusive);
                        if (gap.length > 0) {
                            collected.push({ content: gap, isRedaction: false });
                        }
                    }
                    return collected;
                },
                []
            ),
            {
                redact: "Redact",
                censor: "Censor",
                truncate: "Truncate",
                done: "Done",
            }
        );
    }

    /**
     *
     * @param {string} content
     * @param {Range[]} redactions
     * @returns {PlayerActivityViewModel}
     */
    repairingCensor(content, redactions) {
        return new RepairingCensoredStoryViewModel(
            this.gameId,
            redactions.reduce((displayedContent, range) => {
                let censor = "";
                repeat(range.size, () => (censor += "█"));
                return (
                    displayedContent.substring(0, range.start) + censor + displayedContent.substring(range.endExclusive)
                );
            }, content),
            redactions.map((redaction, index) => {
                return {
                    label: `Repair ${index + 1}`,
                    maxLength: PlayerActivityPresenter.MAX_CENSOR_LENGTH,
                };
            }),
            {
                repair: "Repair",
                done: "Done",
            }
        );
    }

    /**
     *
     * @param {string} content
     * @param {number} truncatedFrom
     * @param {number} storyIndex
     * @returns {PlayerActivityViewModel}
     */
    repairingTruncation(content, truncatedFrom, storyIndex) {
        return new RepairingTruncatedStoryViewModel(
            this.gameId,
            (() => {
                let censor = "";
                repeat(range(truncatedFrom, content.length).size, () => (censor += "█"));
                return content.substring(0, truncatedFrom) + censor;
            })(),
            {
                label: `Complete`,
                maxLength: PlayerActivityPresenter.MAX_ENTRY_LENGTH,
            },
            {
                repair: "Repair",
                done: "Done",
            }
        );
    }

    /**
     *
     * @param {string} content
     * @returns {PlayerActivityViewModel}
     */
    continuingStory(content) {
        return new ContinuingStoryViewModel(this.gameId, content, PlayerActivityPresenter.MAX_ENTRY_LENGTH, {
            continue: "Continue",
            done: "Done",
        });
    }

    /**
     *
     * @param {import("../../../../src/entities/types").FinishedStory[]} stories
     * @returns {PlayerActivityViewModel}
     */
    readingFinishedStories(stories) {
        return new ReadingFinishedStoriesViewModel(
            this.gameId,
            stories.map((story) => {
                return story.entries.map((entry) => {
                    return new StoryEntryViewModel(
                        entry.redactions.reduce(
                            /**
                             *
                             * @param {{ content: string, isRedaction: boolean }[]} collected
                             * @param {Range} range
                             * @param {number} index
                             * @returns
                             */
                            (collected, range, index) => {
                                const previousRange = index > 0 ? entry.redactions.at(index - 1) : undefined;
                                if (previousRange !== undefined) {
                                    const gap = entry.repairedContent.substring(
                                        previousRange.endExclusive,
                                        range.start
                                    );
                                    if (gap.length > 0) {
                                        collected.push({ content: gap, isRedaction: false });
                                    }
                                } else if (range.start > 0) {
                                    const gap = entry.repairedContent.substring(0, range.start);
                                    if (gap.length > 0) {
                                        collected.push({ content: gap, isRedaction: false });
                                    }
                                }
                                const redaction = entry.repairedContent.substring(range.start, range.endExclusive);
                                collected.push({ content: redaction, isRedaction: true });
                                if (index === entry.redactions.length - 1) {
                                    const gap = entry.repairedContent.substring(range.endExclusive);
                                    if (gap.length > 0) {
                                        collected.push({ content: gap, isRedaction: false });
                                    }
                                }
                                return collected;
                            },
                            []
                        ),
                        entry.contributors
                    );
                });
            }),
            {
                reading: "Read the Finished Stories!",
            }
        );
    }
};
