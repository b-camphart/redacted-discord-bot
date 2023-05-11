const {
    PlayerActivityPresenter,
} = require("../../../../environments/http/usecases/playerActivity/PlayerActivityPresenter");
const { PlayerActivity } = require("../../../../src/entities/Game.PlayerActivity");
const { range } = require("../../../../src/utils/range");

test("valid view model is generated", () => {
    const viewModel = PlayerActivity.ReadingFinishedStories([
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
    ]).accept(new PlayerActivityPresenter("game-18"));
    expect(viewModel.gameId).toBe("game-18");
    expect(viewModel).toHaveProperty("stories", [
        [
            {
                content: [
                    { content: "The ", isRedaction: false },
                    { content: "repaired", isRedaction: true },
                    { content: " first story content", isRedaction: false },
                ],
                contributors: ["player-1", "player-2", "player-3"],
            },
            {
                content: [
                    { content: "The repaired ", isRedaction: false },
                    { content: "first", isRedaction: true },
                    { content: " ", isRedaction: false },
                    { content: "story", isRedaction: true },
                    { content: " second entry", isRedaction: false },
                ],
                contributors: ["player-4", "player-1", "player-2"],
            },
        ],
        [
            {
                content: [
                    { content: "The repaired second ", isRedaction: false },
                    { content: "story content", isRedaction: true },
                ],
                contributors: ["player-2", "player-3", "player-4"],
            },
            {
                content: [
                    { content: "The ", isRedaction: false },
                    { content: "repaired", isRedaction: true },
                    { content: " second story second entry", isRedaction: false },
                ],
                contributors: ["player-1", "player-2", "player-3"],
            },
        ],
    ]);
    expect(viewModel).toHaveProperty("locale", {
        reading: "Read the Finished Stories!",
    });
});
