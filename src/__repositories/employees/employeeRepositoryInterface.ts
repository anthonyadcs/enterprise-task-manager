import { Employee } from "@prisma/client";

export interface IEmployeeRepository {
	getByEmail(email: string): Promise<Employee | undefined>;
}
