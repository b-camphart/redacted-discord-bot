const { makeGame } = require("../../../doubles/entities/makeGame");
const { Game } = require("../../../entities/Game");
const { PlayerActivity } = require("../../../entities/Game.PlayerActivity");

describe("Story Order", () => {
    const players = ["player-1", "player-2", "player-3", "player-4"];

    /** @type {Game} */
    let game;

    beforeEach(() => {
        game = makeGame();
        players.forEach((playerId) => game.addUser(playerId));
        game.start();
        game.startStory("player-1", "content-1");
    });

    test("the next player is selected to act on the story", () => {
        game.startStory("player-2", "content-2");
        expect(game.userActivity("player-2")).toEqual(PlayerActivity.RedactingStory(0));
    });

    test("the first player is selected to act on the last story", () => {
        game.startStory("player-4", "content-4");
        expect(game.userActivity("player-1")).toEqual(PlayerActivity.RedactingStory(1));
    });
});
