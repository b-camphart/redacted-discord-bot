const { ExpressResponses } = require("../../environments/http/express/ExpressResponses");
const { Rest } = require("../../environments/http/rest");
const { RouteRegisterExpressAdapter } = require("../../environments/http/express/RouteRegisterExpressAdapter");
const { DummyRedacted } = require("../../doubles/application/DummyRedacted");

/**
 *
 * This test ensures that the RouteRegisterExpressAdapter is properly handling the
 * routes defined by the Rest class.  It uses a DummyRedacted double to ensure the only thing
 * being tested is the received objects by the controllers.  Once the controller validates
 * that the required fields of the request were received, the DummyRedacted double will throw
 * a {@link NotImplemented} error, which should be translated into an http 418 response code.
 *
 * All passing tests will receive a 418 response code.
 *
 */
/** */
const rest = new Rest(ExpressResponses);

const expressApp = require("../../environments/http/express/expressApp").expressApp;

const routeRegister = new RouteRegisterExpressAdapter(expressApp);

rest.register(routeRegister, new DummyRedacted());

const port = 3000;
const server = expressApp.listen(port);
const host = "http://localhost:" + port;
afterAll(() => {
	server.closeAllConnections();
	server.close();
});

[
	Rest.createGame("Player 1", undefined, undefined),
	Rest.joinGame("Player 2", { gameId: "1234" }, undefined),
	Rest.startGame("Player 2", { gameId: "1234" }, undefined),
	Rest.startStory("Player 2", { gameId: "1234" }, { content: "Initial content." }),
	Rest.censorStory("Player 2", { gameId: "1234", storyIndex: 0 }, { wordIndices: [1] }),
	Rest.truncateStory("Player 2", { gameId: "1234", storyIndex: 0 }, { truncationCount: 1 }),
	Rest.repairCensoredStory("Player 2", { gameId: "1234", storyIndex: 0 }, { replacements: ["", ""] }),
	Rest.repairTruncatedStory("Player 2", { gameId: "1234", storyIndex: 0 }, { replacement: "" }),
	Rest.continueStory("Player 2", { gameId: "1234", storyIndex: 0 }, { content: "Continued content." }),
].forEach((request) => {
	const testName = request.path + " " + request.method;
	test(testName, async () => {
		const response = await fetch(host + request.path, httpRequestToFetchRequest(request));

		const status = response.status;
		if (status == 418) return;

		const statusMessage = response.statusText;
		const body = await response.text();

		throw new Error("Expected status: 418 I'm a teapot\nStatus: " + status + " " + statusMessage + "\n" + body);
	});
});

/**
 *
 * @param {import("../../environments/http/types").HttpRequest} request
 * @return {RequestInit}
 */
const httpRequestToFetchRequest = (request) => {
	return {
		method: request.method,
		body: JSON.stringify(request.body),
		headers: [
			["Cookie", request.session.id],
			["Content-Type", "application/json"],
		],
		referrer: host,
	};
};
