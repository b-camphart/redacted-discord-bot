import { Response } from "express";

export interface ExpressResponse extends HttpResponse {
    respondWith(res: Response): void;
}
