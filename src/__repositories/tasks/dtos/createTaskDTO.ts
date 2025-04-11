import { CompanyDepartment, TaskPriority } from "@prisma/client";

export interface CreateTaskDTO {
	title: string;
	description?: string;
	priority: TaskPriority;
	department: CompanyDepartment;
	startDate: Date;
	endDate: Date;

	companyId: string;
	assignedById: string;
	assignedToId: string;
}
