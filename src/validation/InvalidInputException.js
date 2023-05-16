class InvalidInputException extends Error {
	constructor(message = "Invalid input") {
		super(message);
	}
}
exports.InvalidInputException = InvalidInputException;
