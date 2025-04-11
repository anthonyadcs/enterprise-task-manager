import { ConflictError, ForbiddenError, NotFoundError } from "@errors/apiError";
import { CompanyDepartment, Employee, EmployeeRole, TaskPriority } from "@prisma/client";
import { IEmployeeRepository } from "@repositories/employees/employeeRepositoryInterface";
import { employeeRepository } from "@repositories/employees/implementation/employeeRepository";
import { taskRepository } from "@repositories/tasks/implementation/taskRepository";
import { ITaskRepository } from "@repositories/tasks/taskRepositoryInterface";
import { ConditionsValidator } from "utils/validateConditions";

interface CreateTaskUseCaseRequest {
	title: string;
	description?: string;
	priority: TaskPriority;
	startDate: Date;
	endDate?: Date;
	assignedToId: string;

	requester: {
		id: string;
		companyId: string;
		role: EmployeeRole;
		department: CompanyDepartment;
	};
}

interface CreateTaskUseCaseResponse {
	success: boolean;
	data: {
		message: string;
	};
}

export class CreateTaskUseCase {
	constructor(
		private taskRepository: ITaskRepository,
		private employeeRepository: IEmployeeRepository,
	) {}

	async execute({
		title,
		description,
		priority,
		startDate,
		endDate,
		assignedToId,
		requester,
	}: CreateTaskUseCaseRequest): Promise<CreateTaskUseCaseResponse> {
		const employeeAssignedTo = (await this.employeeRepository.getById(assignedToId)) as Employee;
		let defaultEndDate: Date;

		if (!endDate) {
			switch (priority) {
				case "CRITICAL":
					defaultEndDate = new Date(startDate.getTime() + 14400000);
					break;
				case "HIGH":
					defaultEndDate = new Date(startDate.getTime() + 86400000);
					break;
				case "MEDIUM":
					defaultEndDate = new Date(startDate.getTime() + 259200000);
					break;
				case "LOW":
					defaultEndDate = new Date(startDate.getTime() + 432000000);
					break;
				default:
					break;
			}
		}

		if (requester.role !== "MASTER") {
			new ConditionsValidator([
				{
					condition: !employeeAssignedTo,
					toThrow: new NotFoundError(
						"Dados não encontrados: o colaborador que está designado a esta tarefa não foi encontrado com os critérios fornecidos.",
					),
				},
				{
					condition: requester.companyId !== employeeAssignedTo.companyId,
					toThrow: new ForbiddenError(
						"Ação não permitida: tarefas só podem ser atribuídas entre colaboradores da mesma empresa.",
					),
				},
				{
					condition: !["ADMIN", "MANAGER"].includes(requester.role),
					toThrow: new ForbiddenError(
						"Ação não permitida: apenas colaboradores com perfis ADMIN ou MANAGER podem criar novas tarefas.",
					),
				},
				{
					condition: ["MASTER", "ADMIN"].includes(employeeAssignedTo.role),
					toThrow: new ForbiddenError(
						"Ação não permitida: colaboradores com perfis MASTER ou ADMIN não podem ter tarefas atribuídas a sí.",
					),
				},
				{
					condition:
						requester.role === "MANAGER" && requester.department !== employeeAssignedTo.department,
					toThrow: new ForbiddenError(
						"Ação não permitida: gerentes só podem atribuir tarefas à colaboradores do mesmo departamento.",
					),
				},
				{
					condition:
						(await this.taskRepository.getTasksInTimeRange({
							startRange: startDate,
							endRange: endDate ?? defaultEndDate,
							employeeId: assignedToId,
						})) >= 5,
					toThrow: new ConflictError(
						"Dados em conflito: já existem ao menos 5 tarefas atribuídas a este colaborador no mesmo período.",
					),
				},
			]).validate();
		}

		await this.taskRepository.create({
			title,
			description,
			priority,
			startDate,
			endDate: endDate ?? defaultEndDate,
			department: employeeAssignedTo.department,
			assignedToId,
			assignedById: requester.id,
			companyId: requester.companyId,
		});

		return {
			success: true,
			data: {
				message: "string",
			},
		};
	}
}

export const createTaskUseCase = new CreateTaskUseCase(taskRepository, employeeRepository);
