import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import { APIError } from "../handlers/apiError";






export function errorMiddleware(error: Error & Partial<APIError>, request: Request, response: Response, next: NextFunction){
    const statusCode = error.statusCode ?? 500

    const message = error.message && error.message.trim() !== '' ? error.message : "Erro inesperado no servidor"

    response.status(statusCode).json({message})
}