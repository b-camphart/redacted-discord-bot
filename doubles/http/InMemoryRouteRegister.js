/** @typedef {import("../../environments/http/types").HttpRequest} HttpRequest */
/**
 * @template  T
 * @typedef {import("../../environments/http/types").ResponseTypes<T>} ResponseTypes
 */
/**
 * @template T
 * @typedef {import("../../environments/http/types").RouteRegister<T>} RouteRegister
 */

const { ClientError } = require("../../environments/http/HttpResponseStatusCodes");
const { RouteRejection } = require("../../environments/http/RouteRejection");

/**
 * @template T
 */
class DynamicRoute {
	/**
	 *
	 * @param {string} path
	 */
	static isDynamicPath(path) {
		return path.includes("{") && path.includes("}");
	}

	/**
	 *
	 * @param {string} method
	 * @param {string} staticPath
	 * @param {(request: HttpRequest) => Promise<T>} handler
	 */
	constructor(method, staticPath, handler) {
		this.method = method;
		this.definedParts = staticPath.split("/").map((pathPart) => {
			return {
				pattern: pathPart,
				isDynamic: pathPart.startsWith("{") && pathPart.endsWith("}"),
			};
		});
		this.handle = handler;
	}

	/**
	 *
	 * @param {string[]} parts
	 */
	matches(parts) {
		return parts.every((receivedPart, index) => {
			const definedPart = this.definedParts.at(index);
			if (definedPart == null) return false;
			if (definedPart.isDynamic) return true;
			return receivedPart === definedPart.pattern;
		});
	}
}

/**
 * @template T
 * @implements {RouteRegister<T>}
 */
class InMemoryRouteRegister {
	/**
	 * @type {Map<string, Array<(request: HttpRequest) => Promise<T>>>}
	 */
	#routes;

	/** @type {DynamicRoute<T>[]} */
	#dynamicRoutes;

	constructor() {
		this.#routes = new Map();
		this.#dynamicRoutes = [];
	}

	/**
	 *
	 * @param {HttpRequest} request
	 */
	async route(request) {
		let path = request.path;
		if (request.path.includes("?")) {
			path = request.path.substring(0, request.path.indexOf("?"));
		}
		const key = request.method + " " + path;
		let handlers = this.#routes.get(key);
		if (!handlers || handlers.length === 0) {
			const pathParts = path.split("/");
			const dynamicRoutes = this.#dynamicRoutes.filter(
				(dynamicRoute) => dynamicRoute.method === request.method && dynamicRoute.matches(pathParts)
			);
			if (!dynamicRoutes || dynamicRoutes.length === 0) throw ClientError["Not Found"];
			handlers = dynamicRoutes.map((dynamicRoute) => dynamicRoute.handle);
		}
		for (const handler of handlers) {
			try {
				return await handler(request);
			} catch (e) {
				if (!(e instanceof RouteRejection)) throw e;
			}
		}
		throw new Error("" + ClientError["Not Found"] + " Not Found");
	}

	/**
	 *
	 * @param {string} method
	 * @param {string} path
	 * @param {(request: HttpRequest) => Promise<T>} handler
	 */
	#register(method, path, handler) {
		if (DynamicRoute.isDynamicPath(path)) {
			this.#dynamicRoutes.push(new DynamicRoute(method, path, handler));
		} else {
			const key = method + " " + path;
			let handlers = this.#routes.get(key);
			if (handlers == null) {
				handlers = [];
				this.#routes.set(key, handlers);
			}
			handlers.push(handler);
		}
	}

	/**
	 *
	 * @param {string} path
	 * @param {(request: HttpRequest) => Promise<T>} handler
	 */
	get(path, handler) {
		this.#register("GET", path, handler);
	}

	/**
	 *
	 * @param {string} path
	 * @param {(request: HttpRequest) => Promise<T>} handler
	 */
	patch(path, handler) {
		this.#register("PATCH", path, handler);
	}
	/**
	 *
	 * @param {string} path
	 * @param {(request: HttpRequest) => Promise<T>} handler
	 */
	post(path, handler) {
		this.#register("POST", path, handler);
	}
}
exports.InMemoryRouteRegister = InMemoryRouteRegister;
