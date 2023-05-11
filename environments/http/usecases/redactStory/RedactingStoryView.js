const { TemplateVariableSetter } = require("../playerActivity/PlayerActivityView");
const { RedactingStoryViewModel } = require("../playerActivity/PlayerActivityViewModel");

const RedactingStoryView = class RedactingStoryView {
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
    #getRedactingStoryTemplate(fileName) {
        return this.#getGameMainContentTemplate("redactingStory", fileName);
    }

    /**
     *
     * @param {RedactingStoryViewModel} viewModel
     */
    generate = (viewModel) => {
        const mainContentTemplate = this.#getRedactingStoryTemplate("index.html").setVariable(
            "content",
            this.#generateRedactingStoryContent(viewModel.content)
        );
        return this.#applyLocalizationStrings(mainContentTemplate, viewModel.locale).template;
    };

    /**
     *
     * @param {{content: string, isRedaction: boolean}[]} content
     * @returns {string}
     */
    #generateRedactingStoryContent(content) {
        return content.map((redaction) => this.#generateRedactingStoryRedaction(redaction)).join("");
    }

    /**
     *
     * @param {{content: string, isRedaction: boolean}} redaction
     * @returns {string}
     */
    #generateRedactingStoryRedaction(redaction) {
        const redactionTemplate = this.#getRedactingStoryTemplate("redaction.html");
        return redactionTemplate
            .setVariable("content", redaction.content)
            .setVariable("redactable", String(redaction.isRedaction)).template;
    }

    /**
     *
     * @param {TemplateVariableSetter} template
     * @param {Object.<string, string>} locale
     * @returns
     */
    #applyLocalizationStrings(template, locale) {
        return Object.keys(locale).reduce((currentTemplate, localeKey) => {
            return currentTemplate.setVariable(`locale\\.${localeKey}`, locale[localeKey]);
        }, template);
    }
};

exports.RedactingStoryView = RedactingStoryView;
