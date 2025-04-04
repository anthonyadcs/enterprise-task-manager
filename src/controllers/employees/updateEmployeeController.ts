import {
	updateEmployeePersonalDataUseCase,
	UpdateEmployeePersonalDataUseCase,
} from "@useCases/employees/updateEmployeePersonalDataUseCase";
import { Request, Response } from "express";
import { validateParams } from "utils/validateParams";
import { z } from "zod";

const updateEmployeeControllerSchema = z
	.object({
		id: z.string().uuid(),
		name: z.string().min(3, { message: "nome muito curto." }).optional(),
		email: z.string().email({ message: "e-mail com formatação inválida." }).optional(),
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
		({ email, name, passwords }) => [email, name, passwords].some((val) => val !== undefined),
		{ message: "nenhum campo fornecido para atualização" },
	);

type UpdateEmployeeRequest = z.infer<typeof updateEmployeeControllerSchema>;

export class UpdateEmployeeController {
	constructor(private UpdateEmployeePersonalDataUseCase: UpdateEmployeePersonalDataUseCase) {}

	async handle(request: Request, response: Response): Promise<Response> {
		const { role, companyId, department } = request.employee;

		const employeeId = request.params.id;

		const { name, email, passwords } = request.body;

		const params: UpdateEmployeeRequest = {
			id: employeeId,
			name,
			email,
			passwords,
			requester: {
				role,
				companyId,
				department,
			},
		};

		await validateParams.check(updateEmployeeControllerSchema, params);

		const requestResult = await this.UpdateEmployeePersonalDataUseCase.execute(params);

		return response.json(requestResult);
	}
}

export const updateEmployeeController = new UpdateEmployeeController(
	updateEmployeePersonalDataUseCase,
);
