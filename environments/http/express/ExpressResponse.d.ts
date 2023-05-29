import { Response } from "express";
import { HttpResponse } from "../types";

export interface ExpressResponse extends HttpResponse {
	respondWith(res: Response): void;
}
