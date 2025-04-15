import { CompanyDepartment, TaskPriority, TaskStatus } from "@prisma/client";

export interface UpdateTaskDTO {
	id: string;
	title?: string;
	description?: string;
	priority?: TaskPriority;
	department?: CompanyDepartment;
	startDate?: Date;
	endDate?: Date;
	status?: TaskStatus;
	assignedToId?: string;
}
