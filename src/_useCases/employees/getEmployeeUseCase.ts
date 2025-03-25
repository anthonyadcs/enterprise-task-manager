import { ForbiddenError, NotFoundError } from "@errors/apiError";
import { Employee } from "@prisma/client";
import { IEmployeeRepository } from "@repositories/employees/employeeRepositoryInterface";
import { employeeRepository } from "@repositories/employees/implementation/employeeRepository";

interface GetEmployeeUseCaseRequest {
	requester: {
		id: string;
		companyId: string;
		department: string;
		role: string;
	};
	employeeId: string;
}

interface GetEmployeeUseCaseResponse {
	success: boolean;
	data: {
		employee: Partial<Employee>;
	};
}

export class GetEmployeeUseCase {
	constructor(private employeeRepository: IEmployeeRepository) {}

	async execute({
		employeeId,
		requester,
	}: GetEmployeeUseCaseRequest): Promise<GetEmployeeUseCaseResponse> {
		const employee = await this.employeeRepository.getById(employeeId);

		if (!employee) {
			throw new NotFoundError(
				"Dados não encontrados: nenhum colaborador encontrado com os critérios fornecidos.",
			);
		}

		const isRequesterAllowed = [
			{
				condition: employee.id === requester.id,
			},
			{
				condition: requester.companyId === employee.companyId && requester.role === "ADMIN",
			},
			{
				condition:
					requester.companyId === employee.companyId &&
					requester.department === employee.department &&
					requester.role === "MANAGER",
			},
			{
				condition: requester.role === "MASTER",
			},
		];

		if (isRequesterAllowed.every(({ condition }) => condition === false)) {
			throw new ForbiddenError(
				"Ação não permitida: colaborador não possui as permissões necessárias para acessar esta rota",
			);
		}

		return {
			success: true,
			data: {
				employee: requester.role === "MANAGER" ? { ...employee, password: undefined } : employee,
			},
		};
	}
}

export const getEmployeeUseCase = new GetEmployeeUseCase(employeeRepository);
