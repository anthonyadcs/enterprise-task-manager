import { CompanyDepartment, EmployeeRole } from "@prisma/client";

export interface CreateEmployeeDTO {
	name: string;
	email: string;
	password: string;
	company: {
		id: string;
		role: EmployeeRole;
		department: CompanyDepartment;
	};
}
