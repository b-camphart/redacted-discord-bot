const path = require("path");

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
        routeRegistration.get("/", () =>
            this.#responseTypes.sendFile(path.join(__dirname, "browser", "home", "home.html"))
        );
        routeRegistration.get("/home", () =>
            this.#responseTypes.sendFile(path.join(__dirname, "browser", "home", "home.html"))
        );
        routeRegistration.get("/home.html", () =>
            this.#responseTypes.sendFile(path.join(__dirname, "browser", "home", "home.html"))
        );
        routeRegistration.get("/home.js", () =>
            this.#responseTypes.sendFile(path.join(__dirname, "browser", "home", "home.js"), "text/javascript")
        );
        routeRegistration.get("/home.css", () =>
            this.#responseTypes.sendFile(path.join(__dirname, "browser", "home", "home.css"), "text/css")
        );
        routeRegistration.get("/enableDocument.js", () =>
            this.#responseTypes.sendFile(path.join(__dirname, "browser", "enableDocument.js"), "text/javascript")
        );
    }
};
