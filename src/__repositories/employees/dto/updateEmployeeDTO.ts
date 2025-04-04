import { CompanyDepartment, EmployeeRole } from "@prisma/client";

export interface UpdateEmployeeDTO {
	id: string;
	name?: string;
	email?: string;
	password?: string;
	department?: CompanyDepartment;
	role?: EmployeeRole;
}
