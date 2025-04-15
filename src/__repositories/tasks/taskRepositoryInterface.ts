import { Task } from "@prisma/client";
import { GetEmployeeTasksDTO } from "./dtos/GetEmployeTasksDTO";
import { GetCompanyTasksDTO } from "./dtos/GetCompanyTasksDTO";
import { CreateTaskDTO } from "./dtos/createTaskDTO";
import { GetTasksInTimeRangeDTO } from "./dtos/getTasksInTimeRangeDTO";
import { UpdateTaskDTO } from "./dtos/updateTaskDTO";

export interface ITaskRepository {
	create({
		title,
		description,
		priority,
		department,
		startDate,
		endDate,
		assignedById,
		assignedToId,
		companyId,
	}: CreateTaskDTO): Promise<void>;

	update({
		id,
		title,
		description,
		priority,
		status,
		startDate,
		endDate,
		department,
		assignedToId,
	}: UpdateTaskDTO): Promise<void>;

	getTasksInTimeRange({
		employeeId,
		endRange,
		startRange,
	}: GetTasksInTimeRangeDTO): Promise<number>;

	getById(id: string): Promise<Task | undefined>;

	getByEmployeeId({
		employeeId,
		queries: { filters, order, page },
	}: GetEmployeeTasksDTO): Promise<GetTasksResponse>;

	getCompanyTasks({
		companyId,
		queries: { filters, order, page },
	}: GetCompanyTasksDTO): Promise<GetTasksResponse>;
}

export interface GetTasksResponse {
	tasks: Task[];
	tasksPerPage: number;
	totalTasks: number;
	totalPages: number;
}
