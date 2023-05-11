export interface HttpResponse {}

export interface ResponseTypes<T extends HttpResponse> {
    sendFile(absolutePath: string, contentType?: string): T;
    sendStatus(status: number, customMessage?: string): T;
    redirect(relativePath: string): T;
    send(content: string, contentType?: string): T;
}

export interface HttpRequest {
    ipAddress: string;
    session?: any;
    params: any;
}

export interface RouteRegister<T extends HttpResponse> {
    get(relativePath: string, handler: (request: HttpRequest) => Promise<T>): void;
    post(relativePath: string, handler: (request: HttpRequest) => Promise<T>): void;
}

export interface Controller<T extends HttpResponse> {
    handle(request: HttpRequest): Promise<T>;
}
