import { Employee } from "@prisma/client";
import { IEmployeeRepository } from "../employeeRepositoryInterface";
import { prismaClient } from "dbConnection/prismaClient";
import { CreateEmployeeDTO } from "../dto/createEmployeeDTO";
import { UpdateEmployeePersonalDataDTO } from "../dto/updateEmployeePersonalDataDTO";

export class EmployeeRepository implements IEmployeeRepository {
	async create({
		name,
		email,
		password,
		company: { id, department, role },
	}: CreateEmployeeDTO): Promise<void> {
		try {
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
		} catch (error) {
			console.log(error);
			throw new Error();
		}
	}

	async updatePersonalData({
		id,
		name,
		email,
		password,
	}: UpdateEmployeePersonalDataDTO): Promise<void> {
		try {
			await prismaClient.employee.update({
				where: { id },
				data: {
					name,
					email,
					password,
				},
			});
		} catch (error) {
			console.log(error);
			throw new Error();
		}
	}

	async getByEmail(email: string): Promise<Employee | undefined> {
		try {
			const employee =
				(await prismaClient.employee.findUnique({
					where: { email },
				})) || undefined;

			return employee;
		} catch (error) {
			console.log(error);
			throw new Error();
		}
	}

	async getById(id: string): Promise<Employee | undefined> {
		try {
			const employee =
				(await prismaClient.employee.findUnique({
					where: { id },
				})) || undefined;

			return employee;
		} catch (error) {
			console.log(error);
			throw new Error();
		}
	}
}

export const employeeRepository = new EmployeeRepository();
