import { HttpResponse, ResponseTypes } from "../types";

export interface RequestAuthorizer<T extends HttpResponse> {
	responseTypes(): ResponseTypes<T>;
}

export interface RequestValidator<T extends HttpResponse> {
	invalid(badRequest: string): void;

	badRequest(): T | null;
}
