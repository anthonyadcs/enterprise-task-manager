import {
	updateEmployeeUseCase,
	UpdateEmployeeUseCase,
} from "@useCases/employees/updateEmployeeUseCase";
import { Request, Response } from "express";
import { validateParams } from "utils/validateParams";
import { z } from "zod";

const updateEmployeeControllerSchema = z
	.object({
		id: z.string().uuid(),
		name: z.string().min(3, { message: "nome muito curto." }).optional(),
		email: z.string().email({ message: "e-mail com formatação inválida." }).optional(),
		role: z.enum(["MASTER", "ADMIN", "MANAGER", "STAFF"]).optional(),
		department: z.enum(["MARKETING", "IT", "HR", "CONTABILITY", "LEGAL"]).optional(),
		passwords: z
			.object({
				actualPassword: z.string().optional(),
				newPassword: z.string().min(3, { message: "senha muito curta." }).optional(),
			})
			.refine((val) => Object.values(val).length === 2, {
				message:
					"é necessário fornecer a senha atual e a nova senha para a atualização deste campo",
			})
			.optional(),
		requester: z.object({
			companyId: z.string(),
			role: z.enum(["MASTER", "ADMIN", "MANAGER", "STAFF"]),
			department: z.enum(["MARKETING", "IT", "HR", "CONTABILITY", "LEGAL"]),
		}),
	})
	.refine(
		({ email, name, passwords, department, role }) =>
			[email, name, passwords, department, role].some((val) => val !== undefined),
		{ message: "nenhum campo fornecido para atualização" },
	);

type UpdateEmployeeRequest = z.infer<typeof updateEmployeeControllerSchema>;

export class UpdateEmployeeController {
	constructor(private UpdateEmployeeUseCase: UpdateEmployeeUseCase) {}

	async handle(request: Request, response: Response): Promise<Response> {
		const { role: requesterRole, companyId, department: requesterDepartment } = request.employee;

		const employeeId = request.params.id;

		const { name, email, passwords, department, role } = request.body;

		const params: UpdateEmployeeRequest = {
			id: employeeId,
			name,
			email,
			department,
			role,
			passwords,
			requester: {
				role: requesterRole,
				companyId,
				department: requesterDepartment,
			},
		};

		await validateParams.check(updateEmployeeControllerSchema, params);

		const requestResult = await this.UpdateEmployeeUseCase.execute(params);

		return response.json(requestResult);
	}
}

export const updateEmployeeController = new UpdateEmployeeController(updateEmployeeUseCase);
