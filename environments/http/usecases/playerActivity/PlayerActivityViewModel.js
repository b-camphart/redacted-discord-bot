class PlayerActivityViewModel {
    /**
     *
     * @param {string} gameId
     */
    constructor(gameId) {
        this.gameId = gameId;
    }

    /**
     *
     * @param {import("./types").PlayerActivityView} view
     * @returns {string}
     */
    view(view) {
        return view.generateEmptyGame(this);
    }
}
exports.PlayerActivityViewModel = PlayerActivityViewModel;

class StartingGameViewModel extends PlayerActivityViewModel {
    /**
     *
     * @param {string} gameId
     * @param {{ startGame: string, waitingForGameStart: string }} locale
     */
    constructor(gameId, locale) {
        super(gameId);
        this.locale = locale;
    }

    /**
     *
     * @param {import("./types").PlayerActivityView} view
     * @returns {string}
     */
    view(view) {
        return view.generateStartingGame(this);
    }
}
exports.StartingGameViewModel = StartingGameViewModel;

class StartingStoryViewModel extends PlayerActivityViewModel {
    /**
     *
     * @param {string} gameId
     * @param {number} maxLength
     * @param {{ startStory: string, done: string }} locale
     */
    constructor(gameId, maxLength, locale) {
        super(gameId);
        this.maxLength = maxLength;
        this.locale = locale;
    }

    /**
     *
     * @param {import("./types").PlayerActivityView} view
     * @returns {string}
     */
    view(view) {
        return view.generateStartingStory(this);
    }
}
exports.StartingStoryViewModel = StartingStoryViewModel;

class RedactingStoryViewModel extends PlayerActivityViewModel {
    /**
     *
     * @param {string} gameId
     * @param {{ content: string, isRedaction: boolean }[]} content
     * @param {{ redact: string, censor: string, truncate: string, done: string }} locale
     */
    constructor(gameId, content, locale) {
        super(gameId);
        this.content = content;
        this.locale = locale;
    }

    /**
     *
     * @param {import("./types").PlayerActivityView} view
     * @returns {string}
     */
    view(view) {
        return view.generateRedactingStory(this);
    }
}
exports.RedactingStoryViewModel = RedactingStoryViewModel;

class RepairingCensoredStoryViewModel extends PlayerActivityViewModel {
    /**
     *
     * @param {string} gameId
     * @param {string} content
     * @param {{ label: string, maxLength: number }[]} repairs
     * @param {{ repair: string, done: string }} locale
     */
    constructor(gameId, content, repairs, locale) {
        super(gameId);
        this.content = content;
        this.repairs = repairs;
        this.locale = locale;
    }

    /**
     *
     * @param {import("./types").PlayerActivityView} view
     * @returns {string}
     */
    view(view) {
        return view.generateRepairingCensoredStory(this);
    }
}
exports.RepairingCensoredStoryViewModel = RepairingCensoredStoryViewModel;

class RepairingTruncatedStoryViewModel extends PlayerActivityViewModel {
    /**
     *
     * @param {string} gameId
     * @param {string} content
     * @param {{ label: string, maxLength: number }} repair
     * @param {{ repair: string, done: string }} locale
     */
    constructor(gameId, content, repair, locale) {
        super(gameId);
        this.content = content;
        this.repair = repair;
        this.locale = locale;
    }

    /**
     *
     * @param {import("./types").PlayerActivityView} view
     * @returns {string}
     */
    view(view) {
        return view.generateRepairingTruncatedStory(this);
    }
}
exports.RepairingTruncatedStoryViewModel = RepairingTruncatedStoryViewModel;

class ContinuingStoryViewModel extends PlayerActivityViewModel {
    /**
     *
     * @param {string} gameId
     * @param {string} content
     * @param {number} maxlength
     * @param {{ continue: string, done: string }} locale
     */
    constructor(gameId, content, maxlength, locale) {
        super(gameId);
        this.content = content;
        this.maxlength = maxlength;
        this.locale = locale;
    }

    /**
     *
     * @param {import("./types").PlayerActivityView} view
     * @returns {string}
     */
    view(view) {
        return view.generateContinuingStory(this);
    }
}
exports.ContinuingStoryViewModel = ContinuingStoryViewModel;

class ReadingFinishedStoriesViewModel extends PlayerActivityViewModel {
    /**
     *
     * @param {string} gameId
     * @param {StoryEntryViewModel[][]} stories
     * @param {{ reading: string }} locale
     */
    constructor(gameId, stories, locale) {
        super(gameId);
        this.stories = stories;
        this.locale = locale;
    }

    /**
     *
     * @param {import("./types").PlayerActivityView} view
     * @returns {string}
     */
    view(view) {
        return view.generateReadingFinishedStories(this);
    }
}
exports.ReadingFinishedStoriesViewModel = ReadingFinishedStoriesViewModel;

class StoryEntryViewModel {
    /**
     *
     * @param {{ content: string, isRedaction: boolean }[]} content
     * @param {string[]} contributors
     */
    constructor(content, contributors) {
        this.content = content;
        this.contributors = contributors;
    }
}
exports.StoryEntryViewModel = StoryEntryViewModel;
