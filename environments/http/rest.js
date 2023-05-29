const HttpController = require("./usecases/HttpControllers");
const Routes = require("./rest/RestRoutes");

/**
 * @template {import("./types").HttpResponse} T
 */
exports.Rest = class Rest {
	static createGame = Routes.createGame.createValidRequest;
	static joinGame = Routes.joinGame.createValidRequest;
	static startGame = Routes.startGame.createValidRequest;
	static startStory = Routes.startStory.createValidRequest;
	static censorStory = Routes.censor.createValidRequest;
	static truncateStory = Routes.truncate.createValidRequest;
	static repairCensoredStory = Routes.repairCensoredStory.createValidRequest;
	static repairTruncatedStory = Routes.repairTruncatedStory.createValidRequest;
	static continueStory = Routes.continueStory.createValidRequest;

	#responseTypes;
	/**
	 * @param {import("./types").ResponseTypes<T>} responseTypes
	 */
	constructor(responseTypes) {
		this.#responseTypes = responseTypes;
	}

	/**
	 * @param {import("./types").RouteRegister<T>} routeRegistration
	 * @param {import("../../src/application/types").Redacted} redacted
	 */
	register(routeRegistration, redacted) {
		[
			{ route: Routes.createGame, Controller: HttpController.CreateGame },
			{ route: Routes.joinGame, Controller: HttpController.JoinGame },
			{ route: Routes.startGame, Controller: HttpController.StartGame },
			{ route: Routes.startStory, Controller: HttpController.StartStory },
			{ route: Routes.censor, Controller: HttpController.CensorStory },
			{ route: Routes.truncate, Controller: HttpController.TruncateStory },
			{ route: Routes.repairCensoredStory, Controller: HttpController.RepairCensoredStory },
			{ route: Routes.repairTruncatedStory, Controller: HttpController.RepairTruncatedStory },
			{ route: Routes.continueStory, Controller: HttpController.ContinueStory },
		].forEach(({ route, Controller }) => {
			const controller = new Controller(this.#responseTypes, redacted);
			route.register(routeRegistration, controller);
		});
	}
};
