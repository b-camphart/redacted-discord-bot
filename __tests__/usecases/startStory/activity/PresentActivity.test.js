const {
	PlayerActivityPresenter,
} = require("../../../../environments/http/usecases/playerActivity/PlayerActivityPresenter");
const PlayerActivity = require("../../../../src/entities/playerActivities");

test("valid view model is generated", () => {
	const viewModel = PlayerActivity.StartingStory.accept(new PlayerActivityPresenter("game-18"));
	expect(viewModel.gameId).toBe("game-18");
	expect(viewModel).toHaveProperty("maxLength", PlayerActivityPresenter.MAX_ENTRY_LENGTH);
	expect(viewModel).toHaveProperty("locale", {
		startStory: "Start a Story",
		done: "Done",
	});
});
