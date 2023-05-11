const {
    PlayerActivityPresenter,
} = require("../../../../environments/http/usecases/playerActivity/PlayerActivityPresenter");
const { PlayerActivity } = require("../../../../src/entities/Game.PlayerActivity");

test("valid view model is generated", () => {
    const viewModel = PlayerActivity.RedactingStory(2, "The initial content of the third story.").accept(
        new PlayerActivityPresenter("game-18")
    );
    expect(viewModel.gameId).toBe("game-18");
    expect(viewModel).toHaveProperty("content", [
        { content: "The", isRedaction: true },
        { content: " ", isRedaction: false },
        { content: "initial", isRedaction: true },
        { content: " ", isRedaction: false },
        { content: "content", isRedaction: true },
        { content: " ", isRedaction: false },
        { content: "of", isRedaction: true },
        { content: " ", isRedaction: false },
        { content: "the", isRedaction: true },
        { content: " ", isRedaction: false },
        { content: "third", isRedaction: true },
        { content: " ", isRedaction: false },
        { content: "story", isRedaction: true },
        { content: ".", isRedaction: false },
    ]);
    expect(viewModel).toHaveProperty("locale", {
        redact: "Redact",
        censor: "Censor",
        truncate: "Truncate",
        done: "Done",
    });
});
