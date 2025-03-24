import {
	LoginEmployeeUseCase,
	loginEmployeeUseCase,
} from "_useCases/employees/loginEmployeeUseCase";
import { Request, Response } from "express";
import { validateParams } from "utils/validateParams";
import { z } from "zod";

const loginEmployeeSchema = z.object({
	email: z.string().email({ message: "e-mail mal formatado" }),
	password: z.string().min(6, { message: "senha curta demais" }),
});

type LoginEmployeeRequest = z.infer<typeof loginEmployeeSchema>;

export class LoginEmployeeController {
	constructor(private loginEmployeeUseCase: LoginEmployeeUseCase) {}

	async handle(request: Request, response: Response): Promise<Response> {
		const { email, password } = request.body;

		const params: LoginEmployeeRequest = { email, password };

		await validateParams.check(loginEmployeeSchema, params);

		const requestResult = await this.loginEmployeeUseCase.execute(params);

		return response.json(requestResult);
	}
}

export const loginEmployeeController = new LoginEmployeeController(loginEmployeeUseCase);
