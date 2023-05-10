/** @typedef {import("../types").HttpRequest} HttpRequest */
/** @typedef {import("../types").HttpResponse} HttpResponse */
/**
 * @template {HttpResponse} T
 * @typedef {import("../types").RouteRegister<T>} RouteRegister<T>
 * */

/**
 * @implements {RouteRegister<import("./ExpressResponse").ExpressResponse>}
 */
class RouteRegisterExpressAdapter {
    #expressApp;

    /**
     *
     * @param {import("express-serve-static-core").Express} expressApp
     */
    constructor(expressApp) {
        this.#expressApp = expressApp;
    }

    /**
     *
     * @param {string} relativePath
     * @param {(request: HttpRequest) => import("./ExpressResponse").ExpressResponse} handler
     */
    get(relativePath, handler) {
        this.#expressApp.get(relativePath, (req, res) => {
            const response = handler({ ipAddress: req.ip });
            response.respondWith(res);
        });
    }
}
