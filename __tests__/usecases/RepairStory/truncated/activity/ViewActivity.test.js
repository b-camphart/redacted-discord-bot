const {
	PlayerActivityPresenter,
} = require("../../../../../environments/http/usecases/playerActivity/PlayerActivityPresenter");
const { PlayerActivityView } = require("../../../../../environments/http/usecases/playerActivity/PlayerActivityView");
const PlayerActivity = require("../../../../../src/entities/playerActivities");

test("non-empty view is generated", () => {
	const view = new PlayerActivity.RepairingTruncatedStory(2, "The initial content of the third story.", 27)
		.accept(new PlayerActivityPresenter("game-18"))
		.view(new PlayerActivityView());

	expect(view).not.toHaveLength(0);
	const matches = RegExp("{{.*}}").exec(view);
	if (!(matches === undefined || matches === null)) {
		throw new Error("Found non-replaced bindings.:::\n" + matches.join("\n"));
	}
});
