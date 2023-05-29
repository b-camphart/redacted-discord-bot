const express = require("express");
const { RouteRegisterExpressAdapter } = require("../../environments/http/express/RouteRegisterExpressAdapter");
const { ExpressResponses } = require("../../environments/http/express/ExpressResponses");
const { Rest } = require("../../environments/http/rest");
const { Redacted } = require("../../src/application/Redacted");
const { AllUsersExistRepository } = require("../repositories/FakeUserRepository");
const { FakeGameRepository } = require("../repositories/FakeGameRepository");
const { FakeSubscribedPlayerRepository } = require("../repositories/SubscribedPlayerRepositoryDoubles");
const { DumbPlayerNotifier } = require("../repositories/PlayerNotifierDoubles");

const rest = new Rest(ExpressResponses);

const expressApp = express();

const expressSession = require("express-session");
expressApp.use(
	expressSession({
		secret: "testing secret",
		resave: false,
		saveUninitialized: true,
	})
);

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

const redacted = new Redacted(
	new AllUsersExistRepository(),
	new FakeGameRepository(randomId),
	new FakeSubscribedPlayerRepository(),
	new DumbPlayerNotifier()
);

rest.register(routeRegister, redacted);

expressApp.listen(3000, () => {
	console.log("test server is up and running");
});
