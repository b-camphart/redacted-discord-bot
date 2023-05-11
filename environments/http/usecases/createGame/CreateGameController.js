/**
 * @template {HttpResponse} T
 * @typedef {import("../../types").Controller<T>} Controller<T>
 */

const { CreateGameUseCase } = require("../../../../src/usecases/createGame/CreateGameUseCase");

/**
 * @template {HttpResponse} T
 * @implements {Controller<T>}
 */
class CreateGameController {
    #responseTypes;
    #usecase;
    /**
     * @param {import("../../types").ResponseTypes<T>} responseTypes
     * @param {CreateGameUseCase} usecase
     */
    constructor(responseTypes, usecase) {
        this.#responseTypes = responseTypes;
        this.#usecase = usecase;
    }

    /**
     *
     * @param {import("../../types").HttpRequest} request
     */
    async handle(request) {
        const userId = request.session?.id;
        if (userId === undefined) return this.#responseTypes.sendStatus(401);
        const gameCreated = await this.#usecase.createGame(userId);
        return this.#responseTypes.redirect(`/game/${gameCreated.gameId}`);
    }
}

exports.CreateGameController = CreateGameController;
