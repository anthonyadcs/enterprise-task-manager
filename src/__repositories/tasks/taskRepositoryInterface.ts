import { Task } from "@prisma/client";
import { GetEmployeeTasksDTO } from "./dtos/GetEmployeTasksDTO";

export interface ITaskRepository {
	getByEmployeeId({
		employeeId,
		queries: { filters, order, page },
	}: GetEmployeeTasksDTO): Promise<GetByEmployeeIdResponse>;
}

export interface GetByEmployeeIdResponse {
	tasks: Task[];
	tasksPerPage: number;
	totalTasks: number;
	totalPages: number;
}
