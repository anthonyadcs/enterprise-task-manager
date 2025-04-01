import { ConflictError, ForbiddenError, UnprocessableEntityError } from "@errors/apiError";
import { CompanyDepartment, EmployeeRole } from "@prisma/client";
import { IEmployeeRepository } from "@repositories/employees/employeeRepositoryInterface";
import { employeeRepository } from "@repositories/employees/implementation/employeeRepository";
import bcrypt from "bcrypt";

interface CreateEmployeeUseCaseRequest {
	name: string;
	email: string;
	passwords: {
		password: string;
		confirmPassword: string;
	};

	requester: {
		requesterRole: string;
		requesterCompanyId: string;
	};

	company: {
		employeeCompanyId: string;
		employeeRole: EmployeeRole;
		employeeDepartment: CompanyDepartment;
	};
}

interface CreateEmployeeUseCaseResponse {
	success: boolean;
	data: {
		message: string;
	};
}

export class CreateEmployeeUseCase {
	constructor(private employeeRepository: IEmployeeRepository) {}

	async execute({
		name,
		email,
		requester: { requesterRole, requesterCompanyId },
		passwords: { password, confirmPassword },
		company: { employeeCompanyId, employeeRole, employeeDepartment },
	}: CreateEmployeeUseCaseRequest): Promise<CreateEmployeeUseCaseResponse> {
		const errorConditions = [
			{
				condition: await this.employeeRepository.getByEmail(email),
				errorToThrow: new ConflictError("Dados em conflito: já existe um usuário com este e-mail."),
			},
			{
				condition: requesterCompanyId !== employeeCompanyId || requesterRole !== "ADMIN",
				errorToThrow: new ForbiddenError(
					"Ação não permitida: usuário solicitante não possui as permissões necessárias para realizar esta operação.",
				),
			},
			{
				condition: await this.employeeRepository.getByEmail(email),
				errorToThrow: new ConflictError("Dados em conflito: já existe um usuário com este e-mail."),
			},
			{
				condition: password !== confirmPassword,
				errorToThrow: new UnprocessableEntityError(
					"Dados inválidos: as senhas fornecidas não conferem.",
				),
			},
		];

		for (const error of errorConditions) {
			if (error.condition) {
				throw error.errorToThrow;
			}
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		await this.employeeRepository.create({
			name,
			email,
			password: hashedPassword,
			company: {
				id: employeeCompanyId,
				department: employeeDepartment,
				role: employeeRole,
			},
		});

		return {
			success: true,
			data: {
				message: "Sucesso! Colaborador criado.",
			},
		};
	}
}

export const createEmployeeUseCase = new CreateEmployeeUseCase(employeeRepository);
