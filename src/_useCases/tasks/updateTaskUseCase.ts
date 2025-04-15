import { ConflictError, ForbiddenError, NotFoundError } from "@errors/apiError";
import { Employee, Task, TaskPriority, TaskStatus } from "@prisma/client";
import { IEmployeeRepository } from "@repositories/employees/employeeRepositoryInterface";
import { employeeRepository } from "@repositories/employees/implementation/employeeRepository";
import { taskRepository } from "@repositories/tasks/implementation/taskRepository";
import { ITaskRepository } from "@repositories/tasks/taskRepositoryInterface";
import { ConditionsValidator } from "utils/validateConditions";

interface UpdateTaskUseCaseRequest {
	id: string;
	title?: string;
	description?: string;
	priority?: TaskPriority;
	status?: TaskStatus;
	startDate?: Date;
	endDate?: Date;
	assignedToId?: string;

	requester: {
		id: string;
		companyId: string;
		role: string;
		department: string;
	};
}

interface UpdateTaskUseCaseResponse {
	success: boolean;
	data: {
		message: string;
	};
}

export class UpdateTaskUseCase {
	constructor(
		private taskRepository: ITaskRepository,
		private employeeRepository: IEmployeeRepository,
	) {}

	async execute({
		id,
		title,
		description,
		priority,
		status,
		startDate,
		endDate,
		assignedToId,
		requester,
	}: UpdateTaskUseCaseRequest): Promise<UpdateTaskUseCaseResponse> {
		const employeeAssignedTo =
			assignedToId && ((await this.employeeRepository.getById(assignedToId as string)) as Employee);

		let defaultEndDate: Date = new Date();

		const taskToUpdate = (await this.taskRepository.getById(id)) as Task;

		if (startDate && !endDate) {
			switch (priority ?? taskToUpdate.priority) {
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
					condition: !taskToUpdate,
					toThrow: new NotFoundError(
						"Dados não encontrados: nenhuma tarefa encontrada com os critérios fornecidos.",
					),
				},
				{
					condition: assignedToId && !employeeAssignedTo,
					toThrow: new NotFoundError(
						"Dados não encontrados: o colaborador a ser atribuído à tarefa não foi encontrado com os critérios fornecidos.",
					),
				},
				{
					condition: requester.role !== "ADMIN" && requester.id !== taskToUpdate.assignedById,
					toThrow: new ForbiddenError(
						"Ação não permitida: apenas colaboradores com perfil MASTER ou ADMIN ou o gerente criador da tarefa podem alterá-las.",
					),
				},
				{
					condition: requester.companyId !== taskToUpdate.companyId,
					toThrow: new ForbiddenError(
						"Ação não permitida: tarefas só podem ser atualizadas por colaboradores da mesma empresa.",
					),
				},
				{
					condition: employeeAssignedTo && ["MASTER", "ADMIN"].includes(employeeAssignedTo.role),
					toThrow: new ForbiddenError(
						"Ação não permitida: colaboradores com perfis MASTER ou ADMIN não podem ter tarefas atribuídas a sí.",
					),
				},
				{
					condition:
						requester.role === "MANAGER" && requester.department !== taskToUpdate.department,
					toThrow: new ForbiddenError(
						"Ação não permitida: gerentes só podem atribuir tarefas à colaboradores do mesmo departamento.",
					),
				},
				{
					condition:
						employeeAssignedTo &&
						(await this.taskRepository.getTasksInTimeRange({
							employeeId: assignedToId,
							startRange: startDate ?? taskToUpdate.startDate,
							endRange: endDate ?? defaultEndDate ?? taskToUpdate.endDate,
						})),
					toThrow: new ConflictError("Dados em conflito: "),
				},
			]).validate();
		}

		await this.taskRepository.update({
			id,
			assignedToId,
			department: employeeAssignedTo ? employeeAssignedTo?.department : undefined,
			description,
			priority,
			startDate,
			endDate: startDate ? (endDate ?? defaultEndDate) : undefined,
			status,
			title,
		});

		return {
			success: true,
			data: {
				message: "Sucesso! Tarefa atualizada.",
			},
		};
	}
}

export const updateTaskUseCase = new UpdateTaskUseCase(taskRepository, employeeRepository);
