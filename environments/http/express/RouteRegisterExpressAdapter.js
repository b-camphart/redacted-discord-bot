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
     * @param {(request: HttpRequest) => Promise<import("./ExpressResponse").ExpressResponse>} handler
     */
    get(relativePath, handler) {
        this.#expressApp.get(relativePath, this.#handleRequest(handler));
    }

    /**
     *
     * @param {string} relativePath
     * @param {(request: HttpRequest) => Promise<import("./ExpressResponse").ExpressResponse>} handler
     */
    post(relativePath, handler) {
        this.#expressApp.post(relativePath, this.#handleRequest(handler));
    }

    /**
     *
     * @param {(request: HttpRequest) => Promise<import("./ExpressResponse").ExpressResponse>} handler
     */
    #handleRequest(handler) {
        /**
         * @param {import("express-serve-static-core").Request} req
         * @param {import("express-serve-static-core").Response} res
         */
        return (req, res) => {
            handler(this.#convertToHttpRequest(req)).then((response) => response.respondWith(res));
        };
    }

    /**
     *
     * @param {import("express-serve-static-core").Request} req
     */
    #convertToHttpRequest(req) {
        return { ipAddress: req.ip, session: req.session, params: req.params };
    }
}
