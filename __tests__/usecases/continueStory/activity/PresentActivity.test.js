const {
    PlayerActivityPresenter,
} = require("../../../../environments/http/usecases/playerActivity/PlayerActivityPresenter");
const { PlayerActivity } = require("../../../../src/entities/Game.PlayerActivity");

test("valid view model is generated", () => {
    const viewModel = PlayerActivity.ContinuingStory(2, "The initial content of the third story.").accept(
        new PlayerActivityPresenter("game-18")
    );
    expect(viewModel.gameId).toBe("game-18");
    expect(viewModel).toHaveProperty("content", "The initial content of the third story.");
    expect(viewModel).toHaveProperty("locale", {
        continue: "Continue",
        done: "Done",
    });
});
