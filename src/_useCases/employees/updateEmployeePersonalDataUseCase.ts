import { ForbiddenError, NotFoundError, UnprocessableEntityError } from "@errors/apiError";
import { CompanyDepartment, EmployeeRole } from "@prisma/client";
import { IEmployeeRepository } from "@repositories/employees/employeeRepositoryInterface";
import { employeeRepository } from "@repositories/employees/implementation/employeeRepository";
import bcrypt from "bcrypt";

interface UpdateEmployeePersonalDataUseCaseRequest {
	id: string;
	name?: string;
	email?: string;
	passwords?: {
		actualPassword?: string;
		newPassword?: string;
	};
	requester: {
		companyId: string;
		role: EmployeeRole;
		department: CompanyDepartment;
	};
}

interface UpdateEmployeePersonalDataUseCaseResponse {
	success: boolean;
	data: {
		message: string;
	};
}

export class UpdateEmployeePersonalDataUseCase {
	constructor(private employeeRepository: IEmployeeRepository) {}

	async execute({
		id,
		name,
		email,
		passwords,
		requester,
	}: UpdateEmployeePersonalDataUseCaseRequest): Promise<UpdateEmployeePersonalDataUseCaseResponse> {
		const employee = await this.employeeRepository.getById(id);

		//Bloco de possíveis erros de verificação. As condições precisam ser verdadeiras para que o erro seja lançado
		const errorConditions = [
			{
				condition: !employee,
				errorToThrow: new NotFoundError(
					"Dados não encontrados: nenhum colaborador encontrado com os critérios fornecidos.",
				),
			},
			{
				condition: !["MASTER", "ADMIN", "MANAGER"].includes(requester.role),
				errorToThrow: new ForbiddenError(
					"Ação não permitida: apenas usuários com perfil ADMIN, MANAGER ou MASTER podem realizar esta operação.",
				),
			},
			{
				condition: employee?.companyId !== requester.companyId,
				errorToThrow: new ForbiddenError(
					"Ação não permitida: o colaborador pertence a outra empresa.",
				),
			},
			{
				condition: employee?.role === "ADMIN" && requester.role !== "MASTER",
				errorToThrow: new ForbiddenError(
					"Ação não permitida: apenas usuário com permissões MASTER podem modificar contas com perfil ADMIN.",
				),
			},
			{
				condition: requester.role === "MANAGER" && requester.department !== employee?.department,
				errorToThrow: new ForbiddenError(
					"Ação não permitida: gerentes só podem modificar colaboradores do próprio departamento.",
				),
			},
			{
				condition:
					passwords &&
					!bcrypt.compareSync(passwords.actualPassword as string, employee?.password as string),
				errorToThrow: new UnprocessableEntityError(
					"Ação não permitida: a senha fornecida não corresponde à senha atual do usuário.",
				),
			},
		];

		for (const error of errorConditions) {
			if (error.condition) {
				throw error.errorToThrow;
			}
		}
		await this.employeeRepository.update({
			id,
			email,
			name,
			password: passwords && bcrypt.hashSync(passwords.newPassword as string, 10),
		});

		return {
			success: true,
			data: {
				message: "Sucesso! Colaborador atualizado.",
			},
		};
	}
}

export const updateEmployeePersonalDataUseCase = new UpdateEmployeePersonalDataUseCase(
	employeeRepository,
);
