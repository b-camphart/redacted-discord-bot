class PlayerActivity {
    /**
     *
     * @param {string} name
     */
    constructor(name) {
        this.name = name;
    }

    /**
     *
     * @param {PlayerActivity} other
     */
    isSameActivityAs(other) {
        if (!(other instanceof PlayerActivity)) return false;
        return this.name === other.name;
    }
}

class ReadingFinishedStories extends PlayerActivity {
    /**
     *
     * @param {FinishedStory[]} stories
     */
    constructor(stories) {
        super("reading-finished-stories");
        this.stories = stories;
    }

    /**
     *
     * @param {PlayerActivity} other
     */
    isSameActivityAs(other) {
        if (!(other instanceof ReadingFinishedStories)) return false;
        if (!super.isSameActivityAs(other)) return false;
        if (this.stories !== other.stories) return false;
        return true;
    }
}

class ActivityInStory extends PlayerActivity {
    /**
     *
     * @param {string} name
     * @param {number} storyIndex
     */
    constructor(name, storyIndex) {
        super(name);
        this.storyIndex = storyIndex;
    }

    /**
     *
     * @param {PlayerActivity} other
     */
    isSameActivityAs(other) {
        if (!(other instanceof ActivityInStory)) return false;
        if (!super.isSameActivityAs(other)) return false;
        if (this.storyIndex !== other.storyIndex) return false;
        return true;
    }
}

class RedactingStory extends ActivityInStory {
    /**
     *
     * @param {number} storyIndex
     * @param {string} entryContent
     */
    constructor(storyIndex, entryContent) {
        super("redacting-story", storyIndex);
        this.entryContent = entryContent;
    }

    /**
     *
     * @param {PlayerActivity} other
     */
    isSameActivityAs(other) {
        if (!(other instanceof RedactingStory)) return false;
        if (!super.isSameActivityAs(other)) return false;
        if (this.entryContent != other.entryContent) return false;
        return true;
    }
}

class RepairingCensoredStory extends ActivityInStory {
    /**
     *
     * @param {number} storyIndex
     * @param {string} censoredContent
     * @param {[number, number][]} censors
     */
    constructor(storyIndex, censoredContent, censors) {
        super("repairing-censored-story", storyIndex);
        this.censoredContent = censoredContent;
        this.censors = censors;
    }

    /**
     *
     * @param {PlayerActivity} other
     */
    isSameActivityAs(other) {
        if (!(other instanceof RepairingCensoredStory)) return false;
        if (!super.isSameActivityAs(other)) return false;
        if (this.censoredContent != other.censoredContent) return false;
        if (this.censors != other.censors) return false;
        return true;
    }
}

class ContinuingStory extends ActivityInStory {
    /**
     *
     * @param {number} storyIndex
     * @param {string} repairedContent
     */
    constructor(storyIndex, repairedContent) {
        super("continuing-story", storyIndex);
        this.repairedContent = repairedContent;
    }

    /**
     *
     * @param {PlayerActivity} other
     */
    isSameActivityAs(other) {
        if (!(other instanceof ContinuingStory)) return false;
        if (!super.isSameActivityAs(other)) return false;
        if (this.repairedContent != other.repairedContent) return false;
        return true;
    }
}

/** @typedef {FinishedStoryEntry[]} FinishedStory */

/**
 * @typedef {Object} FinishedStoryEntry
 * @prop {string} content
 * @prop {[number, number][]} censors
 * @prop {string[]} contributors
 */

exports.PlayerActivity = Object.freeze({
    AwaitingStart: Object.freeze(new PlayerActivity("awaiting-start")),
    StartingStory: Object.freeze(new PlayerActivity("starting-story")),
    AwaitingStory: Object.freeze(new PlayerActivity("awaiting-story")),
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
     */
    RepairingStory: (storyIndex) => {
        return Object.freeze(new ActivityInStory("repairing-story", storyIndex));
    },
    /**
     *
     * @param {number} storyIndex
     * @param {string} censoredContent
     * @param {[number, number][]} censors
     */
    RepairingCensoredStory: (storyIndex, censoredContent, censors) => {
        return Object.freeze(new RepairingCensoredStory(storyIndex, censoredContent, censors));
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
     * @param {FinishedStory[]} stories
     * @returns
     */
    ReadingFinishedStories: (stories) => {
        return Object.freeze(new ReadingFinishedStories(stories));
    },
});
