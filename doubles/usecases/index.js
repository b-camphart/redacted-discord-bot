exports.make = {
    repairCensoredStory: require("./repair/censoredStory").make,
    repairTruncatedStory: require("./repair/truncatedStory").make,
    continueStory: require("./continueStory").make,
};

exports.repairCensoredStory = require("./repair/censoredStory").repairCensoredStory;
exports.repairTruncatedStory = require("./repair/truncatedStory").repairTruncatedStory;
exports.conintueStory = require("./continueStory").continueStory;
