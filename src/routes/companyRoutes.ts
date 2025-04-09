import { Request, Response } from "express";
import { createCompanyController } from "@controllers/companies/createCompanyController";
import { Router } from "express";
import { authenticationMiddleware } from "middlewares/authentication";
import { updateCompanyController } from "@controllers/companies/updateCompanyController";
import { getCompanyEmployeesController } from "@controllers/employees/getCompanyEmployeesController";
import { getCompanyTasksController } from "@controllers/companies/getCompanyTasksController";

export const companyRoutes = Router();

const protectedRoutes = Router();

protectedRoutes.post("/companies", async (request: Request, response: Response) => {
	await createCompanyController.handle(request, response);
});

protectedRoutes.patch("/companies/:id", async (request: Request, response: Response) => {
	await updateCompanyController.handle(request, response);
});

protectedRoutes.get(
	"/companies/:id/employees/filters",
	async (request: Request, response: Response) => {
		await getCompanyEmployeesController.handle(request, response);
	},
);

protectedRoutes.get("/companies/:id/tasks", async (request: Request, response: Response) => {
	await getCompanyTasksController.handle(request, response);
});

companyRoutes.use(authenticationMiddleware, protectedRoutes);
