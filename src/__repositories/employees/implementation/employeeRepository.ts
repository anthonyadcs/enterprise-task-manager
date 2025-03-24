import { Employee } from "@prisma/client";
import { IEmployeeRepository } from "../employeeRepositoryInterface";
import { prismaClient } from "dbConnection/prismaClient";

export class EmployeeRepository implements IEmployeeRepository {
	async getByEmail(email: string): Promise<Employee | undefined> {
		const employee =
			(await prismaClient.employee.findUnique({
				where: { email },
			})) || undefined;

		return employee;
	}
}

export const employeeRepository = new EmployeeRepository();
