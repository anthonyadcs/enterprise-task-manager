import {
	updateCompanyUseCase,
	UpdateCompanyUseCase,
} from "@useCases/companies/updateCompanyUseCase";
import { Request, Response } from "express";
import { validateParams } from "utils/validateParams";
import { z } from "zod";

const updateCompanyControllerSchema = z.object({
	id: z.string().uuid(),
	requester: z.object({
		companyId: z.string(),
		role: z.enum(["ADMIN", "MASTER", "MANAGER", "STAFF"]),
	}),
	toUpdate: z
		.object({
			name: z.string().min(3).optional(),
			email: z.string().email({ message: "e-mail fornecido inválido." }).optional(),
		})
		.refine((val) => Object.values(val).some((field) => field !== undefined), {
			message: "nenhum campo fornecido para atualização",
		}),
});

type UpdateCompanyRequest = z.infer<typeof updateCompanyControllerSchema>;

export class UpdateCompanyController {
	constructor(private updateCompanyUseCase: UpdateCompanyUseCase) {}

	async handle(request: Request, response: Response): Promise<Response> {
		const id = request.params.id;
		const { companyId, role } = request.employee;
		const { name, email } = request.body;

		console;

		const params: UpdateCompanyRequest = {
			id,
			requester: { companyId, role },
			toUpdate: {
				name,
				email,
			},
		};

		await validateParams.check(updateCompanyControllerSchema, params);

		const requestResult = await this.updateCompanyUseCase.execute(params);

		return response.json(requestResult);
	}
}

export const updateCompanyController = new UpdateCompanyController(updateCompanyUseCase);
