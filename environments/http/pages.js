const path = require("path");
const { GetPlayerActivityController } = require("./usecases/playerActivity/get/GetPlayerActivityController");
const { Redacted } = require("../../src/application/Redacted");

/**
 * @template {import("./types").HttpResponse} T
 */
exports.Pages = class Pages {
	#responseTypes;
	/**
	 * @param {import("./types").ResponseTypes<T>} responseTypes
	 */
	constructor(responseTypes) {
		this.#responseTypes = responseTypes;
	}

	/**
	 *
	 * @param  {...string} pathParts
	 * @returns {string}
	 */
	#getBrowserFile(...pathParts) {
		return path.join(process.cwd(), "environments", "browser", ...pathParts);
	}

	/**
	 *
	 * @param {import("./types").RouteRegister<T>} routeRegistration
	 * @param {string} externalPath
	 * @param {string} internalPath
	 * @param {string} [contentType]
	 */
	#staticRoute(routeRegistration, externalPath, internalPath, contentType = undefined) {
		routeRegistration.get(externalPath, async () => this.#responseTypes.sendFile(internalPath, contentType));
	}

	/**
	 * @param {import("./types").RouteRegister<T>} routeRegistration
	 * @param {Redacted} redacted
	 */
	register(routeRegistration, redacted) {
		this.#staticRoute(
			routeRegistration,
			"/enableDocument.js",
			this.#getBrowserFile("enableDocument.js"),
			"text/javascript"
		);
		this.#staticRoute(routeRegistration, "/api.js", this.#getBrowserFile("api.js"), "text/javascript");
		this.#staticRoute(routeRegistration, "/history.js", this.#getBrowserFile("history.js"), "text/javascript");

		this.#staticRoute(routeRegistration, "/", this.#getBrowserFile("home", "home.html"));
		this.#staticRoute(routeRegistration, "/home", this.#getBrowserFile("home", "home.html"));
		this.#staticRoute(routeRegistration, "/home.html", this.#getBrowserFile("home", "home.html"));
		this.#staticRoute(routeRegistration, "/home.js", this.#getBrowserFile("home", "home.js"), "text/javascript");
		this.#staticRoute(routeRegistration, "/home.css", this.#getBrowserFile("home", "home.css"), "text/css");

		this.#staticRoute(
			routeRegistration,
			"/game/game.js",
			this.#getBrowserFile("game", "game.js"),
			"text/javascript"
		);
		this.#staticRoute(routeRegistration, "/game/game.css", this.#getBrowserFile("game", "game.css"), "text/css");

		routeRegistration.get("/game/:gameId", new GetPlayerActivityController(this.#responseTypes, redacted).handle);
	}
};
