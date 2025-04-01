import { Employee } from "@prisma/client";
import { IEmployeeRepository } from "../employeeRepositoryInterface";
import { prismaClient } from "dbConnection/prismaClient";
import { CreateEmployeeDTO } from "../dto/createEmployeeDTO";

export class EmployeeRepository implements IEmployeeRepository {
	async create({
		name,
		email,
		password,
		company: { id, department, role },
	}: CreateEmployeeDTO): Promise<void> {
		await prismaClient.employee.create({
			data: {
				name,
				email,
				password,
				role,
				department,
				company: {
					connect: {
						id,
					},
				},
			},
		});
	}

	async getByEmail(email: string): Promise<Employee | undefined> {
		const employee =
			(await prismaClient.employee.findUnique({
				where: { email },
			})) || undefined;

		return employee;
	}

	async getById(id: string): Promise<Employee | undefined> {
		const employee =
			(await prismaClient.employee.findUnique({
				where: { id },
			})) || undefined;

		return employee;
	}
}

export const employeeRepository = new EmployeeRepository();
