import { ForbiddenError, NotFoundError, UnprocessableEntityError } from "@errors/apiError";
import { CompanyDepartment, EmployeeRole } from "@prisma/client";
import { IEmployeeRepository } from "@repositories/employees/employeeRepositoryInterface";
import { employeeRepository } from "@repositories/employees/implementation/employeeRepository";
import bcrypt from "bcrypt";
import { ConditionsValidator } from "utils/validateConditions";

interface UpdateEmployeeUseCaseRequest {
	id: string;
	name?: string;
	email?: string;
	department?: CompanyDepartment;
	role?: EmployeeRole;
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

interface UpdateEmployeeUseCaseResponse {
	success: boolean;
	data: {
		message: string;
	};
}

export class UpdateEmployeeUseCase {
	constructor(private employeeRepository: IEmployeeRepository) {}

	async execute({
		id,
		name,
		email,
		department,
		role,
		passwords,
		requester,
	}: UpdateEmployeeUseCaseRequest): Promise<UpdateEmployeeUseCaseResponse> {
		const employee = await this.employeeRepository.getById(id);

		if (requester.role !== "MASTER") {
			//Bloco de possíveis erros de verificação. As condições precisam ser verdadeiras para que o erro seja lançado
			new ConditionsValidator([
				{
					condition: !employee,
					toThrow: new NotFoundError(
						"Dados não encontrados: nenhum colaborador encontrado com os critérios fornecidos.",
					),
				},
				{
					condition: !["ADMIN", "MANAGER"].includes(requester.role),
					toThrow: new ForbiddenError(
						"Ação não permitida: apenas usuários com perfil ADMIN, MANAGER ou MASTER podem realizar esta operação.",
					),
				},
				{
					condition: employee?.companyId !== requester.companyId,
					toThrow: new ForbiddenError(
						"Ação não permitida: o colaborador pertence a outra empresa.",
					),
				},
				{
					condition: employee?.role === "ADMIN",
					toThrow: new ForbiddenError(
						"Ação não permitida: apenas usuário com permissões MASTER podem modificar contas com perfil ADMIN.",
					),
				},
				{
					condition: requester.role === "MANAGER" && requester.department !== employee?.department,
					toThrow: new ForbiddenError(
						"Ação não permitida: gerentes só podem modificar colaboradores do próprio departamento.",
					),
				},
				{
					condition:
						passwords &&
						!bcrypt.compareSync(passwords.actualPassword as string, employee?.password as string),
					toThrow: new UnprocessableEntityError(
						"Ação não permitida: a senha fornecida não corresponde à senha atual do usuário.",
					),
				},
				{
					condition: (department || role) && requester.role !== "ADMIN",
					toThrow: new ForbiddenError(
						"Ação não permitida: apenas usuários com perfil ADMIN podem alterar o cargo ou departamento de um colaborador.",
					),
				},
			]);
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

export const updateEmployeeUseCase = new UpdateEmployeeUseCase(employeeRepository);
