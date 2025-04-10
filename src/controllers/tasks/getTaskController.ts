import { getTaskUseCase, GetTaskUseCase } from "@useCases/tasks/getTaskUseCase";
import { Request, Response } from "express";
import { validateParams } from "utils/validateParams";
import { z } from "zod";

const getTaskControllerSchema = z
	.object({
		id: z.string().uuid(),
		requester: z.object({
			id: z.string().uuid().optional(),
			companyId: z.string().uuid(),
			department: z.enum(["IT", "HR", "MARKETING", "CONTABILITY", "LEGAL"]).optional(),
			role: z.enum(["MASTER", "ADMIN", "MANAGER", "STAFF"]),
		}),
	})
	.refine(({ requester }) => {
		if (requester.role !== "ADMIN") {
			return requester.companyId && requester.department;
		}

		return true;
	});

type GetTaskRequest = z.infer<typeof getTaskControllerSchema>;

export class GetTaskController {
	constructor(private getTaskUseCase: GetTaskUseCase) {}

	async handle(request: Request, response: Response): Promise<Response> {
		const id = request.params.id;
		const { id: requesterId, companyId, department, role } = request.employee;

		const params: GetTaskRequest = {
			id,
			requester: {
				id: role !== "ADMIN" ? requesterId : undefined,
				companyId,
				department: role !== "ADMIN" ? department : undefined,
				role,
			},
		};

		await validateParams.check(getTaskControllerSchema, params);

		const requestResult = await this.getTaskUseCase.execute(params);

		return response.json(requestResult);
	}
}

export const getTaskController = new GetTaskController(getTaskUseCase);
