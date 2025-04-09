import { CompanyDepartment, TaskPriority, TaskStatus } from "@prisma/client";

export type FilterFields = {
	priority?: TaskPriority;
	status?: TaskStatus;
	department?: CompanyDepartment;
};

export interface GetCompanyTasksDTO {
	companyId: string;
	queries: {
		order: {
			field: "startDate" | "endDate" | "department" | "priority" | "status";
			sort: "asc" | "desc";
		};
		page: {
			skip: number;
			limit: number;
		};
		filters: FilterFields[] | undefined;
	};
}
