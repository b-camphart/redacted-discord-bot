const {
    PlayerActivityPresenter,
} = require("../../../../../environments/http/usecases/playerActivity/PlayerActivityPresenter");
const { PlayerActivityView } = require("../../../../../environments/http/usecases/playerActivity/PlayerActivityView");
const { PlayerActivity } = require("../../../../../src/entities/Game.PlayerActivity");
const { range } = require("../../../../../src/utils/range");

test("non-empty view is generated", () => {
    const view = PlayerActivity.RepairingCensoredStory(2, "The initial content of the third story.", [
        range(4, 11),
        range(27, 32),
    ])
        .accept(new PlayerActivityPresenter("game-18"))
        .view(new PlayerActivityView());

    expect(view).not.toHaveLength(0);
});
