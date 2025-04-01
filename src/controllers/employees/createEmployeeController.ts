import { CompanyDepartment, EmployeeRole } from "@prisma/client";
import {
	CreateEmployeeUseCase,
	createEmployeeUseCase,
} from "@useCases/employees/createEmployeeUseCase";
import { Request, Response } from "express";
import { validateParams } from "utils/validateParams";
import { z } from "zod";

const createEmployeeControllerSchema = z.object({
	name: z.string().min(3, { message: "nome muito curto" }),
	email: z.string().email({ message: "e-mail mal formatado" }),
	passwords: z.object({
		password: z.string().min(3, { message: "senha curta demais" }),
		confirmPassword: z.string(),
	}),
	requester: z.object({
		requesterCompanyId: z.string().uuid(),
		requesterRole: z.enum(["MASTER", "ADMIN", "MANAGER", "STAFF"]),
	}),
	company: z.object({
		employeeCompanyId: z.string().uuid(),
		employeeRole: z.enum(["MASTER", "ADMIN", "MANAGER", "STAFF"], {
			message:
				"cargo inválido. Os possíves cargos existentes são: Administrador, Gerente ou Colaborador",
		}),
		employeeDepartment: z.enum(["IT", "HR", "CONTABILITY", "MARKETING", "LEGAL"], {
			message:
				"departamento inválido. Os possíveis departamentos são: Marketing, TI, RH, Contabilidade e Jurídico",
		}),
	}),
});

type CreateEmployeeRequest = z.infer<typeof createEmployeeControllerSchema>;

export class CreateEmployeeController {
	constructor(private createEmployeeUseCase: CreateEmployeeUseCase) {}

	async handle(request: Request, response: Response): Promise<Response> {
		const { role, companyId } = request.employee;
		const { name, email, passwords, company } = request.body;

		const params: CreateEmployeeRequest = {
			name,
			email,
			passwords,
			company,
			requester: { requesterCompanyId: companyId, requesterRole: role },
		};

		await validateParams.check(createEmployeeControllerSchema, params);

		const requestResult = await this.createEmployeeUseCase.execute({
			...params,
			company: {
				employeeRole: params.company.employeeRole as EmployeeRole,
				employeeCompanyId: params.company.employeeCompanyId as CompanyDepartment,
				employeeDepartment: params.company.employeeDepartment as CompanyDepartment,
			},
			requester: {
				requesterCompanyId: params.requester.requesterCompanyId,
				requesterRole: params.requester.requesterRole as EmployeeRole,
			},
		});

		return response.json(requestResult);
	}
}

export const createEmployeeController = new CreateEmployeeController(createEmployeeUseCase);
