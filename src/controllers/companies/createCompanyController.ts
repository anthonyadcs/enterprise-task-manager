import {
	CreateCompanyUseCase,
	createCompanyUseCase,
} from "@useCases/companies/createCompanyUseCase";
import { Request, Response } from "express";
import { validateParams } from "utils/validateParams";
import { z } from "zod";

const createCompanyControllerSchema = z.object({
	requester: z.object({
		role: z.enum(["MASTER", "ADMIN", "MANAGER", "STAFF"]),
	}),
	cnpj: z.string().min(14),
	email: z.string().email(),
	name: z.string().min(3),
	departments: z
		.array(z.enum(["IT", "HR", "CONTABILITY", "MARKETING", "LEGAL"]))
		.default(["CONTABILITY", "HR", "IT", "LEGAL", "MARKETING"]),
});

type CreateCompanyRequest = z.infer<typeof createCompanyControllerSchema>;

export class CreateCompanyController {
	constructor(private createCompanyControllerUseCase: CreateCompanyUseCase) {}

	async handle(request: Request, response: Response): Promise<Response> {
		const { role } = request.employee;
		const { cnpj, email, name, departments } = request.body;

		const params: CreateCompanyRequest = await validateParams.parse(createCompanyControllerSchema, {
			requester: {
				role,
			},
			cnpj,
			email,
			name,
			departments,
		});

		const requestResult = await this.createCompanyControllerUseCase.execute(params);

		return response.json(requestResult);
	}
}

export const createCompanyController = new CreateCompanyController(createCompanyUseCase);
