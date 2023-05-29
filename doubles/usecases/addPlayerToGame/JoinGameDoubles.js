const { PlayerJoinedGame } = require("../../../src/usecases/joinGame/PlayerJoinedGame");

/**
 * @implements {UseCases.GameJoining}
 */
exports.JoinGameUseCaseDummy = class JoinGameUseCaseDummy {
	/**
	 * @see {@link UseCases.GameJoining.joinGame}
	 *
	 * @param {string} gameId
	 * @param {string} playerId
	 */
	async joinGame(gameId, playerId) {}
};

/**
 * @implements {UseCases.GameJoining}
 */
exports.JoinGameUseCaseSpy = class JoinGameUseCaseSpy {
	/**
	 * @type {{ gameId: string, playerId: string } | undefined}
	 */
	#received;
	get received() {
		return this.#received;
	}

	/**
	 * @type {PlayerJoinedGame | null}
	 */
	#returns = null;
	/**
	 * @param {PlayerJoinedGame | null} event
	 */
	set returns(event) {
		this.#returns = event;
	}

	/**
	 * @see {@link UseCases.GameJoining.joinGame}
	 *
	 * @param {string} gameId
	 * @param {string} playerId
	 */
	async joinGame(gameId, playerId) {
		this.#received = { gameId, playerId };
		if (this.#returns == null) return;
		return this.#returns;
	}
};
