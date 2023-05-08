const { makeGame } = require("../../../doubles/entities/makeGame");
const { Game } = require("../../../src/entities/Game");
const { PlayerActivity } = require("../../../src/entities/Game.PlayerActivity");

describe("Story Order", () => {
    const players = ["player-1", "player-2", "player-3", "player-4"];

    /** @type {Game} */
    let game;

    beforeEach(() => {
        game = makeGame();
        players.forEach((playerId) => game.addPlayer(playerId));
        game.start();
        game.startStory("player-1", "content-1");
    });

    test("the next player is selected to act on the story", () => {
        game.startStory("player-2", "content-2");
        expect(game.playerActivity("player-2")).toEqual(PlayerActivity.RedactingStory(0, "content-1"));
    });

    test("the first player is selected to act on the last story", () => {
        game.startStory("player-4", "content-4");
        expect(game.playerActivity("player-1")).toEqual(PlayerActivity.RedactingStory(1, "content-4"));
    });
});
