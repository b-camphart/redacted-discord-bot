const { InMemoryRouteRegister } = require("../../../../doubles/http/InMemoryRouteRegister");
const { ClientError } = require("../../../../environments/http/HttpResponseStatusCodes");

const route = require("../../../../environments/http/usecases/redactStory/censor/RestRoute");
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
const validRequest = route.createValidRequest("user-id", { gameId: "game-id", storyIndex: 2 }, { wordIndices: [] });

describe("correct command is required in query", () => {
	/** @param {any} query */
	const expectNotFoundErrorWithQuery = (query) => {
		const action = routeRegister.route({ ...validRequest, query });

		return expect(action).rejects.toThrow("" + ClientError["Not Found"]);
	};
	it("rejects requests that are missing a query", async () => {
		const query = undefined;
		await expectNotFoundErrorWithQuery(query);
	});

	it("rejects requests that do not specify a command in the query", async () => {
		const query = {};
		await expectNotFoundErrorWithQuery(query);
	});

	it("rejects requests with the wrong command", async () => {
		const query = { command: "some-other-command" };
		await expectNotFoundErrorWithQuery(query);
	});
});

it("accepts requests with the correct command", async () => {
	await routeRegister.route(validRequest);

	expect(handledRequest).toBe(validRequest);
});
