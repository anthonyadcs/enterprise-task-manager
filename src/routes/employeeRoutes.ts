import { loginEmployeeController } from "controllers/employees/loginEmployeeController";
import { Request, Response, Router } from "express";

export const employeeRoutes = Router();

const publicRoutes = Router();

publicRoutes.post("/auth/login", async (request: Request, response: Response) => {
	await loginEmployeeController.handle(request, response);
});

employeeRoutes.use(publicRoutes);
