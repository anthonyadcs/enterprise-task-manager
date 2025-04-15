import { updateTaskUseCase, UpdateTaskUseCase } from "@useCases/tasks/updateTaskUseCase";
import { Request, Response } from "express";
import { validateParams } from "utils/validateParams";
import { z } from "zod";

const updateTaskControllerSchema = z
	.object({
		id: z.string().uuid(),
		assignedToId: z.string().uuid({ message: "código de identificação inválido" }).optional(),
		title: z.string().min(3, { message: "título de tarefa muito curto" }).optional(),
		description: z.string().min(10, { message: "descrição de tarefa muito curta" }).optional(),
		priority: z
			.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"], { message: "estado de prioridade inválido" })
			.optional(),
		startDate: z
			.string()
			.refine((sd) => !Number.isNaN(Date.parse(sd)), {
				message: "formato de data de início da tarefa inválido",
			})
			.transform((sd) => {
				const splittedHour = sd.split("-").map((sh) => Number(sh));
				return new Date(splittedHour[0], splittedHour[1] - 1, splittedHour[2]);
			})
			.optional(),
		endDate: z
			.string()
			.refine((ed) => !Number.isNaN(Date.parse(ed)), {
				message: "formato de data de entrega da tarefa inválido",
			})
			.transform((ed) => {
				const splittedHour = ed.split("-").map((sh) => Number(sh));

				return new Date(splittedHour[0], splittedHour[1] - 1, splittedHour[2]);
			})
			.optional(),

		requester: z.object({
			id: z.string().uuid(),
			companyId: z.string().uuid(),
			role: z.enum(["MASTER", "ADMIN", "MANAGER", "STAFF"]),
			department: z.enum(["MARKETING", "IT", "HR", "LEGAL", "CONTABILITY"]),
		}),
	})
	.refine(
		(val) => {
			return Object.entries(val).some(
				([field, value]) => field !== "id" && field !== "requester" && value !== undefined,
			);
		},
		{ message: "nenhum campo fornecido para atualização" },
	);

type UpdateTaskRequest = z.infer<typeof updateTaskControllerSchema>;

export class UpdateTaskController {
	constructor(private updateTaskUseCase: UpdateTaskUseCase) {}

	async handle(request: Request, response: Response): Promise<Response> {
		const { id: requesterId, department, role, companyId } = request.employee;

		const { title, description, priority, startDate, endDate } = request.body;

		const id = request.params.id;

		const parsedParams: UpdateTaskRequest = await validateParams.parse(updateTaskControllerSchema, {
			id,
			title,
			description,
			priority,
			startDate,
			endDate,
			requester: {
				id: requesterId,
				department,
				role,
				companyId,
			},
		});

		const requestResult = await this.updateTaskUseCase.execute(parsedParams);

		return response.json(requestResult);
	}
}

export const updateTaskController = new UpdateTaskController(updateTaskUseCase);
