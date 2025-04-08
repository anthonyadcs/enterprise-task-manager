import { ForbiddenError, NotFoundError } from "@errors/apiError";
import { CompanyDepartment, EmployeeRole, Task, TaskPriority, TaskStatus } from "@prisma/client";
import { IEmployeeRepository } from "@repositories/employees/employeeRepositoryInterface";
import { employeeRepository } from "@repositories/employees/implementation/employeeRepository";
import { taskRepository } from "@repositories/tasks/implementation/taskRepository";
import { ITaskRepository } from "@repositories/tasks/taskRepositoryInterface";
import { ConditionsValidator } from "utils/validateConditions";

interface GetEmployeeTasksUseCaseRequest {
	employeeId: string;
	requester: {
		id: string;
		companyId: string;
		department: CompanyDepartment;
		role: EmployeeRole;
	};
	queries: {
		order: {
			field: "priority" | "status" | "startDate" | "endDate";
			sort: "asc" | "desc";
		};
		page: {
			number: number;
			limit: number;
		};
		filters: {
			priority?: TaskPriority[];
			status?: TaskStatus[];
			startDate?: Date;
			endDate?: Date;
		};
	};
}

interface GetEmployeeTasksUseCaseResponse {
	success: boolean;
	data: {
		tasks: Task[];
		totalTasks: number;
		totalPages: number;
		tasksPerPage: number;
	};
}

export class GetEmployeeTasksUseCase {
	constructor(
		private taskRepository: ITaskRepository,
		private employeeRepository: IEmployeeRepository,
	) {}

	async execute({
		employeeId,
		requester,
		queries: { order, page, filters },
	}: GetEmployeeTasksUseCaseRequest): Promise<GetEmployeeTasksUseCaseResponse> {
		const employee = await this.employeeRepository.getById(employeeId);

		if (requester.role !== "MASTER") {
			new ConditionsValidator([
				{
					condition: !employee,
					toThrow: new NotFoundError(
						"Dados não encontrados: nenhum colaborador encontrado com os critérios fornecidos.",
					),
				},
				{
					condition:
						!["MASTER", "ADMIN", "MANAGER"].includes(requester.role) ||
						requester.id !== employee?.id,
					toThrow: new ForbiddenError(
						"Ação não permitida: apenas usuários com perfil ADMIN e MANAGER ou o próprio colaborador responsável pela tarefa têm permissão para acessá-la.",
					),
				},
				{
					condition: employee?.companyId !== requester.companyId,
					toThrow: new ForbiddenError(
						"Ação não permitida: colaboradores só podem acessar dados referentes a sua empresa.",
					),
				},
				{
					condition: requester.role === "MANAGER" && requester.department !== employee?.department,
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
					const orConditions = value.map((val) => ({ [key]: val }));

					filterParams.push({ OR: orConditions });
				} else {
					filterParams.push({ [key]: value });
				}
			}
		}

		const { tasks, tasksPerPage, totalPages, totalTasks } =
			await this.taskRepository.getByEmployeeId({
				employeeId,
				queries: {
					page: {
						...page,
						skip: (page.number - 1) * page.limit,
					},
					order: {
						...order,
						field: order.field === "priority" || order.field === "status" ? "endDate" : order.field,
					},
					filters: filterParams,
				},
			});

		if (!tasks || tasks.length === 0) {
			throw new NotFoundError(
				"Dados não encontrados: nenhuma tarefa encontrada com os critérios fornecidos.",
			);
		}

		if (order.field === "priority") {
			const priorityOrder: Record<TaskPriority, number> = {
				CRITICAL: order.sort === "desc" ? 4 : 1,
				HIGH: order.sort === "desc" ? 3 : 2,
				MEDIUM: order.sort === "desc" ? 2 : 3,
				LOW: order.sort === "desc" ? 1 : 4,
			};

			tasks.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
		}

		if (order.field === "status") {
			const priorityOrder: Record<TaskStatus, number> = {
				PENDING: order.sort === "desc" ? 5 : 1,
				DONE: order.sort === "desc" ? 4 : 2,
				PARTIAL_DONE: order.sort === "desc" ? 3 : 3,
				PARTIAL_CANCELLED: order.sort === "desc" ? 2 : 4,
				CANCELLED: order.sort === "desc" ? 1 : 5,
			};

			tasks.sort((a, b) => priorityOrder[b.status] - priorityOrder[a.status]);
		}

		return {
			success: true,
			data: {
				totalTasks,
				tasksPerPage,
				totalPages,
				tasks,
			},
		};
	}
}

export const getEmployeeTasksUseCase = new GetEmployeeTasksUseCase(
	taskRepository,
	employeeRepository,
);
