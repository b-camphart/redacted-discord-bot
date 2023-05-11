const { TemplateVariableSetter } = require("../../playerActivity/PlayerActivityView");
const { RepairingCensoredStoryViewModel } = require("../../playerActivity/PlayerActivityViewModel");

exports.RepairCensoredStoryView = class RepairCensoredStoryView {
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
    #getRepairingCensoredStoryTemplate(fileName) {
        return this.#getGameMainContentTemplate("repairingCensoredStory", fileName);
    }

    /**
     *
     * @param {RepairingCensoredStoryViewModel} viewModel
     */
    generate = (viewModel) => {
        return this.#getRepairingCensoredStoryTemplate("index.html")
            .setVariable("content", viewModel.content)
            .setVariable("repairs", this.#generateRepairingCensoredStoryRepairs(viewModel))
            .setVariable("locale\\.repair", viewModel.locale.repair)
            .setVariable("locale\\.done", viewModel.locale.done).template;
    };

    /**
     *
     * @param {RepairingCensoredStoryViewModel} viewModel
     */
    #generateRepairingCensoredStoryRepairs(viewModel) {
        return viewModel.repairs.map((repair) => this.#generateCensorRepair(repair)).join("");
    }

    /**
     *
     * @param {{ maxLength: number }} repair
     * @returns
     */
    #generateCensorRepair(repair) {
        return this.#getRepairingCensoredStoryTemplate("repair.html").setVariable(
            "maxlength",
            repair.maxLength.toString()
        ).template;
    }
};
