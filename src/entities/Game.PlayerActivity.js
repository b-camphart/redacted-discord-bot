const { Range } = require("../utils/range");
const { censorableWords } = require("./Words");
/** @typedef {import("./types").PlayerActivity} PlayerActivity */

class AwaitingGameStart {
    /**
     * @template T
     * @param {import("./types").PlayerActivityVisitor<T>} visitor
     */
    accept(visitor) {
        return visitor.awaitingGameStart();
    }
}

class AwaitingStory {
    /**
     * @template T
     * @param {import("./types").PlayerActivityVisitor<T>} visitor
     */
    accept(visitor) {
        return visitor.awaitingStory();
    }
}

class StartingStory {
    /**
     * @template T
     * @param {import("./types").PlayerActivityVisitor<T>} visitor
     */
    accept(visitor) {
        return visitor.startingStory();
    }
}

/**
 * @implements {PlayerActivity}
 */
class ReadingFinishedStories {
    /**
     *
     * @param {FinishedStory[]} stories
     */
    constructor(stories) {
        this.stories = stories;
    }

    /**
     * @template T
     * @param {import("./types").PlayerActivityVisitor<T>} visitor
     */
    accept(visitor) {
        return visitor.readingFinishedStories(this.stories);
    }

    /**
     *
     * @param {PlayerActivity} other
     * @returns {other is ReadingFinishedStories}
     */
    isSameActivityAs(other) {
        if (!(other instanceof ReadingFinishedStories)) return false;
        if (this.stories !== other.stories) return false;
        return true;
    }
}

class ActivityInStory {
    /**
     *
     * @param {number} storyIndex
     */
    constructor(storyIndex) {
        this.storyIndex = storyIndex;
    }

    /**
     *
     * @param {PlayerActivity} other
     * @returns {other is ActivityInStory}
     */
    isSameActivityAs(other) {
        if (!(other instanceof ActivityInStory)) return false;
        if (this.storyIndex !== other.storyIndex) return false;
        return true;
    }
}

/**
 * @implements {PlayerActivity}
 */
class RedactingStory extends ActivityInStory {
    /**
     *
     * @param {number} storyIndex
     * @param {string} entryContent
     */
    constructor(storyIndex, entryContent) {
        super(storyIndex);
        this.entryContent = entryContent;
        this.wordBoundaries = censorableWords(entryContent);
    }

    /**
     * @template T
     * @param {import("./types").PlayerActivityVisitor<T>} visitor
     */
    accept(visitor) {
        return visitor.redactingStory(this.entryContent, this.wordBoundaries, this.storyIndex);
    }

    /**
     *
     * @param {PlayerActivity} other
     * @returns {other is RedactingStory}
     */
    isSameActivityAs(other) {
        if (!(other instanceof RedactingStory)) return false;
        if (!super.isSameActivityAs(other)) return false;
        if (this.entryContent != other.entryContent) return false;
        return true;
    }
}

/**
 * @implements {PlayerActivity}
 */
class RepairingCensoredStory extends ActivityInStory {
    /**
     *
     * @param {number} storyIndex
     * @param {string} censoredContent
     * @param {Range[]} censors
     */
    constructor(storyIndex, censoredContent, censors) {
        super(storyIndex);
        this.content = censoredContent;
        this.censors = censors;
    }

    /**
     * @template T
     * @param {import("./types").PlayerActivityVisitor<T>} visitor
     */
    accept(visitor) {
        return visitor.repairingCensor(this.content, this.censors, this.storyIndex);
    }

    /**
     *
     * @param {PlayerActivity} other
     * @returns {other is RepairingCensoredStory}
     */
    isSameActivityAs(other) {
        if (!(other instanceof RepairingCensoredStory)) return false;
        if (!super.isSameActivityAs(other)) return false;
        if (this.censors != other.censors) return false;
        return true;
    }
}

/**
 * @implements {PlayerActivity}
 */
class RepairingTruncatedStory extends ActivityInStory {
    /**
     *
     * @param {number} storyIndex
     * @param {string} censoredContent
     * @param {number} truncationIndex
     */
    constructor(storyIndex, censoredContent, truncationIndex) {
        super(storyIndex);
        this.content = censoredContent;
        this.truncationIndex = truncationIndex;
    }

    /**
     * @template T
     * @param {import("./types").PlayerActivityVisitor<T>} visitor
     */
    accept(visitor) {
        return visitor.repairingTruncation(this.content, this.truncationIndex, this.storyIndex);
    }

    /**
     *
     * @param {PlayerActivity} other
     * @returns {other is RepairingTruncatedStory}
     */
    isSameActivityAs(other) {
        if (!(other instanceof RepairingTruncatedStory)) return false;
        if (!super.isSameActivityAs(other)) return false;
        if (this.truncationIndex != other.truncationIndex) return false;
        return true;
    }
}

/**
 * @implements {PlayerActivity}
 */
class ContinuingStory extends ActivityInStory {
    /**
     *
     * @param {number} storyIndex
     * @param {string} repairedContent
     */
    constructor(storyIndex, repairedContent) {
        super(storyIndex);
        this.repairedContent = repairedContent;
    }

    /**
     * @template T
     * @param {import("./types").PlayerActivityVisitor<T>} visitor
     */
    accept(visitor) {
        return visitor.continuingStory(this.repairedContent, this.storyIndex);
    }

    /**
     *
     * @param {PlayerActivity} other
     * @returns {other is ContinuingStory}
     */
    isSameActivityAs(other) {
        if (!(other instanceof ContinuingStory)) return false;
        if (!super.isSameActivityAs(other)) return false;
        if (this.repairedContent != other.repairedContent) return false;
        return true;
    }
}

exports.PlayerActivity = Object.freeze({
    AwaitingStart: Object.freeze(new AwaitingGameStart()),
    StartingStory: Object.freeze(new StartingStory()),
    AwaitingStory: Object.freeze(new AwaitingStory()),
    /**
     *
     * @param {number} storyIndex
     * @param {string} entryContent
     */
    RedactingStory: (storyIndex, entryContent) => {
        return Object.freeze(new RedactingStory(storyIndex, entryContent));
    },
    /**
     *
     * @param {number} storyIndex
     * @param {string} censoredContent
     * @param {Range[]} censors
     */
    RepairingCensoredStory: (storyIndex, censoredContent, censors) => {
        return Object.freeze(new RepairingCensoredStory(storyIndex, censoredContent, censors));
    },
    /**
     *
     * @param {number} storyIndex
     * @param {string} censoredContent
     * @param {number} truncationIndex
     */
    RepairingTruncatedStory: (storyIndex, censoredContent, truncationIndex) => {
        return Object.freeze(new RepairingTruncatedStory(storyIndex, censoredContent, truncationIndex));
    },

    /**
     *
     * @param {number} storyIndex
     * @param {string} repairedContent
     */
    ContinuingStory: (storyIndex, repairedContent) => {
        return Object.freeze(new ContinuingStory(storyIndex, repairedContent));
    },

    /**
     *
     * @param {import("./types").FinishedStory[]} stories
     * @returns
     */
    ReadingFinishedStories: (stories) => {
        return Object.freeze(new ReadingFinishedStories(stories));
    },
});
