import { Task } from "@prisma/client";
import { GetEmployeeTasksDTO } from "./dtos/GetEmployeTasksDTO";
import { GetCompanyTasksDTO } from "./dtos/GetCompanyTasksDTO";

export interface ITaskRepository {
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
