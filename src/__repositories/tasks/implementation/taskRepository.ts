import { prismaClient } from "dbConnection/prismaClient";
import { GetEmployeeTasksDTO } from "../dtos/GetEmployeTasksDTO";
import { GetByEmployeeIdResponse, ITaskRepository } from "../taskRepositoryInterface";

class TaskRepository implements ITaskRepository {
	async getByEmployeeId({
		employeeId,
		queries: { filters, order, page },
	}: GetEmployeeTasksDTO): Promise<GetByEmployeeIdResponse> {
		try {
			const [tasks, tasksPerPage, totalTasks] = [
				(await prismaClient.task.findMany({
					where: { staffId: employeeId, AND: filters },
					skip: page.skip,
					take: page.limit,
					orderBy: {
						[order.field]: order.sort,
					},
				})) || undefined,

				await prismaClient.task.count({
					where: { staffId: employeeId, AND: filters },
					skip: page.skip,
					take: page.limit,
				}),

				await prismaClient.task.count({
					where: { staffId: employeeId, AND: filters },
				}),
			];

			const totalPages = Math.ceil(totalTasks / page.limit);

			return {
				tasks,
				tasksPerPage,
				totalTasks,
				totalPages,
			};
		} catch (error) {
			console.log(error);
			throw new Error();
		}
	}
}

export const taskRepository = new TaskRepository();
