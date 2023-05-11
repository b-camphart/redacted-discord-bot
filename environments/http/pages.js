const path = require("path");
const { GetPlayerActivityController } = require("./usecases/playerActivity/get/GetPlayerActivityController");

/**
 * @template {HttpResponse} T
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
     * @param {import("./types").RouteRegister<T>} routeRegistration
     */
    register(routeRegistration) {
        routeRegistration.get("/", async () =>
            this.#responseTypes.sendFile(path.join(process.cwd(), "environments", "browser", "home", "home.html"))
        );
        routeRegistration.get("/home", async () =>
            this.#responseTypes.sendFile(path.join(process.cwd(), "environments", "browser", "home", "home.html"))
        );
        routeRegistration.get("/home.html", async () =>
            this.#responseTypes.sendFile(path.join(process.cwd(), "environments", "browser", "home", "home.html"))
        );
        routeRegistration.get("/home.js", async () =>
            this.#responseTypes.sendFile(
                path.join(process.cwd(), "environments", "browser", "home", "home.js"),
                "text/javascript"
            )
        );
        routeRegistration.get("/home.css", async () =>
            this.#responseTypes.sendFile(
                path.join(process.cwd(), "environments", "browser", "home", "home.css"),
                "text/css"
            )
        );
        routeRegistration.get("/enableDocument.js", async () =>
            this.#responseTypes.sendFile(
                path.join(process.cwd(), "environments", "browser", "enableDocument.js"),
                "text/javascript"
            )
        );
        routeRegistration.get("/game/:gameId", new GetPlayerActivityController(this.#responseTypes).handle);
        routeRegistration.get("/game.js", async () =>
            this.#responseTypes.sendFile(
                path.join(process.cwd(), "environments", "browser", "game", "game.js"),
                "text/javascript"
            )
        );
        routeRegistration.get("/game.css", async () =>
            this.#responseTypes.sendFile(
                path.join(process.cwd(), "environments", "browser", "game", "game.css"),
                "text/css"
            )
        );
    }
};
