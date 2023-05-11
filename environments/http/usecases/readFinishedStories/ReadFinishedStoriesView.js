const { TemplateVariableSetter } = require("../playerActivity/PlayerActivityView");
const { ReadingFinishedStoriesViewModel, StoryEntryViewModel } = require("../playerActivity/PlayerActivityViewModel");

exports.ReadFinishedStoriesView = class ReadFinishedStoriesView {
    #getGameMainContentTemplate;

    /**
     *
     * @param {(...paths: string[]) => TemplateVariableSetter} getGameMainContentTemplate
     */
    constructor(getGameMainContentTemplate) {
        this.#getGameMainContentTemplate = getGameMainContentTemplate;
    }

    /**
     *
     * @param {string} fileName
     * @returns
     */
    #getReadingFinishedStoriesTemplate(fileName) {
        return this.#getGameMainContentTemplate("readingFinishedStories", fileName);
    }

    /**
     *
     * @param {ReadingFinishedStoriesViewModel} viewModel
     */
    generate = (viewModel) => {
        const template = this.#getReadingFinishedStoriesTemplate("index.html")
            .setVariable("locale\\.reading", "Read the Finished Stories!")
            .setVariable("stories", this.#generateStoriesView(viewModel.stories)).template;
        return template;
    };

    /**
     *
     * @param {StoryEntryViewModel[][]} stories
     * @returns
     */
    #generateStoriesView(stories) {
        return stories.map((story) => this.#generateStoryView(story)).join("");
    }

    /**
     *
     * @param {StoryEntryViewModel[]} story
     * @returns
     */
    #generateStoryView(story) {
        return this.#getReadingFinishedStoriesTemplate("story.html").setVariable(
            "entries",
            this.#generateStoryEntriesView(story)
        ).template;
    }

    /**
     *
     * @param {StoryEntryViewModel[]} entries
     * @returns
     */
    #generateStoryEntriesView(entries) {
        return entries.map((entry) => this.#generateEntryView(entry)).join("");
    }

    /**
     *
     * @param {StoryEntryViewModel} entry
     * @returns
     */
    #generateEntryView(entry) {
        return this.#getReadingFinishedStoriesTemplate("entry.html")
            .setVariable("content", this.#generateEntryContentsView(entry.content))
            .setVariable("contributors", this.#generateEntryContributorsView(entry.contributors)).template;
    }

    /**
     *
     * @param {{content: string, isRedaction: boolean}[]} contents
     * @returns
     */
    #generateEntryContentsView(contents) {
        return contents.map((content) => this.#generateEntryContentView(content)).join("");
    }

    /**
     *
     * @param {object} content
     * @param {string} content.content
     * @param {boolean} content.isRedaction
     * @returns
     */
    #generateEntryContentView(content) {
        return this.#getReadingFinishedStoriesTemplate("content.html")
            .setVariable("redacted", String(content.isRedaction))
            .setVariable("content", content.content).template;
    }

    /**
     *
     * @param {string[]} contributors
     * @returns
     */
    #generateEntryContributorsView(contributors) {
        return contributors.map((contributor) => this.#generateContributorView(contributor)).join("");
    }

    /**
     *
     * @param {string} contributor
     * @returns
     */
    #generateContributorView(contributor) {
        return this.#getReadingFinishedStoriesTemplate("contributor.html").setVariable("name", contributor).template;
    }
};
