import { Employee } from "@prisma/client";
import { CreateEmployeeDTO } from "./dto/createEmployeeDTO";

export interface IEmployeeRepository {
	create({
		name,
		email,
		password,
		company: { id, department, role },
	}: CreateEmployeeDTO): Promise<void>;
	getByEmail(email: string): Promise<Employee | undefined>;
	getById(id: string): Promise<Employee | undefined>;
}
