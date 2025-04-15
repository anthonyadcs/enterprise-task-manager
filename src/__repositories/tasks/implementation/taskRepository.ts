import { prismaClient } from "dbConnection/prismaClient";
import { GetEmployeeTasksDTO } from "../dtos/GetEmployeTasksDTO";
import { GetTasksResponse, ITaskRepository } from "../taskRepositoryInterface";
import { GetCompanyTasksDTO } from "../dtos/GetCompanyTasksDTO";
import { Task } from "@prisma/client";
import { CreateTaskDTO } from "../dtos/createTaskDTO";
import { GetTasksInTimeRangeDTO } from "../dtos/getTasksInTimeRangeDTO";
import { UpdateTaskDTO } from "../dtos/updateTaskDTO";

class TaskRepository implements ITaskRepository {
	async create({
		title,
		description,
		priority,
		department,
		startDate,
		endDate,
		assignedById,
		assignedToId,
		companyId,
	}: CreateTaskDTO): Promise<void> {
		try {
			await prismaClient.task.create({
				data: {
					title,
					description,
					priority,
					startDate,
					endDate,
					department,
					assignedById,
					assignedToId,
					companyId,
				},
			});
		} catch (error) {
			console.log(error);
			throw new Error();
		}
	}

	async getTasksInTimeRange({
		employeeId,
		startRange,
		endRange,
	}: GetTasksInTimeRangeDTO): Promise<number> {
		try {
			return await prismaClient.task.count({
				where: {
					assignedToId: employeeId,
					OR: [
						{
							startDate: { lte: startRange },
							endDate: { gte: endRange },
						},
					],
				},
			});
		} catch (error) {
			console.log(error);
			throw new Error();
		}
	}

	async update({
		id,
		title,
		description,
		priority,
		status,
		startDate,
		endDate,
		department,
		assignedToId,
	}: UpdateTaskDTO): Promise<void> {
		try {
			await prismaClient.task.update({
				where: { id },
				data: {
					title,
					description,
					priority,
					status,
					startDate,
					endDate,
					department,
					assignedToId,
				},
			});
		} catch (error) {
			console.log(error);
			throw new Error();
		}
	}

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
					where: { assignedToId: employeeId, AND: filters },
					skip: page.skip,
					take: page.limit,
					orderBy: {
						[order.field]: order.sort,
					},
				})) || undefined,

				await prismaClient.task.count({
					where: { assignedToId: employeeId, AND: filters },
					skip: page.skip,
					take: page.limit,
				}),

				await prismaClient.task.count({
					where: { assignedToId: employeeId, AND: filters },
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
