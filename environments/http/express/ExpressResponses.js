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
    send: (content, contentType = "text/text") => {
        return {
            respondWith: (res) => res.setHeader("Content-Type", contentType).send(content),
        };
    },
};
