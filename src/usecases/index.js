module.exports = {
    CreateGame: require("./createGame/CreateGameUseCase").CreateGameUseCase,
    JoinGame: require("./joinGame/JoinGame").JoinGame,
    StartGame: require("./startGame/StartGame").StartGame,
    StartStory: require("./StartStory").StartStory,
    RedactStory: require("./RedactStory").RedactStory,
    RepairStory: require("./RepairStory").RepairStory,
    ContinueStory: require("./ContinueStory").ContinueStory,
};
