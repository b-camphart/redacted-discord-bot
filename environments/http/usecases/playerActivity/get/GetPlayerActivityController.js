/**
 * @template {import("../../../types").HttpResponse} T
 * @typedef {import("../../../types").Controller<T>} Controller<T>
 */
/**
 * @template {import("../../../types").HttpResponse} T
 * @typedef {import("../../types").RequestAuthorizer<T>} RequestAuthorizer<T>
 */

const { PlayerActivityService } = require("../../../../../src/usecases/PlayerActivityService");
const { HttpUseCaseErrorHandler } = require("../../HttpUseCaseErrorHandler");
const { RequestValidatorImpl, getGameId, getUserId } = require("../../getUserId");
const { PlayerActivityPresenter } = require("../PlayerActivityPresenter");
const { PlayerActivityView } = require("../PlayerActivityView");

/**
 * @template {import("../../../types").HttpResponse} T
 * @implements {Controller<T>}
 * @implements {RequestAuthorizer<T>}
 */
class GetPlayerActivityController {
	#responseTypes;
	#service;
	#gameJoining;
	#games;
	/**
	 * @param {import("../../../types").ResponseTypes<T>} responseTypes
	 * @param {PlayerActivityService} service
	 * @param {UseCases.GameJoining} gameJoining
	 * @param {import("../../../../../src/repositories/GameRepository").ReadOnlyGameRepository} games
	 */
	constructor(responseTypes, service, gameJoining, games) {
		this.#responseTypes = responseTypes;
		this.#service = service;
		this.#gameJoining = gameJoining;
		this.#games = games;
	}

	responseTypes() {
		return this.#responseTypes;
	}

	/**
	 *
	 * @param {import("../../../types").HttpRequest} request
	 */
	handle = async (request) => {
		const validator = new RequestValidatorImpl(this.#responseTypes);

		let gameId = getGameId(validator, request);

		const badRequest = validator.badRequest();
		if (badRequest != null) return badRequest;

		/** @type {string} */
		gameId = /** @type {string} */ (gameId);

		const userId = getUserId(this, request);
		if (typeof userId !== "string") return userId;

		if (!(await this.#games.get(gameId))?.hasPlayer(userId)) {
			await this.#gameJoining
				.joinGame(gameId, userId)
				.catch(new HttpUseCaseErrorHandler(this.#responseTypes).handle);
		}

		return await this.#service
			.getPlayerActivity(gameId, userId)
			.then((activity) =>
				this.#responseTypes.send(
					activity.accept(new PlayerActivityPresenter(gameId)).view(new PlayerActivityView()),
					"text/html"
				)
			)
			.catch(new HttpUseCaseErrorHandler(this.#responseTypes).handle);
	};
}

exports.GetPlayerActivityController = GetPlayerActivityController;
