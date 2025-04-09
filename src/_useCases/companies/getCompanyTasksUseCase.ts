import { ForbiddenError, NotFoundError } from "@errors/apiError";
import { CompanyDepartment, EmployeeRole, TaskPriority, TaskStatus } from "@prisma/client";
import { ICompanyRepository } from "@repositories/companies/companyRepositoryInterface";
import { companyRepository } from "@repositories/companies/implementation/companyRepository";
import { taskRepository } from "@repositories/tasks/implementation/taskRepository";
import { GetTasksResponse, ITaskRepository } from "@repositories/tasks/taskRepositoryInterface";
import { ConditionsValidator } from "utils/validateConditions";

interface GetCompanyTasksUseCaseRequest {
	companyId: string;
	requester: {
		id: string;
		companyId: string;
		role: EmployeeRole;
		department: CompanyDepartment;
	};
	queries: {
		order: {
			field: "priority" | "status" | "startDate" | "endDate" | "department";
			sort: "asc" | "desc";
		};
		page: {
			number: number;
			limit: number;
		};
		filters: {
			priority?: TaskPriority[];
			status?: TaskStatus[];
			department?: CompanyDepartment[];
			startDate?: Date;
			endDate?: Date;
		};
	};
}

interface GetCompanyTasksUseCaseResponse {
	success: boolean;
	data: GetTasksResponse;
}

export class GetCompanyTasksUseCase {
	constructor(
		private companyRepository: ICompanyRepository,
		private taskRepository: ITaskRepository,
	) {}

	async execute({
		companyId,
		queries: { filters, order, page },
		requester,
	}: GetCompanyTasksUseCaseRequest): Promise<GetCompanyTasksUseCaseResponse> {
		const company = await this.companyRepository.getById(companyId);

		if (requester.role !== "MASTER") {
			new ConditionsValidator([
				{
					condition: !company,
					toThrow: new NotFoundError(
						"Dados não encontrados: nenhuma empresa encontrada com os critérios fornecidos.",
					),
				},
				{
					condition: requester.companyId !== company?.id,
					toThrow: new ForbiddenError(
						"Ação não permitida: colaboradores só podem acessar dados referentes a sua empresa.",
					),
				},
				{
					condition: !["ADMIN", "MANAGER"].includes(requester.role),
					toThrow: new ForbiddenError(
						"Ação não permitida: apenas colaboradores com perfil ADMIN ou MANAGER podem acessar as tarefas solicitadas.",
					),
				},
				{
					condition:
						requester.role === "MANAGER" &&
						filters.department &&
						filters.department[0] !== requester.department,
					toThrow: new ForbiddenError(
						"Ação não permitida: gerentes só tem acesso às tarefas do próprio departamento.",
					),
				},
			]).validate();
		}

		const filterParams: any[] = [];

		if (Object.keys(filters).length > 0) {
			for (const [key, value] of Object.entries(filters)) {
				if (Array.isArray(value)) {
					const orConditions = value.map((v) => ({ [key]: v }));

					filterParams.push({ OR: orConditions });
				} else {
					filterParams.push({ [key]: value });
				}
			}
		}

		const { tasksPerPage, totalPages, totalTasks, tasks } =
			await this.taskRepository.getCompanyTasks({
				companyId,
				queries: {
					page: {
						skip: (page.number - 1) * page.limit,
						limit: page.limit,
					},
					order: {
						field:
							order.field === "priority" || order.field === "status" ? "department" : order.field,
						sort: order.sort,
					},
					filters: filterParams,
				},
			});

		return {
			success: true,
			data: {
				tasksPerPage,
				totalPages,
				totalTasks,
				tasks,
			},
		};
	}
}

export const getCompanyTasksUseCase = new GetCompanyTasksUseCase(companyRepository, taskRepository);
