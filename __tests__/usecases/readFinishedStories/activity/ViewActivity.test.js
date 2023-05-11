const {
    PlayerActivityPresenter,
} = require("../../../../environments/http/usecases/playerActivity/PlayerActivityPresenter");
const { PlayerActivityView } = require("../../../../environments/http/usecases/playerActivity/PlayerActivityView");
const { PlayerActivity } = require("../../../../src/entities/Game.PlayerActivity");
const { range } = require("../../../../src/utils/range");

test("valid view model is generated", () => {
    const view = PlayerActivity.ReadingFinishedStories([
        {
            entries: [
                {
                    repairedContent: "The repaired first story content",
                    redactions: [range(4, 12)],
                    contributors: ["player-1", "player-2", "player-3"],
                },
                {
                    repairedContent: "The repaired first story second entry",
                    redactions: [range(13, 18), range(19, 24)],
                    contributors: ["player-4", "player-1", "player-2"],
                },
            ],
        },
        {
            entries: [
                {
                    repairedContent: "The repaired second story content",
                    redactions: [range(20, 33)],
                    contributors: ["player-2", "player-3", "player-4"],
                },
                {
                    repairedContent: "The repaired second story second entry",
                    redactions: [range(4, 12)],
                    contributors: ["player-1", "player-2", "player-3"],
                },
            ],
        },
    ])
        .accept(new PlayerActivityPresenter("game-18"))
        .view(new PlayerActivityView());

    expect(view).not.toHaveLength(0);
    const matches = RegExp("{{.*}}").exec(view);
    if (!(matches === undefined || matches === null)) {
        throw new Error("Found non-replaced bindings.:::\n" + matches.join("\n"));
    }
});
