import { CompanyDepartment, EmployeeRole } from "@prisma/client";

export type FilterFields = { department?: CompanyDepartment; role?: EmployeeRole };

export interface GetCompanyEmployeesDTO {
	companyId: string;
	queries: {
		order: {
			field: "role" | "createdAt" | "task";
			sort: "asc" | "desc";
		};
		page: {
			skip: number;
			limit: number;
		};
		filters: FilterFields[] | undefined;
	};
}
