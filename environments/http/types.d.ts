export interface HttpResponse {}

export interface ResponseTypes<T> {
	sendFile(absolutePath: string, contentType?: string): T;
	sendStatus(status: number, customMessage?: string): T;
	sendStatusWithBody(params: { status: number; customMessage?: string; body: string; contentType?: string }): T;
	redirect(relativePath: string): T;
	sendObject(obj: object): T;
	send(content: string, contentType?: string): T;
}

export interface HttpRequest {
	method: string;
	path: string;
	ipAddress?: string;
	session?: any;
	params: any;
	query?: any;
	body?: any;
}

/**
 * A path that allows for dynamic parameters defined.
 *
 * To define a dynamic parameter, surround a part of a URL with {}.
 *
 * Example: `"/api/v3/container/{containerId}/group/{groupId}/item/{itemId}"`
 */
type SwaggerPath = string;

export interface RouteRegister<T> {
	/**
	 *
	 * @param relativePath - Use {} to define dynamic parameters in a path, like: `"/api/v3/container/{containerId}/group`
	 * @param handler
	 */
	get(relativePath: SwaggerPath, handler: (request: HttpRequest) => Promise<T>): void;
	/**
	 *
	 * @param relativePath - Use {} to define dynamic parameters in a path, like: `"/api/v3/container/{containerId}/group`
	 * @param handler
	 */
	post(relativePath: SwaggerPath, handler: (request: HttpRequest) => Promise<T>): void;
	/**
	 *
	 * @param relativePath - Use {} to define dynamic parameters in a path, like: `"/api/v3/container/{containerId}/group`
	 * @param handler
	 */
	patch(relativePath: SwaggerPath, handler: (request: HttpRequest) => Promise<T>): void;
}

export interface Controller<T extends HttpResponse> {
	handle(request: HttpRequest): Promise<T>;
}
