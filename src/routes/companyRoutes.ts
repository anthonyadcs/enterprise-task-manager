import { Request, Response } from "express";
import { createCompanyController } from "@controllers/companies/createCompanyController";
import { Router } from "express";
import { authenticationMiddleware } from "middlewares/authentication";

export const companyRoutes = Router();

const protectedRoutes = Router();

protectedRoutes.post("/companies", async (request: Request, response: Response) => {
	await createCompanyController.handle(request, response);
});

companyRoutes.use(authenticationMiddleware, protectedRoutes);
