const {
	PlayerActivityPresenter,
} = require("../../../../../environments/http/usecases/playerActivity/PlayerActivityPresenter");
const PlayerActivity = require("../../../../../src/entities/playerActivities");
const { range } = require("../../../../../src/utils/range");

test("valid view model is generated", () => {
	const viewModel = new PlayerActivity.RepairingTruncatedStory(
		2,
		"The initial content of the third story.",
		27
	).accept(new PlayerActivityPresenter("game-18"));
	expect(viewModel.gameId).toBe("game-18");
	expect(viewModel).toHaveProperty("content", "The initial content of the ████████████");
	expect(viewModel).toHaveProperty("repair", {
		label: "Complete",
		maxLength: PlayerActivityPresenter.MAX_ENTRY_LENGTH,
	});
	expect(viewModel).toHaveProperty("locale", {
		repair: "Repair",
		done: "Done",
	});
});
