import { ForbiddenError, NotFoundError } from "@errors/apiError";
import { CompanyDepartment, EmployeeRole } from "@prisma/client";
import { IEmployeeRepository } from "@repositories/employees/employeeRepositoryInterface";
import { employeeRepository } from "@repositories/employees/implementation/employeeRepository";
import { ConditionsValidator } from "utils/validateConditions";

interface DeleteEmployeeUseCaseRequest {
	id: string;
	requester: {
		id: string;
		companyId: string;
		role: EmployeeRole;
		department: CompanyDepartment;
	};
}

interface DeleteEmployeeUseCaseResponse {
	success: boolean;
	data: {
		message: string;
	};
}

export class DeleteEmployeeUseCase {
	constructor(private employeeRepository: IEmployeeRepository) {}

	async execute({
		id,
		requester,
	}: DeleteEmployeeUseCaseRequest): Promise<DeleteEmployeeUseCaseResponse> {
		const employee = await this.employeeRepository.getById(id);

		if (requester.role !== "MASTER") {
			new ConditionsValidator([
				{
					condition: !employee,
					toThrow: new NotFoundError(
						"Dados não encontrados: nenhum usuário encontrado com os critérios fornecidos.",
					),
				},
				{
					condition: employee?.id === requester.id,
					toThrow: new ForbiddenError("Dados não encontrados: o usuário não pode se auto-excluir."),
				},
				{
					condition: requester.role !== "ADMIN",
					toThrow: new ForbiddenError(
						"Ação não permitida: apenas usuários com permissões MASTER ou ADMIN podem excluir colaboradores.",
					),
				},
				{
					condition: requester.companyId !== employee?.companyId,
					toThrow: new ForbiddenError(
						"Ação não permitida: o colaborador pertence a outra empresa.",
					),
				},
				{
					condition: employee && ["MASTER", "ADMIN"].includes(employee?.role),
					toThrow: new ForbiddenError(
						"Ação não permitida: não é possível excluir usuário com perfil MASTER ou ADMIN.",
					),
				},
			]).validate();
		}

		await this.employeeRepository.delete(id);

		return {
			success: true,
			data: {
				message: "Sucesso! Colaborador excluído.",
			},
		};
	}
}

export const deleteEmployeeUseCase = new DeleteEmployeeUseCase(employeeRepository);
