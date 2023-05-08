const { param } = require("../../validation");
const { GameUseCase } = require("./GameUseCase");

class PlayerInGameUseCase extends GameUseCase {
    /** @param {import("../../repositories/GameRepository").ReadOnlyGameRepository} games */
    constructor(games) {
        super(games);
    }

    /**
     *
     * @param {any} gameId
     * @param {any} playerId
     */
    _validateInputs(gameId, playerId) {
        this._validateGameId(gameId);
        this._validatePlayerId(playerId);
    }

    /**
     *
     * @param {any} playerId
     */
    _validatePlayerId(playerId) {
        param("playerId", playerId).isRequired().mustBeString();
    }
}

exports.PlayerInGameUseCase = PlayerInGameUseCase;
