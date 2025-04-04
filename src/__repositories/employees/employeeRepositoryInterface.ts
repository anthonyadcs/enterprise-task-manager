import { Employee } from "@prisma/client";
import { CreateEmployeeDTO } from "./dto/createEmployeeDTO";
import { UpdateEmployeeDTO } from "./dto/updateEmployeeDTO";

export interface IEmployeeRepository {
	create({
		name,
		email,
		password,
		company: { id, department, role },
	}: CreateEmployeeDTO): Promise<void>;
	update({ name, email, password, department, role }: UpdateEmployeeDTO): Promise<void>;
	getByEmail(email: string): Promise<Employee | undefined>;
	getById(id: string): Promise<Employee | undefined>;
}
