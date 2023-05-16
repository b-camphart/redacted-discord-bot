const {
	PlayerActivityPresenter,
} = require("../../../../environments/http/usecases/playerActivity/PlayerActivityPresenter");
const { ContinuingStory } = require("../../../../src/entities/playerActivities");

test("valid view model is generated", () => {
	const viewModel = new ContinuingStory(2, "The initial content of the third story.").accept(
		new PlayerActivityPresenter("game-18")
	);
	expect(viewModel.gameId).toBe("game-18");
	expect(viewModel).toHaveProperty("content", "The initial content of the third story.");
	expect(viewModel).toHaveProperty("maxlength", PlayerActivityPresenter.MAX_ENTRY_LENGTH);
	expect(viewModel).toHaveProperty("locale", {
		continue: "Continue",
		done: "Done",
	});
});
