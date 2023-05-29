import { Controller, HttpRequest, HttpResponse, RouteRegister } from "../types";

export interface RestRoute<Params, Body> {
	createValidRequest(userId: string, params: Params, body: Body): HttpRequest;
	register<ResponseType extends HttpResponse>(
		routeRegistration: RouteRegister<ResponseType>,
		controller: Controller<ResponseType>
	): void;
}
