import { createEmployeeController } from "@controllers/employees/createEmployeeController";
import { deleteEmployeeController } from "@controllers/employees/deleteEmployeeController";
import { getEmployeeController } from "@controllers/employees/getEmployeeController";
import { updateEmployeeController } from "@controllers/employees/updateEmployeeController";
import { loginEmployeeController } from "controllers/employees/loginEmployeeController";
import { Request, Response, Router } from "express";
import { authenticationMiddleware } from "middlewares/authentication";

export const employeeRoutes = Router();

const publicRoutes = Router();

publicRoutes.post("/auth/login", async (request: Request, response: Response) => {
	await loginEmployeeController.handle(request, response);
});

const protectedRoutes = Router();

protectedRoutes.post("/employees", async (request: Request, response: Response) => {
	await createEmployeeController.handle(request, response);
});

protectedRoutes.patch("/employees/:id", async (request: Request, response: Response) => {
	await updateEmployeeController.handle(request, response);
});

protectedRoutes.delete("/employees/:id", async (request: Request, response: Response) => {
	await deleteEmployeeController.handle(request, response);
});

protectedRoutes.get("/auth/me/:id", async (request: Request, response: Response) => {
	await getEmployeeController.handle(request, response);
});

employeeRoutes.use(publicRoutes);
employeeRoutes.use(authenticationMiddleware, protectedRoutes);
