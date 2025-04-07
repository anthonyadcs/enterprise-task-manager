import { ForbiddenError, NotFoundError } from "@errors/apiError";
import { CompanyDepartment, Employee, EmployeeRole } from "@prisma/client";
import { IEmployeeRepository } from "@repositories/employees/employeeRepositoryInterface";
import { employeeRepository } from "@repositories/employees/implementation/employeeRepository";
import { ConditionsValidator } from "utils/validateConditions";

interface GetCompanyEmployeesUseCaseRequest {
	companyId: string;
	requester: {
		companyId: string;
		role: EmployeeRole;
	};
	queries: {
		order: {
			field: "role" | "createdAt" | "task";
			sort: "asc" | "desc";
		};
		page: {
			number: number;
			limit: number;
		};
		filters: {
			department?: CompanyDepartment | CompanyDepartment[];
			role?: EmployeeRole | EmployeeRole[];
		};
	};
}

interface GetCompanyEmployeesUseCaseResponse {
	success: boolean;
	data: {
		employees: Partial<Employee>[];
		employeesInThisPage?: number;
		totalEmployees?: number;
		totalPages?: number;
	};
}

export class GetCompanyEmployeesUseCase {
	constructor(private employeeRepository: IEmployeeRepository) {}

	async execute({
		companyId,
		requester,
		queries,
	}: GetCompanyEmployeesUseCaseRequest): Promise<GetCompanyEmployeesUseCaseResponse> {
		if (requester.role !== "MASTER") {
			new ConditionsValidator([
				{
					condition: !["ADMIN", "MANAGER"].includes(requester.role),
					toThrow: new ForbiddenError(
						"Ação não permitida: apenas perfis ADMIN ou MANAGER podem acessar estas informações.",
					),
				},
				{
					condition: requester.companyId !== companyId,
					toThrow: new ForbiddenError(
						"Ação não permitida: colaboradores só podem acessar dados referentes a sua empresa.",
					),
				},
			]).validate();
		}

		//Variável que armazena os filtros já formatados p/ o Prisma
		const filterParams: Record<string, any>[] = [];

		//Loop para pushar os filtros formatados p/ a variável filterParams.
		if (Object.keys(queries.filters).length > 0) {
			for (const [key, value] of Object.entries(queries.filters)) {
				if (Array.isArray(value)) {
					const orConditions = value.map((val) => ({ [key]: val }));

					filterParams.push({ OR: orConditions });
				} else {
					filterParams.push({ [key]: value });
				}
			}
		}

		console.log(queries);

		const { employees, employeesInThisPage, totalEmployees, totalPages } =
			await this.employeeRepository.getEmployees({
				companyId,
				queries: {
					page: {
						skip: (queries.page.number - 1) * queries.page.limit,
						limit: queries.page.limit,
					},
					order: {
						...queries.order,
						field:
							queries.order.field === "task" || queries.order.field === "role"
								? "createdAt"
								: queries.order.field,
					},
					filters: filterParams.length === 0 ? undefined : filterParams,
				},
			});

		if (!employees || employees?.length === 0) {
			throw new NotFoundError(
				"Dados não encontrados: nenhum colaborador encontrado com os critérios fornecidos.",
			);
		}

		if (queries.order.field === "role") {
			const roleOrder: Record<EmployeeRole, number> = {
				MASTER: queries.order.sort === "asc" ? 1 : 4,
				ADMIN: queries.order.sort === "asc" ? 2 : 3,
				MANAGER: queries.order.sort === "asc" ? 3 : 2,
				STAFF: queries.order.sort === "asc" ? 4 : 1,
			};

			employees.sort((a, b) => roleOrder[b.role] - roleOrder[a.role]);
		}

		const formattedEmployes: Omit<Employee, "password">[] = employees?.map(
			({ password, ...rest }) => rest,
		);

		return {
			success: true,
			data: {
				totalEmployees,
				employeesInThisPage,
				totalPages,
				employees: requester.role === "MANAGER" ? formattedEmployes : employees,
			},
		};
	}
}

export const getCompanyEmployeesUseCase = new GetCompanyEmployeesUseCase(employeeRepository);
