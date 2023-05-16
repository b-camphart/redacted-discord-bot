const { CreateGameController } = require("../../../environments/http/usecases/createGame/CreateGameController");
const { PlayerNotFound } = require("../../../src/repositories/UserRepositoryExceptions");
const { CreateGameSpy } = require("../../../doubles/usecases/createGame/CreateGameSpy");
const { FailingCreateGameStub } = require("../../../doubles/usecases/createGame/FailingCreateGameStub");
const { DummyResponseTypes } = require("../../../doubles/http/DummyResponseTypes");
const {
	createEmptyRequest,
	createUnauthenticatedRequest,
	createSessionedRequest,
} = require("../../../doubles/http/HttpRequestBuilders");
const { SuccessfulCreateGameStub } = require("../../../doubles/usecases/createGame/SuccessfulCreateGameStub");

const useCaseSpy = new CreateGameSpy();
const failingUseCaseStub = new FailingCreateGameStub();
const dummyResponseTypes = new DummyResponseTypes();

afterEach(() => {
	useCaseSpy.spiedCreatorId = "";
	failingUseCaseStub.reset();
});

const sessionId = "player-id";
const requestWithSessionId = createSessionedRequest({ id: sessionId });

const controller = new CreateGameController(dummyResponseTypes, useCaseSpy);
const failingController = new CreateGameController(dummyResponseTypes, failingUseCaseStub);
const successfulController = new CreateGameController(dummyResponseTypes, new SuccessfulCreateGameStub("1846"));

describe("returns aunauthorized resonse if userId is not defined", () => {
	const requestWithoutSession = createEmptyRequest();
	const requestWithoutSessionId = createUnauthenticatedRequest();
	test("fails if session is not defined", async () => {
		const response = await controller.handle(requestWithoutSession);
		expect(response).toBeDefined();
		expect(response).toHaveProperty("status", 401);
	});
	test("fails if userId is not defined", async () => {
		const response = await controller.handle(requestWithoutSessionId);
		expect(response).toBeDefined();
		expect(response).toHaveProperty("status", 401);
	});
});

describe("creates a new game", () => {
	test("calls create game use case", async () => {
		await controller.handle(requestWithSessionId);
		expect(useCaseSpy.spiedCreatorId).toBe(sessionId);
	});
});

describe("handles use case failures", () => {
	test("returns forbidden response if player was not found", async () => {
		failingUseCaseStub.failure = new PlayerNotFound(sessionId);
		const response = await failingController.handle(requestWithSessionId);
		expect(response).toBeDefined();
		expect(response).toHaveProperty("status", 403);
	});
	test("returns internal server error if unexpected error occurs", async () => {
		const response = await failingController.handle(requestWithSessionId);
		expect(response).toBeDefined();
		expect(response).toHaveProperty("status", 500);
	});
});

describe("returns new game url on success", () => {
	test("sends json data with new url", async () => {
		const response = await successfulController.handle(requestWithSessionId);
		expect(response).toBeDefined();
		expect(response).toHaveProperty("content", JSON.stringify({ gameUrl: "/game/1846" }));
		expect(response).toHaveProperty("contentType", "text/json");
	});
});
