import { createTaskController } from "@controllers/tasks/createTaskController";
import { getTaskController } from "@controllers/tasks/getTaskController";
import { Request, Response, Router } from "express";
import { authenticationMiddleware } from "middlewares/authentication";

export const taskRoutes = Router();

const protectedRoutes = Router();

protectedRoutes.post("/tasks", async (request: Request, response: Response) => {
	await createTaskController.handle(request, response);
});

protectedRoutes.get("/tasks/:id", async (request: Request, response: Response) => {
	await getTaskController.handle(request, response);
});

taskRoutes.use(authenticationMiddleware, protectedRoutes);
