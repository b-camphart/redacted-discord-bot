/**
 * @template {import("../../environments/http/types").HttpResponse} T
 * @typedef {import("../../environments/http/types").ResponseTypes<T>} ResponseTypes
 */

/**
 * @implements {ResponseTypes<any>}
 */
exports.DummyResponseTypes = class DummyResponseTypes {
	/**
	 * {@link ResponseTypes.sendFile}
	 *
	 * @param {string} absolutePath
	 * @param {string} [contentType]
	 *
	 * @returns {any}
	 */
	sendFile(absolutePath, contentType) {
		return { absolutePath, contentType };
	}
	/**
	 * {@link ResponseTypes.sendStatus}
	 *
	 * @param {number} status
	 * @param {string} [customMessage]
	 *
	 * @returns {any}
	 */
	sendStatus(status, customMessage) {
		return { status, message: customMessage };
	}
	/**
	 * {@link ResponseTypes.redirect}
	 *
	 * @param {string} relativePath
	 *
	 * @returns {any}
	 */
	redirect(relativePath) {
		return { relativePath };
	}
	/**
	 * {@link ResponseTypes.send}
	 *
	 * @param {string} content
	 * @param {string} [contentType]
	 *
	 * @returns {any}
	 */
	send(content, contentType) {
		return { content, contentType };
	}
};
