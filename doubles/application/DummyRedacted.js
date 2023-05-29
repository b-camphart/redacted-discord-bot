const { NotImplemented } = require("../../environments/http/usecases/HttpUseCaseErrorHandler");
/** @typedef {import("../../src/application/types").Redacted} Redacted */

/**
 * @implements {Redacted}
 *
 * Every usecase method throws {@link NotImplemented}
 *
 */
class DummyRedacted {
	/**
	 * @returns {Promise<never>}
	 */
	async createGame() {
		throw new NotImplemented();
	}
	/**
	 * @returns {Promise<never>}
	 */
	async joinGame() {
		throw new NotImplemented();
	}
	/**
	 * @returns {Promise<never>}
	 */
	async startGame() {
		throw new NotImplemented();
	}
	/**
	 * @returns {Promise<never>}
	 */
	async startStory() {
		throw new NotImplemented();
	}
	/**
	 * @returns {Promise<never>}
	 */
	async censorStory() {
		throw new NotImplemented();
	}
	/**
	 * @returns {Promise<never>}
	 */
	async truncateStory() {
		throw new NotImplemented();
	}
	/**
	 * @returns {Promise<never>}
	 */
	async repairCensoredStory() {
		throw new NotImplemented();
	}
	/**
	 * @returns {Promise<never>}
	 */
	async repairTruncatedStory() {
		throw new NotImplemented();
	}
	/**
	 * @returns {Promise<never>}
	 */
	async continueStory() {
		throw new NotImplemented();
	}
}
exports.DummyRedacted = DummyRedacted;
