/**
 * @template {HttpResponse} T
 * @typedef {import("../../../types").Controller<T>} Controller<T>
 */

const { PlayerActivityService } = require("../../../../../src/usecases/PlayerActivityService");
const { PlayerActivityPresenter } = require("../PlayerActivityPresenter");
const { PlayerActivityView } = require("../PlayerActivityView");

/**
 * @template {HttpResponse} T
 * @implements {Controller<T>}
 */
class GetPlayerActivityController {
    #responseTypes;
    #usecase;
    /**
     * @param {import("../../../types").ResponseTypes<T>} responseTypes
     * @param {PlayerActivityService} usecase
     */
    constructor(responseTypes, usecase) {
        this.#responseTypes = responseTypes;
        this.#usecase = usecase;
    }

    /**
     *
     * @param {import("../../../types").HttpRequest} request
     */
    async handle(request) {
        const userId = request.session?.id;
        if (userId === undefined) return this.#responseTypes.sendStatus(401);
        const gameId = request.params.gameId;
        if (gameId === undefined) return this.#responseTypes.sendStatus(404);
        const activity = await this.#usecase.getPlayerActivity(gameId, userId);
        return this.#responseTypes.send(
            activity.accept(new PlayerActivityPresenter(gameId)).view(new PlayerActivityView()),
            "text/html"
        );
    }
}

exports.GetPlayerActivityController = GetPlayerActivityController;
