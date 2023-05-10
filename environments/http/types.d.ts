export interface HttpResponse {}

export interface ResponseTypes<T extends HttpResponse> {
    sendFile(absolutePath: string, contentType?: string): T;
}

export interface HttpRequest {
    ipAddress: string;
}

export interface RouteRegister<T extends HttpResponse> {
    get(relativePath: string, handler: (request: HttpRequest) => T): void;
}
