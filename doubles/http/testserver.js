const { Pages } = require("../../environments/http/pages");
const { RouteRegisterExpressAdapter } = require("../../environments/http/express/RouteRegisterExpressAdapter");
const { ExpressResponses } = require("../../environments/http/express/ExpressResponses");
const { Rest } = require("../../environments/http/rest");
const { Redacted } = require("../../src/application/Redacted");
const { AllUsersExistRepository } = require("../repositories/FakeUserRepository");
const { FakeGameRepository } = require("../repositories/FakeGameRepository");
const { FakeSubscribedPlayerRepository } = require("../repositories/SubscribedPlayerRepositoryDoubles");
const { DumbPlayerNotifier } = require("../repositories/PlayerNotifierDoubles");

const pages = new Pages(ExpressResponses);
const rest = new Rest(ExpressResponses);

const expressApp = require("../../environments/http/express/expressApp").expressApp;

const routeRegister = new RouteRegisterExpressAdapter(expressApp);

//
const letters = "abcdefghijklmnopqrstuvwxyz".split("");
const MAX_GAME_IDS = 456_976;
/**
 *
 * @param {number} number
 * @returns
 */
const randomNum = (number) => {
	const hash = number ^ 28_563;
	let result = Math.floor(((hash % MAX_GAME_IDS) / MAX_GAME_IDS) * (MAX_GAME_IDS - 1));
	if (result === number) result = result + (1 % MAX_GAME_IDS);
	return result;
};

/**
 *
 * @param {number} number
 * @returns
 */
const randomId = (number) => {
	const random = randomNum(number);
	const first = Math.floor(random / 17_576) % 26;
	const second = Math.floor(random / 676) % 26;
	const third = Math.floor(random / 26) % 26;
	const fourth = random % 26;
	return letters[first] + letters[second] + letters[third] + letters[fourth];
};

const games = new FakeGameRepository(randomId);

const redacted = new Redacted(
	new AllUsersExistRepository(),
	games,
	new FakeSubscribedPlayerRepository(),
	new DumbPlayerNotifier()
);

pages.register(routeRegister, redacted, games);
rest.register(routeRegister, redacted);

expressApp.listen(3000, () => {
	console.log("test server is up and running");
});
