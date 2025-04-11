import { ForbiddenError, NotFoundError } from "@errors/apiError";
import { CompanyDepartment, EmployeeRole, Task } from "@prisma/client";
import { taskRepository } from "@repositories/tasks/implementation/taskRepository";
import { ITaskRepository } from "@repositories/tasks/taskRepositoryInterface";
import { ConditionsValidator } from "utils/validateConditions";

interface GetTaskUseCaseRequest {
	id: string;
	requester: {
		id?: string;
		companyId: string;
		role: EmployeeRole;
		department?: CompanyDepartment;
	};
}

interface GetTaskUseCaseResponse {
	success: boolean;
	data: {
		task: Task;
	};
}

export class GetTaskUseCase {
	constructor(private taskRepository: ITaskRepository) {}

	async execute({ id, requester }: GetTaskUseCaseRequest): Promise<GetTaskUseCaseResponse> {
		const task = (await this.taskRepository.getById(id)) as Task;

		if (requester.role !== "MASTER") {
			new ConditionsValidator([
				{
					condition: !task,
					toThrow: new NotFoundError(
						"Dados não encontrados: nenhuma tarefa encontrada com os critérios fornecidos",
					),
				},
				{
					condition:
						!["ADMIN", "MANAGER"].includes(requester.role) && task?.assignedToId !== requester.id,
					toThrow: new ForbiddenError(
						"Ação não permitida: apenas colaboradores com perfil ADMIN ou MANAGER ou o colaborador responsável pela tarefa podem acessá-las.",
					),
				},
				{
					condition: requester.role === "MANAGER" && requester?.department !== task?.department,
					toThrow: new ForbiddenError(
						"Ação não permitida: gerentes só tem acesso às tarefas do próprio departamento.",
					),
				},
			]).validate();
		}

		return {
			success: true,
			data: {
				task,
			},
		};
	}
}

export const getTaskUseCase = new GetTaskUseCase(taskRepository);
