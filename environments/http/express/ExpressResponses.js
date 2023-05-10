/**
 * @template {HttpResponse} T
 * @typedef {import("../types").ResponseTypes<T>} ResponseTypes<T>
 */

/**
 * @type {ResponseTypes<import("./ExpressResponse").ExpressResponse>}
 */
exports.ExpressResponses = {
    sendFile: (absolutePath, contentType = "text/css") => {
        return {
            respondWith: (res) => res.setHeader("Content-Type", contentType).sendFile(absolutePath),
        };
    },
};
