import { prismaClient } from "dbConnection/prismaClient";
import { GetEmployeeTasksDTO } from "../dtos/GetEmployeTasksDTO";
import { GetTasksResponse, ITaskRepository } from "../taskRepositoryInterface";
import { GetCompanyTasksDTO } from "../dtos/GetCompanyTasksDTO";
import { Task } from "@prisma/client";

class TaskRepository implements ITaskRepository {
	async getById(id: string): Promise<Task | undefined> {
		try {
			const task =
				(await prismaClient.task.findUnique({
					where: { id },
				})) || undefined;

			return task;
		} catch (error) {
			console.log(error);
			throw new Error();
		}
	}

	async getByEmployeeId({
		employeeId,
		queries: { filters, order, page },
	}: GetEmployeeTasksDTO): Promise<GetTasksResponse> {
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

	async getCompanyTasks({
		companyId,
		queries: { filters, order, page },
	}: GetCompanyTasksDTO): Promise<GetTasksResponse> {
		try {
			const [tasks, tasksPerPage, totalTasks] = [
				(await prismaClient.task.findMany({
					where: { companyId, AND: filters },
					skip: page.skip,
					take: page.limit,
					orderBy: { [order.field]: order.sort },
				})) || undefined,

				await prismaClient.task.count({
					where: { companyId, AND: filters },
					skip: page.skip,
					take: page.limit,
				}),

				await prismaClient.task.count({
					where: { companyId, AND: filters },
				}),
			];

			const totalPages = Math.ceil(totalTasks / page.limit);

			return {
				totalPages,
				tasksPerPage,
				totalTasks,
				tasks,
			};
		} catch (error) {
			console.log(error);
			throw new Error();
		}
	}
}

export const taskRepository = new TaskRepository();
