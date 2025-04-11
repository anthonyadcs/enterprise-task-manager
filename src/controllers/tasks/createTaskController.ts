import { CreateTaskUseCase, createTaskUseCase } from "@useCases/tasks/createTaskUseCase";
import { Request, Response } from "express";
import { validateParams } from "utils/validateParams";
import { z } from "zod";

const createTaskControllerSchema = z.object({
	assignedToId: z.string().uuid(),
	title: z.string().min(3, { message: "título de tarefa muito curto" }),
	description: z.string().min(10, { message: "descrição de tarefa muito curta" }).optional(),
	priority: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]),
	startDate: z
		.string()
		.refine((sd) => !Number.isNaN(Date.parse(sd)), {
			message: "formato de data de início da tarefa inválido",
		})
		.transform((val) => {
			const splittedHour = val.split("-").map((h) => Number(h));
			return new Date(splittedHour[0], splittedHour[1] - 1, splittedHour[2]);
		}),
	endDate: z
		.string()
		.refine((ed) => !Number.isNaN(Date.parse(ed)), {
			message: "formato de data de entrega da tarefa inválido",
		})
		.transform((val) => {
			const splittedHour = val.split("-");

			return new Date(
				Number(splittedHour[0]),
				Number(splittedHour[1]) - 1,
				Number(splittedHour[2]),
			);
		})
		.optional(),

	requester: z.object({
		id: z.string().uuid(),
		companyId: z.string().uuid(),
		role: z.enum(["MASTER", "ADMIN", "MANAGER", "STAFF"]),
		department: z.enum(["MARKETING", "IT", "HR", "LEGAL", "CONTABILITY"]),
	}),
});

type CreateTaskRequest = z.infer<typeof createTaskControllerSchema>;

export class CreateTaskController {
	constructor(private createTaskUseCase: CreateTaskUseCase) {}

	async handle(request: Request, response: Response): Promise<Response> {
		const { role, department, companyId, id } = request.employee;
		const { title, description, startDate, endDate, priority, assignedToId } = request.body;

		const params = {
			assignedToId,
			title,
			description,
			startDate,
			endDate,
			priority,
			requester: {
				id,
				companyId,
				department,
				role,
			},
		};

		const parsedParams: CreateTaskRequest = await validateParams.parse(
			createTaskControllerSchema,
			params,
		);

		const requestResult = await this.createTaskUseCase.execute(parsedParams);

		return response.json(requestResult);
	}
}

export const createTaskController = new CreateTaskController(createTaskUseCase);
