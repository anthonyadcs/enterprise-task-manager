import { UnauthorizedError } from "@errors/apiError";
import { employeeRepository } from "@repositories/employees/implementation/employeeRepository";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

type JwtPayload = { id: string };

export async function authenticationMiddleware(
	request: Request,
	response: Response,
	next: NextFunction,
) {
	const { authorization } = request.headers;

	if (!authorization) {
		throw new UnauthorizedError(
			"Acesso negado: o usuário não possui as permissões necessárias para acessar esta rota.",
		);
	}

	const token = authorization.split(" ")[1];

	const { id } = jwt.verify(token, process.env.JWT_SECRET ?? "") as JwtPayload;

	const employee = await employeeRepository.getById(id);

	if (!employee) {
		throw new UnauthorizedError(
			"Acesso negado: o usuário não possui as permissões necessárias para acessar esta rota.",
		);
	}

	const { password: _, ...formattedEmployee } = employee;

	request.employee = formattedEmployee;

	next();
}
