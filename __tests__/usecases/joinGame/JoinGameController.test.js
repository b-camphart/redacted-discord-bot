const { DummyResponseTypes } = require("../../../doubles/http/DummyResponseTypes");
const { httpRequest } = require("../../../doubles/http/HttpRequestBuilders");
const { JoinGameUseCaseSpy } = require("../../../doubles/usecases/addPlayerToGame/JoinGameDoubles");
const HttpResponseStatusCodes = require("../../../environments/http/HttpResponseStatusCodes");
const { ClientError } = require("../../../environments/http/HttpResponseStatusCodes");
const HttpControllers = require("../../../environments/http/usecases/HttpControllers");
const { PlayerJoinedGame } = require("../../../src/usecases/joinGame/PlayerJoinedGame");

const useCaseSpy = new JoinGameUseCaseSpy();
const controller = new HttpControllers.JoinGame(new DummyResponseTypes(), useCaseSpy);
const gameId = "game-id-14";
const playerId = "player-92";

it("requires a gameId in the request", async () => {
	const response = await controller.handle(httpRequest({ params: {}, session: { id: playerId } }));

	expect(response.status).toBe(ClientError["Bad Request"]);
	expect(JSON.parse(response.body).errors).toContain("Missing required param: gameId");
	expect(response.contentType).toBe("application/json");
});

it("requires a playerId in the request", async () => {
	const response = await controller.handle(httpRequest({ params: { gameId } }));

	expect(response.status).toBe(ClientError.Unauthorized);
});

it("calls the use case with provided gameId and playerId", async () => {
	await controller.handle(httpRequest({ params: { gameId }, session: { id: playerId } }));

	expect(useCaseSpy.received?.gameId).toBe(gameId);
	expect(useCaseSpy.received?.playerId).toBe(playerId);
});

it("returns stringified event upon success", async () => {
	useCaseSpy.returns = new PlayerJoinedGame(gameId, playerId);

	const response = await controller.handle(httpRequest({ params: { gameId }, session: { id: playerId } }));

	expect(response.status).toBe(HttpResponseStatusCodes.Successful.OK);
	expect(JSON.parse(response.body)).toEqual({ gameId, addedPlayerId: playerId });
	expect(response.contentType).toBe("application/json");
});

it("returns an empty, successful response if the player already joined", async () => {
	useCaseSpy.returns = null;

	const response = await controller.handle(httpRequest({ params: { gameId }, session: { id: playerId } }));

	expect(response.status).toBe(HttpResponseStatusCodes.Successful["Already Reported"]);
	expect(response.body).not.toBeDefined();
});
