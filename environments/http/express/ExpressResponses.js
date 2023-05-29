/**
 * @template {import("../types").HttpResponse} T
 * @typedef {import("../types").ResponseTypes<T>} ResponseTypes<T>
 */

/**
 * @param {string} path
 * @returns {string}
 */
const contentTypeFromPath = (path) => {
	if (path.endsWith(".js")) return "text/javascript";
	if (path.endsWith(".css")) return "text/css";
	if (path.endsWith(".html")) return "text/html";
	return "text/text";
};

/**
 * @type {ResponseTypes<import("./ExpressResponse").ExpressResponse>}
 */
exports.ExpressResponses = {
	sendFile: (absolutePath, contentType) => {
		const type = contentType || contentTypeFromPath(absolutePath);
		return {
			respondWith: (res) => res.setHeader("Content-Type", type).sendFile(absolutePath),
		};
	},
	sendStatus: (status, customMessage) => {
		return {
			respondWith: (res) => (customMessage ? res.status(status).send(customMessage) : res.sendStatus(status)),
		};
	},
	redirect: (relativePath) => {
		return {
			respondWith: (res) => res.redirect(relativePath),
		};
	},
	sendObject: (obj) => {
		return {
			respondWith: (res) => res.status(200).json(obj),
		};
	},
	send: (content, contentType = "text/text") => {
		return {
			respondWith: (res) => {
				res.setHeader("Content-Type", contentType).send(content);
			},
		};
	},
	sendStatusWithBody: ({ status, body, customMessage, contentType }) => {
		return {
			respondWith: (res) => {
				res.setHeader("Content-Type", contentType || "text/text");
				if (customMessage != null) res.statusMessage = customMessage;
				res.status(status);
				res.send(body);
			},
		};
	},
};
