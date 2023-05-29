module.exports = {
	CreateGame: require("./createGame/CreateGameController").CreateGameController,
	JoinGame: require("./joinGame/JoinGameController").JoinGameController,
	StartGame: require("./startGame/StartGameController").StartGameController,
	StartStory: require("./startStory/StartStoryController").StartStoryController,
	CensorStory: require("./redactStory/censor/CensorStoryController").CensorStoryController,
	TruncateStory: require("./redactStory/truncate/TruncateStoryController").TruncateStoryController,
	RepairCensoredStory: require("./repair/censoredStory/RepairCensoredStoryController").RepairCensoredStoryController,
	RepairTruncatedStory: require("./repair/truncatedStory/RepairTruncatedStoryController")
		.RepairTruncatedStoryController,
	ContinueStory: require("./continueStory/ContinueStoryController").ContinueStoryController,
};
