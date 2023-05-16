const { makeGame } = require("../../../doubles/entities/makeGame");
const { RedactingStory } = require("../../../src/entities/playerActivities");

describe("Story Order", () => {
	const players = ["player-1", "player-2", "player-3", "player-4"];

	/** @type {import("../../../src/entities/types").Game<undefined>} */
	let game;

	beforeEach(() => {
		game = makeGame();
		players.forEach((playerId) => game.addPlayer(playerId));
		game.start();
		game.startStory("player-1", "content one");
	});

	test("the next player is selected to act on the story", () => {
		game.startStory("player-2", "content two");
		expect(game.playerActivity("player-2")).toEqual(new RedactingStory(0, "content one"));
	});

	test("the first player is selected to act on the last story", () => {
		game.startStory("player-4", "content four");
		expect(game.playerActivity("player-1")).toEqual(new RedactingStory(1, "content four"));
	});
});
