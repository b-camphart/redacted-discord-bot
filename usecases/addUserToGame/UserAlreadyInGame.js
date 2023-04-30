exports.UserAlreadyInGame = class UserAlreadyInGame extends Error {
    constructor(userId, gameId) {
        super(`User with id ${userId} is already in game with id ${gameId}.`);
        this.name = "UserAlreadyInGameError";
    }
};
