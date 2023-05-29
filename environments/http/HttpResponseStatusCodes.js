/**
 * @see {@link "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status"}
 */
module.exports = {
	/**
	 * @enum {number}
	 */
	Information: {},
	/**
	 * @enum {number}
	 *
	 * @see {@link "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#successful_responses"}
	 */
	Successful: {
		/**
		 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/200}
		 */
		OK: 200,
		/**
		 * 201
		 *
		 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/201}
		 *
		 * The request succeeded, and a new resource was created as a result. This is typically
		 * the response sent after `POST` requests, or some PUT requests.
		 */
		Created: 201,
		Accepted: 202,
		"Non-Authoritative Information": 203,
		"No Content": 204,
		/**
		 * @see {@link "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/205"}
		 *
		 * Tells the user agent to reset the document which sent this request.
		 */
		"Reset Content": 205,
		"Partial Content": 206,
		/**
		 *
		 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/207}
		 *
		 * Conveys information about multiple resources, for situations where multiple status
		 * codes might be appropriate.
		 */
		"Multi-Status": 207,

		/**
		 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/208}
		 *
		 * Used inside a `<dav:propstat>` response element to avoid repeatedly enumerating
		 * the internal members of multiple bindings to the same collection.
		 */
		"Already Reported": 208,
	},
	/**
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#redirection_messages}
	 *
	 * @enum {number}
	 */
	Redirection: {
		/**
		 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/300}
		 *
		 * The request has more than one possible response. The user agent or user should choose
		 * one of them. (There is no standardized way of choosing one of the responses, but HTML
		 * links to the possibilities are recommended so the user can pick.)
		 */
		"Multiple Choices": 300,
		/**
		 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/301}
		 *
		 * The URL of the requested resource has been changed permanently. The new URL is given
		 * in the response.
		 */
		"Moved Permanently": 301,
		/**
		 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/302}
		 *
		 * This response code means that the URI of requested resource has been changed
		 * temporarily. Further changes in the URI might be made in the future. Therefore,
		 * this same URI should be used by the client in future requests.
		 */
		Found: 302,
		/**
		 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/303}
		 *
		 * The server sent this response to direct the client to get the requested resource
		 * at another URI with a GET request.
		 */
		"See Other": 303,
		/**
		 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/304}
		 *
		 * This is used for caching purposes. It tells the client that the response has not
		 * been modified, so the client can continue to use the same cached version of the response.
		 */
		"Not Modified": 304,
		/**
		 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/305}
		 *
		 * Defined in a previous version of the HTTP specification to indicate that a requested
		 * response must be accessed by a proxy. It has been deprecated due to security concerns
		 * regarding in-band configuration of a proxy.
		 */
		"Use Proxy ": 305,
		/**
		 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/306}
		 *
		 * This response code is no longer used; it is just reserved. It was used in a previous
		 * version of the HTTP/1.1 specification.
		 */
		unused: 306,
		/**
		 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/307}
		 *
		 * The server sends this response to direct the client to get the requested resource at
		 * another URI with the same method that was used in the prior request. This has the same
		 * semantics as the `302 Found` HTTP response code, with the exception that the user agent
		 * must not change the HTTP method used: if a `POST` was used in the first request, a `POST`
		 * must be used in the second request.
		 */
		"Temporary Redirect": 307,
		/**
		 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/308}
		 *
		 * This means that the resource is now permanently located at another URI, specified by
		 * the `Location`: HTTP Response header. This has the same semantics as the
		 * `301 Moved Permanently` HTTP response code, with the exception that the user agent must
		 * not change the HTTP method used: if a `POST` was used in the first request, a `POST` must
		 * be used in the second request.
		 */
		"Permanent Redirect": 308,
	},
	/**
	 * @see {@link "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#client_error_responses"}
	 *
	 * @enum {number}
	 */
	ClientError: {
		/**
		 * @see {@link "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/400"}
		 *
		 * The server cannot or will not process the request due to something that is perceived
		 * to be a client error (e.g., malformed request syntax, invalid request message framing,
		 * or deceptive request routing).
		 */
		"Bad Request": 400,
		/**
		 * @see {@link "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/401"}
		 *
		 * Although the HTTP standard specifies "unauthorized", semantically this response means
		 * "unauthenticated". That is, the client must authenticate itself to get the requested
		 * response.
		 */
		Unauthorized: 401,

		/**
		 * 404
		 *
		 * @see {@link "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/404"}
		 *
		 * The server cannot find the requested resource. In the browser, this means the URL is
		 * not recognized. In an API, this can also mean that the endpoint is valid but the resource
		 * itself does not exist. Servers may also send this response instead of `403 Forbidden` to
		 * hide the existence of a resource from an unauthorized client. This response code is
		 * probably the most well known due to its frequent occurrence on the web.
		 */
		"Not Found": 404,

		"Not Acceptable": 406,
	},
	/**
	 * @enum {number}
	 */
	ServerError: {},

	/**
	 *
	 * @param {number} status
	 * @returns {string?}
	 */
	lookupName: function (status) {
		const ranges = [this.Information, this.Successful, this.Redirection, this.ClientError, this.ServerError];
		for (const codeRange of ranges) {
			for (const [message, code] of Object.entries(codeRange)) {
				if (code === status) return message;
			}
		}
		return null;
	},
};
