import { UnauthorizedError } from "@errors/apiError";
import { IEmployeeRepository } from "__repositories/employees/employeeRepositoryInterface";
import { employeeRepository } from "__repositories/employees/implementation/employeeRepository";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

interface LoginEmployeeUseCaseRequest {
	email: string;
	password: string;
}

interface LoginEmployeeUseCaseResponse {
	success: boolean;
	data: {
		token: string;
	};
}

export class LoginEmployeeUseCase {
	constructor(private employeeRepository: IEmployeeRepository) {}

	async execute({
		email,
		password,
	}: LoginEmployeeUseCaseRequest): Promise<LoginEmployeeUseCaseResponse> {
		const employee = await this.employeeRepository.getByEmail(email);

		if (!(employee && (await bcrypt.compare(password, employee.password)))) {
			throw new UnauthorizedError("Acesso negado: e-mail e/ou senha incorreto(s).");
		}

		const token = jwt.sign({ id: employee.id }, process.env.JWT_SECRET ?? "", { expiresIn: "8h" });

		return {
			success: true,
			data: {
				token,
			},
		};
	}
}

export const loginEmployeeUseCase = new LoginEmployeeUseCase(employeeRepository);
