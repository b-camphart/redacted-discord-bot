/**
 * @typedef {object} Redaction
 * @prop {(game: import("../../../src/entities/types").Game<*>, playerId: string, storyIndex: number) => void} redact
 * @prop {(game: import("../../../src/entities/types").Game<*>, playerId: string, storyIndex: number) => void} repair
 */

/** @enum {Redaction} */
module.exports = {
	/** @type {Redaction} */
	Censor: {
		redact: (game, playerId, storyIndex) => {
			game.censorStory(playerId, storyIndex, [0]);
		},
		repair: (game, playerId, storyIndex) => {
			game.repairStory(playerId, storyIndex, ["replacement"]);
		},
	},
	/** @type {Redaction} */
	Truncate: {
		redact: (game, playerId, storyIndex) => {
			game.truncateStory(playerId, storyIndex, 1);
		},
		repair: (game, playerId, storyIndex) => {
			game.repairStory(playerId, storyIndex, "replacement");
		},
	},
};
