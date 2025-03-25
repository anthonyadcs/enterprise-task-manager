import { CompanyDepartment } from "@prisma/client";

export interface CreateCompanyDTO {
	cnpj: string;
	name: string;
	email: string;
	departments?: string;
}
