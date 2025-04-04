import {
	DeleteEmployeeUseCase,
	deleteEmployeeUseCase,
} from "@useCases/employees/deleteEmployeeUseCase";
import { Request, Response } from "express";
import { validateParams } from "utils/validateParams";
import { z } from "zod";

const deleteEmployeeControllerSchema = z.object({
	id: z.string().uuid(),
	requester: z.object({
		companyId: z.string().uuid(),
		id: z.string().uuid(),
		role: z.enum(["MASTER", "ADMIN", "MANAGER", "STAFF"]),
		department: z.enum(["MARKETING", "IT", "HR", "LEGAL", "CONTABILITY"]),
	}),
});

type DeleteEmployeeRequest = z.infer<typeof deleteEmployeeControllerSchema>;

export class DeleteEmployeeController {
	constructor(private deleteEmployeeUseCase: DeleteEmployeeUseCase) {}

	async handle(request: Request, response: Response): Promise<Response> {
		const { id: requesterId, companyId, role, department } = request.employee;
		const { id } = request.params;

		const params: DeleteEmployeeRequest = {
			id,
			requester: {
				companyId,
				id: requesterId,
				role,
				department,
			},
		};

		await validateParams.check(deleteEmployeeControllerSchema, params);

		const requestResult = await this.deleteEmployeeUseCase.execute(params);

		return response.json(requestResult);
	}
}

export const deleteEmployeeController = new DeleteEmployeeController(deleteEmployeeUseCase);
