import { TaskPriority, TaskStatus } from "@prisma/client";

export type FilterFields = { priority?: TaskPriority; status?: TaskStatus };

export interface GetEmployeeTasksDTO {
	employeeId: string;
	queries: {
		order: {
			field: "priority" | "status" | "startDate" | "endDate";
			sort: "asc" | "desc";
		};
		page: {
			skip: number;
			limit: number;
		};
		filters: FilterFields[] | undefined;
	};
}
