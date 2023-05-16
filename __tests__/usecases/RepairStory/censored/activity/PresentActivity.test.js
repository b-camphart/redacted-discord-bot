const {
	PlayerActivityPresenter,
} = require("../../../../../environments/http/usecases/playerActivity/PlayerActivityPresenter");
const PlayerActivity = require("../../../../../src/entities/playerActivities");
const { range } = require("../../../../../src/utils/range");

test("valid view model is generated", () => {
	const viewModel = new PlayerActivity.RepairingCensoredStory(2, "The initial content of the third story.", [
		range(4, 11),
		range(27, 32),
	]).accept(new PlayerActivityPresenter("game-18"));
	expect(viewModel.gameId).toBe("game-18");
	expect(viewModel).toHaveProperty("content", "The ███████ content of the █████ story.");
	expect(viewModel).toHaveProperty("repairs", [
		{ label: "Repair 1", maxLength: PlayerActivityPresenter.MAX_CENSOR_LENGTH },
		{ label: "Repair 2", maxLength: PlayerActivityPresenter.MAX_CENSOR_LENGTH },
	]);
	expect(viewModel).toHaveProperty("locale", {
		repair: "Repair",
		done: "Done",
	});
});
