const { range, Range } = require("../utils/range");
const {
	RedactingStory,
	RepairingCensoredStory,
	RepairingTruncatedStory,
	ContinuingStory,
} = require("./playerActivities");

/**
 * @typedef {Object} StoryStatus
 * @property {string} action
 * @property {string} playerId
 *
 */

/**
 * @implements {StoryStatus}
 */
class StoryStatusWithCorrespondingActivity {
	/**
	 *
	 * @param {string} action
	 * @param {string} playerId
	 */
	constructor(action, playerId) {
		if (this.constructor === StoryStatusWithCorrespondingActivity)
			throw "Cannot instantiate abstract class StoryStatusWithCorrespondingActivity";
		this.action = action;
		this.playerId = playerId;
	}

	/**
	 * @param {number} storyIndex
	 * @returns {import("./playerActivities/types").PlayerActivity}
	 */
	toPlayerActivity(storyIndex) {
		throw "Abstract class.";
	}
}

exports.StoryStatusWithCorrespondingActivity = StoryStatusWithCorrespondingActivity;

class Redact extends StoryStatusWithCorrespondingActivity {
	static action = "redact";
	/**
	 *
	 * @param {string} playerId
	 * @param {string} entryContent
	 */
	constructor(playerId, entryContent) {
		super(Redact.action, playerId);
		this.entryContent = entryContent;
	}
	/**
	 *  @param {number} storyIndex
	 */
	toPlayerActivity(storyIndex) {
		return new RedactingStory(storyIndex, this.entryContent);
	}
}

class Repair extends StoryStatusWithCorrespondingActivity {
	static action = "repair";
	/**
	 *
	 * @param {string} playerId
	 * @param {{ type: "censor", censoredContent: string, censors: Range[] } | { type: "truncate", censoredContent: string, from: number }} redaction
	 *
	 */
	constructor(playerId, redaction) {
		super(Repair.action, playerId);
		/** @type {{ type: "censor", censoredContent: string, censors: Range[] } | { type: "truncate", censoredContent: string, from: number }} */
		this.redaction = {
			type: redaction.type,
			censoredContent: redaction.censoredContent,
			// @ts-ignore
			censors: redaction.censors || undefined,
			// @ts-ignore
			from: redaction.from || undefined,
		};
	}

	/**
	 *  @param {number} storyIndex
	 */
	toPlayerActivity(storyIndex) {
		if (this.redaction.type === "censor") {
			return new RepairingCensoredStory(storyIndex, this.redaction.censoredContent, this.redaction.censors);
		}
		return new RepairingTruncatedStory(storyIndex, this.redaction.censoredContent, this.redaction.from);
	}
}

class Continue extends StoryStatusWithCorrespondingActivity {
	static action = "continue";
	/**
	 *
	 * @param {string} playerId
	 * @param {string} repairedContent
	 */
	constructor(playerId, repairedContent) {
		super(Continue.action, playerId);
		this.repairedContent = repairedContent;
	}
	/**
	 *  @param {number} storyIndex
	 */
	toPlayerActivity(storyIndex) {
		return new ContinuingStory(storyIndex, this.repairedContent);
	}
}

/**
 * @implements {StoryStatus}
 */
class Completed {
	constructor() {
		this.action = "complete";
		this.playerId = "";
	}
}

exports.StoryStatus = {
	/**
	 *
	 * @param {string} playerId
	 * @param {string} entryContent
	 * @returns {StoryStatusWithCorrespondingActivity}
	 */
	Redact: (() => {
		/**
		 *
		 * @param {string} playerId
		 * @param {string} entryContent
		 * @returns {StoryStatusWithCorrespondingActivity}
		 */
		const callable = function (playerId, entryContent) {
			return new Redact(playerId, entryContent);
		};
		callable.action = Redact.action;
		return callable;
	})(),
	/**
	 *
	 * @param {string} playerId
	 * @param {string} censoredContent
	 * @param {number} from
	 * @returns {StoryStatusWithCorrespondingActivity}
	 */
	RepairTruncation: (() => {
		/**
		 *
		 * @param {string} playerId
		 * @param {string} censoredContent
		 * @param {number} from
		 * @returns {StoryStatusWithCorrespondingActivity}
		 */
		const callable = function (playerId, censoredContent, from) {
			return new Repair(playerId, { type: "truncate", censoredContent, from });
		};
		callable.action = Repair.action;
		return callable;
	})(),
	/**
	 *
	 * @param {string} playerId
	 * @param {string} censoredContent
	 * @param {[number, number][]} censors
	 * @returns {StoryStatusWithCorrespondingActivity}
	 */
	RepairCensor: (() => {
		/**
		 *
		 * @param {string} playerId
		 * @param {string} censoredContent
		 * @param {Range[]} censors
		 * @returns {StoryStatusWithCorrespondingActivity}
		 */
		const callable = function (playerId, censoredContent, censors) {
			return new Repair(playerId, { type: "censor", censoredContent, censors });
		};
		callable.action = Repair.action;
		return callable;
	})(),

	/**
	 *
	 * @param {string} playerId
	 * @param {string} repairedContent
	 * @returns {StoryStatus}
	 */
	Continue: (() => {
		/**
		 *
		 * @param {string} playerId
		 * @param {string} repairedContent
		 * @returns {StoryStatus}
		 */
		const callable = function (playerId, repairedContent) {
			return new Continue(playerId, repairedContent);
		};
		callable.action = Continue.action;
		return callable;
	})(),

	Completed: new Completed(),
};
