import { Employee } from "@prisma/client";
import { GetCompanyEmployeesResponse, IEmployeeRepository } from "../employeeRepositoryInterface";
import { prismaClient } from "dbConnection/prismaClient";
import { CreateEmployeeDTO } from "../dto/createEmployeeDTO";
import { UpdateEmployeeDTO } from "../dto/updateEmployeeDTO";
import { GetCompanyEmployeesDTO } from "../dto/getCompanyEmployeesDTO";

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

	async update({ id, name, email, password, department, role }: UpdateEmployeeDTO): Promise<void> {
		try {
			await prismaClient.employee.update({
				where: { id },
				data: {
					name,
					email,
					password,
					role,
					department,
				},
			});
		} catch (error) {
			console.log(error);
			throw new Error();
		}
	}

	async delete(id: string): Promise<void> {
		try {
			await prismaClient.employee.delete({
				where: { id },
			});
		} catch (error) {
			console.log(error);
			throw new Error();
		}
	}

	async getEmployees({
		companyId,
		queries: { filters, order, page },
	}: GetCompanyEmployeesDTO): Promise<GetCompanyEmployeesResponse> {
		try {
			const [employees, employeesInThisPage, totalEmployees] = [
				(await prismaClient.employee.findMany({
					where: {
						companyId,
						AND: filters,
					},
					skip: page.skip,
					take: page.limit,
					orderBy: {
						[order.field]: order.sort,
					},
					include: {
						tasks: true,
					},
				})) || undefined,
				await prismaClient.employee.count({
					where: {
						companyId,
						AND: filters,
					},
					skip: page.skip,
					take: page.limit,
				}),
				await prismaClient.employee.count({
					where: {
						companyId,
						AND: filters,
					},
				}),
			];

			const totalPages = Math.ceil(totalEmployees / page.limit);

			return {
				employees,
				employeesInThisPage,
				totalEmployees,
				totalPages,
			};
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
