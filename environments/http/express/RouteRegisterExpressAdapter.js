/** @typedef {import("../types").HttpRequest} HttpRequest */
/** @typedef {import("../types").HttpResponse} HttpResponse */
/**
 * @template {HttpResponse} T
 * @typedef {import("../types").RouteRegister<T>} RouteRegister<T>
 * */

const { RouteRejection } = require("../RouteRejection");

/**
 * @implements {RouteRegister<import("./ExpressResponse").ExpressResponse>}
 */
class RouteRegisterExpressAdapter {
	#expressApp;
	/** @type {Map<string, ((request: HttpRequest) => Promise<import("./ExpressResponse").ExpressResponse>)[]} */
	#routes;

	/**
	 *
	 * @param {import("express-serve-static-core").Express} expressApp
	 */
	constructor(expressApp) {
		this.#expressApp = expressApp;
		this.#routes = new Map();
	}

	/**
	 *
	 * @param {string} swaggerPath
	 * @returns
	 */
	#swaggerToExpressPath(swaggerPath) {
		if (!swaggerPath.includes("{")) return swaggerPath;
		return swaggerPath
			.split("/")
			.map((part) => {
				if (part.startsWith("{") && part.endsWith("}")) return ":" + part.substring(1, part.length - 1);
				return part;
			})
			.join("/");
	}

	/**
	 *
	 * @param {string} relativePath
	 * @param {(request: HttpRequest) => Promise<import("./ExpressResponse").ExpressResponse>} handler
	 */
	get(relativePath, handler) {
		this.#expressApp.get(this.#swaggerToExpressPath(relativePath), this.#handleRequest(handler));
	}

	/**
	 *
	 * @param {string} relativePath
	 * @param {(request: HttpRequest) => Promise<import("./ExpressResponse").ExpressResponse>} handler
	 */
	post(relativePath, handler) {
		this.#expressApp.post(this.#swaggerToExpressPath(relativePath), this.#handleRequest(handler));
	}

	/**
	 *
	 * @param {string} relativePath
	 * @param {(request: HttpRequest) => Promise<import("./ExpressResponse").ExpressResponse>} handler
	 */
	patch(relativePath, handler) {
		this.#expressApp.patch(this.#swaggerToExpressPath(relativePath), this.#handleRequest(handler));
	}

	/**
	 *
	 * @param {(request: HttpRequest) => Promise<import("./ExpressResponse").ExpressResponse>} handler
	 */
	#handleRequest = (handler) => {
		/**
		 * @param {import("express-serve-static-core").Request} req
		 * @param {import("express-serve-static-core").Response} res
		 */
		return (req, res, next) => {
			handler(this.#convertToHttpRequest(req))
				.then((response) => response.respondWith(res))
				.catch((error) => {
					if (error instanceof RouteRejection) {
						next();
					} else {
						console.error(error);
						if (!res.headersSent) res.sendStatus(500);
					}
				});
		};
	};

	/**
	 *
	 * @param {import("express-serve-static-core").Request} req
	 * @returns {HttpRequest}
	 */
	#convertToHttpRequest(req) {
		return {
			...req,
			ipAddress: req.ip,
		};
	}
}
exports.RouteRegisterExpressAdapter = RouteRegisterExpressAdapter;
