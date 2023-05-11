/** @typedef {import("./types").PlayerActivityView} IPlayerActivityView */
const fileSystem = require("fs");
const path = require("path");
const {
    PlayerActivityViewModel,
    RedactingStoryViewModel,
    RepairingCensoredStoryViewModel,
    RepairingTruncatedStoryViewModel,
    ContinuingStoryViewModel,
    StartingStoryViewModel,
    ReadingFinishedStoriesViewModel,
} = require("./PlayerActivityViewModel");
const { RedactingStoryView } = require("../redactStory/RedactingStoryView");
const { RepairCensoredStoryView } = require("../repair/censoredStory/RepairCensoredStoryView");
const { ReadFinishedStoriesView } = require("../readFinishedStories/ReadFinishedStoriesView");

class TemplateVariableSetter {
    /**
     *
     * @param {string} template
     */
    constructor(template) {
        this.template = template;
    }

    /**
     *
     * @param {string} variableName
     * @param {string} value
     * @returns
     */
    setVariable(variableName, value) {
        return new TemplateVariableSetter(this.template.replace(RegExp(`{{${variableName}}}`, "g"), value));
    }
}
exports.TemplateVariableSetter = TemplateVariableSetter;

/**
 * @implements {IPlayerActivityView}
 */
exports.PlayerActivityView = class PlayerActivityView {
    static #cachedTemplates = new Map();

    /**
     *
     * @param  {...string} paths
     * @returns {TemplateVariableSetter}
     */
    static #getFileAsTemplate(...paths) {
        const fullPath = path.join(process.cwd(), ...paths);
        if (this.#cachedTemplates.has(fullPath)) {
            return new TemplateVariableSetter(this.#cachedTemplates.get(fullPath));
        }
        const fileString = fileSystem.readFileSync(fullPath, { encoding: "utf8" });
        this.#cachedTemplates.set(fullPath, fileString);
        return new TemplateVariableSetter(fileString);
    }

    /**
     *
     * @param  {...string} paths
     * @returns {TemplateVariableSetter}
     */
    #getGameTemplate(...paths) {
        return PlayerActivityView.#getFileAsTemplate("environments", "browser", "game", ...paths);
    }

    /**
     *
     * @param {string} gameId
     * @returns {TemplateVariableSetter}
     */
    #getRootGameTemplate(gameId) {
        const gameTemplate = this.#getGameTemplate("game.html");
        return gameTemplate.setVariable("gameId", gameId);
    }

    /**
     *
     * @param {PlayerActivityViewModel} viewModel
     * @returns {string}
     */
    generateEmptyGame(viewModel) {
        const template = this.#getRootGameTemplate(viewModel.gameId);
        return template.setVariable("mainContent", "").template;
    }

    /**
     *
     * @param  {...string} paths
     * @returns
     */
    #getGameMainContentTemplate = (...paths) => {
        return this.#getGameTemplate("mainContent", ...paths);
    };

    /**
     * @template {PlayerActivityViewModel} T
     * @param {T} viewModel
     * @param {(viewModel: T) => string} mainContent
     * @returns {string}
     */
    #generateGameView(viewModel, mainContent) {
        return this.#getRootGameTemplate(viewModel.gameId).setVariable("mainContent", mainContent(viewModel)).template;
    }

    /**
     *
     * @param {StartingStoryViewModel} viewModel
     * @returns {string}
     */
    generateStartingStory(viewModel) {
        return this.#generateGameView(viewModel, (_) => {
            return this.#getGameMainContentTemplate("startingStory", "index.html")
                .setVariable("locale\\.startStory", viewModel.locale.startStory)
                .setVariable("maxlength", viewModel.maxLength.toString())
                .setVariable("locale\\.done", viewModel.locale.done).template;
        });
    }

    /**
     *
     * @param {RedactingStoryViewModel} viewModel
     * @returns {string}
     */
    generateRedactingStory(viewModel) {
        return this.#generateGameView(viewModel, new RedactingStoryView(this.#getGameMainContentTemplate).generate);
    }

    /**
     *
     * @param {RepairingCensoredStoryViewModel} viewModel
     */
    generateRepairingCensoredStory(viewModel) {
        return this.#generateGameView(
            viewModel,
            new RepairCensoredStoryView(this.#getGameMainContentTemplate).generate
        );
    }

    /**
     *
     * @param {RepairingTruncatedStoryViewModel} viewModel
     * @returns {string}
     */
    generateRepairingTruncatedStory(viewModel) {
        return this.#generateGameView(viewModel, (_) => {
            return this.#getGameMainContentTemplate("repairingTruncatedStory", "index.html")
                .setVariable("locale\\.repair", viewModel.locale.repair)
                .setVariable("locale\\.done", viewModel.locale.done)
                .setVariable("content", viewModel.content)
                .setVariable("maxlength", viewModel.repair.maxLength.toString()).template;
        });
    }

    /**
     *
     * @param {ContinuingStoryViewModel} viewModel
     * @returns {string}
     */
    generateContinuingStory(viewModel) {
        return this.#generateGameView(viewModel, (_) => {
            return this.#getGameMainContentTemplate("continuingStory", "index.html")
                .setVariable("locale\\.continue", viewModel.locale.continue)
                .setVariable("locale\\.done", viewModel.locale.done)
                .setVariable("content", viewModel.content)
                .setVariable("maxlength", viewModel.maxlength.toString()).template;
        });
    }

    /**
     *
     * @param {ReadingFinishedStoriesViewModel} viewModel
     * @returns {string}
     */
    generateReadingFinishedStories(viewModel) {
        return this.#generateGameView(
            viewModel,
            new ReadFinishedStoriesView(this.#getGameMainContentTemplate).generate
        );
    }
};
