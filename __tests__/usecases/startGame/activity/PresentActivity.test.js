const {
    PlayerActivityPresenter,
} = require("../../../../environments/http/usecases/playerActivity/PlayerActivityPresenter");
const { PlayerActivity } = require("../../../../src/entities/Game.PlayerActivity");

test("valid view model is generated", () => {
    const viewModel = PlayerActivity.AwaitingStart.accept(new PlayerActivityPresenter("game-18"));
    expect(viewModel.gameId).toBe("game-18");
    expect(viewModel).toHaveProperty("locale", {
        waitingForGameStart: "Waiting for Game to Start",
        startGame: "Start Game",
    });
});
