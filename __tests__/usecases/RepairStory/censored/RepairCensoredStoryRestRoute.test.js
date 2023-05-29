const { InMemoryRouteRegister } = require("../../../../doubles/http/InMemoryRouteRegister");
const { ClientError } = require("../../../../environments/http/HttpResponseStatusCodes");

const route = require("../../../../environments/http/usecases/repair/censoredStory/RestRoute");
const routeRegister = new InMemoryRouteRegister();
/** @type {import("../../../../environments/http/types").HttpRequest | null} */
let handledRequest = null;
route.register(routeRegister, {
	handle: async (request) => {
		handledRequest = request;
	},
});
beforeEach(() => {
	handledRequest = null;
});
const validRequest = route.createValidRequest("user-id", { gameId: "game-id", storyIndex: 2 }, { replacements: [] });

it("rejects requests that are missing a query", async () => {
	const action = routeRegister.route({
		...validRequest,
		query: undefined,
	});

	await expect(action).rejects.toThrow("" + ClientError["Not Found"]);
});

it("rejects requests that do not specify a command in the query", async () => {
	const action = routeRegister.route({
		...validRequest,
		query: {},
	});

	await expect(action).rejects.toThrow("" + ClientError["Not Found"]);
});

it("rejects requests with the wrong command", async () => {
	const action = routeRegister.route({
		...validRequest,
		query: { command: "some-other-command" },
	});

	await expect(action).rejects.toThrow("" + ClientError["Not Found"]);
});

it("accepts requests with the correct command", async () => {
	await routeRegister.route(validRequest);

	expect(handledRequest).toBe(validRequest);
});
