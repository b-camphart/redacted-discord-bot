module.exports = {
	createGame: require("../usecases/createGame/RestRoute"),
	joinGame: require("../usecases/joinGame/RestRoute"),
	startGame: require("../usecases/startGame/RestRoute"),
	startStory: require("../usecases/startStory/RestRoute"),
	censor: require("../usecases/redactStory/censor/RestRoute"),
	truncate: require("../usecases/redactStory/truncate/RestRoute"),
	repairCensoredStory: require("../usecases/repair/censoredStory/RestRoute"),
	repairTruncatedStory: require("../usecases/repair/truncatedStory/RestRoute"),
	continueStory: require("../usecases/continueStory/RestRoute"),
};
