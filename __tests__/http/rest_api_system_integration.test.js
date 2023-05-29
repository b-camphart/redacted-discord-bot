/**
 * @template  T
 * @typedef {import("../../environments/http/types").ResponseTypes<T>} ResponseTypes
 */

const HttpResponseStatusCodes = require("../../environments/http/HttpResponseStatusCodes");
const { InMemoryRouteRegister } = require("../../doubles/http/InMemoryRouteRegister");
const { FakeGameRepository } = require("../../doubles/repositories/FakeGameRepository");
const { AllUsersExistRepository } = require("../../doubles/repositories/FakeUserRepository");
const { DumbPlayerNotifier } = require("../../doubles/repositories/PlayerNotifierDoubles");
const { FakeSubscribedPlayerRepository } = require("../../doubles/repositories/SubscribedPlayerRepositoryDoubles");
const { Successful, Redirection } = require("../../environments/http/HttpResponseStatusCodes");
const { Rest } = require("../../environments/http/rest");
const { Redacted } = require("../../src/application/Redacted");

/**
 * @implements {ResponseTypes<{ status: number, contentType: string, response?: string }>}
 */
class DummyResponseTypes {
	/**
	 *
	 * @param {string} absolutePath
	 * @returns
	 */
	sendFile(absolutePath) {
		const extension = require("path").extname(absolutePath);
		return {
			status: Successful.OK,
			contentType: extension === "json" ? "application/json" : "text/" + extension,
			response: require("fs").readFileSync(absolutePath).join(""),
		};
	}
	/**
	 *
	 * @param {number} status
	 * @param {string} [customMessage]
	 * @returns
	 */
	sendStatus(status, customMessage) {
		const message = customMessage || HttpResponseStatusCodes.lookupName(status) || undefined;
		return { status, contentType: "text/text", response: message };
	}
	/**
	 *
	 * @param {object} params
	 * @param {number} params.status
	 * @param {string} params.body
	 * @param {string} [params.contentType]
	 * @returns
	 */
	sendStatusWithBody({ status, contentType, body }) {
		return { status, contentType: contentType || "text/text", response: body };
	}
	redirect() {
		return { status: Redirection["See Other"], contentType: "text/text" };
	}
	/**
	 *
	 * @param {object} obj
	 * @returns
	 */
	sendObject(obj) {
		return { status: Successful.OK, contentType: "application/json", response: JSON.stringify(obj) };
	}
	/**
	 *
	 * @param {string} content
	 * @param {string} [contentType]
	 * @returns
	 */
	send(content, contentType) {
		return { status: Successful.OK, contentType: contentType || "text/text", response: content };
	}
}

/**
 * @type {InMemoryRouteRegister<{ status: number, contentType: string, response: string? }>}
 */
const router = new InMemoryRouteRegister();
const rest = new Rest(new DummyResponseTypes());
rest.register(
	router,
	new Redacted(
		new AllUsersExistRepository(),
		new FakeGameRepository(),
		new FakeSubscribedPlayerRepository(),
		new DumbPlayerNotifier()
	)
);

test("create game route", async () => {
	const response = await router.route(Rest.createGame("Player 1", undefined, undefined));
	expect(response.status).toBe(Successful.Created);
	expect(response.contentType.split(";")).toContain("application/json");
	let responseBody = response.response;
	expect(responseBody).toBeDefined();
	responseBody = /** @type {string} */ (responseBody);
	expect(responseBody.length).toBeGreaterThan(0);
	const responseObject = JSON.parse(responseBody);
	expect(responseObject).toHaveProperty("gameId");
	expect(responseObject).toHaveProperty("createdBy", "Player 1");
});

/**
 *
 * @param {string} playerId
 * @returns {Promise<string>} the id of the created game
 */
const createGame = async (playerId) => {
	const response = await router.route(Rest.createGame(playerId, undefined, undefined));
	const responseBody = response.response;
	if (responseBody == null) throw new Error("No response body received");
	return JSON.parse(responseBody).gameId;
};

test("join game route", async () => {
	const gameId = await createGame("Player 1");
	const response = await router.route(Rest.joinGame("Player 2", { gameId }, undefined));
	expect(response.status).toBe(Successful.OK);
});

/**
 *
 * @param {string} gameId
 * @param {string} playerId
 */
const joinGame = (gameId, playerId) => router.route(Rest.joinGame(playerId, { gameId }, undefined));

test("start game route", async () => {
	const gameId = await createGame("Player 1");
	await joinGame(gameId, "Player 2");
	await joinGame(gameId, "Player 3");
	await joinGame(gameId, "Player 4");
	const response = await router.route(Rest.startGame("Player 3", { gameId }, undefined));
	expect(response.status).toBe(Successful.OK);
});

/**
 *
 * @param {string} gameId
 * @param {string} playerId
 */
const startGame = (gameId, playerId) => router.route(Rest.startGame(playerId, { gameId }, undefined));

test("start story route", async () => {
	const gameId = await createGame("Player 1");
	await joinGame(gameId, "Player 2");
	await joinGame(gameId, "Player 3");
	await joinGame(gameId, "Player 4");
	await startGame(gameId, "Player 3");
	const response = await router.route(Rest.startStory("Player 3", { gameId }, { content: "New story by player 3" }));
	expect(response.status).toBe(Successful.Created);
});

/**
 *
 * @param {string} gameId
 * @param {string} playerId
 * @param {string} storyContent
 */
const startStory = (gameId, playerId, storyContent) =>
	router.route(Rest.startStory(playerId, { gameId }, { content: storyContent }));

test("censor story route", async () => {
	const gameId = await createGame("Player 1");
	await joinGame(gameId, "Player 2");
	await joinGame(gameId, "Player 3");
	await joinGame(gameId, "Player 4");
	await startGame(gameId, "Player 3");
	await startStory(gameId, "Player 3", "New story by player 3");
	const response = await router.route(
		Rest.censorStory("Player 4", { gameId, storyIndex: 0 }, { wordIndices: [1, 3] })
	);
	expect(response.status).toBe(Successful.OK);
});

/**
 *
 * @param {string} gameId
 * @param {number} storyIndex
 * @param {string} playerId
 * @param {number[]} wordIndices
 */
const censorStory = (gameId, storyIndex, playerId, wordIndices) =>
	router.route(Rest.censorStory(playerId, { gameId, storyIndex }, { wordIndices }));

test("truncate story route", async () => {
	const gameId = await createGame("Player 1");
	await joinGame(gameId, "Player 2");
	await joinGame(gameId, "Player 3");
	await joinGame(gameId, "Player 4");
	await startGame(gameId, "Player 3");
	await startStory(gameId, "Player 3", "New story by player 3");
	const response = await router.route(
		Rest.truncateStory("Player 4", { gameId, storyIndex: 0 }, { truncationCount: 3 })
	);
	expect(response.status).toBe(Successful.OK);
});

/**
 *
 * @param {string} gameId
 * @param {number} storyIndex
 * @param {string} playerId
 * @param {number} truncationCount
 */
const truncateStory = (gameId, storyIndex, playerId, truncationCount) =>
	router.route(Rest.truncateStory(playerId, { gameId, storyIndex }, { truncationCount }));

test("repair censored story route", async () => {
	const gameId = await createGame("Player 1");
	await joinGame(gameId, "Player 2");
	await joinGame(gameId, "Player 3");
	await joinGame(gameId, "Player 4");
	await startGame(gameId, "Player 3");
	await startStory(gameId, "Player 3", "New story by player 3");
	await censorStory(gameId, 0, "Player 4", [1, 3]);
	const response = await router.route(
		Rest.repairCensoredStory("Player 1", { gameId, storyIndex: 0 }, { replacements: ["one", "two"] })
	);
	expect(response.status).toBe(Successful.OK);
});

test("repair truncated story route", async () => {
	const gameId = await createGame("Player 1");
	await joinGame(gameId, "Player 2");
	await joinGame(gameId, "Player 3");
	await joinGame(gameId, "Player 4");
	await startGame(gameId, "Player 3");
	await startStory(gameId, "Player 3", "New story by player 3");
	await truncateStory(gameId, 0, "Player 4", 3);

	const response = await router.route(
		Rest.repairTruncatedStory("Player 1", { gameId, storyIndex: 0 }, { replacement: "some new content" })
	);

	expect(response).toHaveProperty("status", Successful.OK);
});

/**
 *
 * @param {string} gameId
 * @param {number} storyIndex
 * @param {string} playerId
 * @param {string} replacement
 */
const repairTruncatedStory = (gameId, storyIndex, playerId, replacement) =>
	router.route(Rest.repairTruncatedStory(playerId, { gameId, storyIndex }, { replacement }));

test("contine story route", async () => {
	const gameId = await createGame("Player 1");
	await joinGame(gameId, "Player 2");
	await joinGame(gameId, "Player 3");
	await joinGame(gameId, "Player 4");
	await startGame(gameId, "Player 3");
	await startStory(gameId, "Player 3", "New story by player 3");
	await startStory(gameId, "Player 2", "New story by player 2");
	await truncateStory(gameId, 0, "Player 4", 3);
	await repairTruncatedStory(gameId, 0, "Player 1", "some new content");

	const response = await router.route(
		Rest.continueStory("Player 2", { gameId, storyIndex: 0 }, { content: "Next story entry." })
	);

	expect(response).toHaveProperty("status", Successful.Created);
});
