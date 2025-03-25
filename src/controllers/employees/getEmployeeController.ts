import { GetEmployeeUseCase, getEmployeeUseCase } from "_useCases/employees/getEmployeeUseCase";
import { Request, Response } from "express";
import { validateParams } from "utils/validateParams";
import { z } from "zod";

const getEmployeeControllerSchema = z.object({
	//Infos necessárias sobre o solicitante da obtenção de colaborador
	requester: z.object({
		id: z.string().uuid(),
		companyId: z.string().uuid(),
		department: z.enum(["MARKETING", "IT", "HR", "MARKETING", "CONTABILITY", "LEGAL"]),
		role: z.enum(["MASTER", "ADMIN", "MANAGER", "STAFF"]),
	}),

	//Código ID do colaborador a ser obtido
	employeeId: z.string().uuid(),
});

//Define a tipagem do GetEmployee a ser enviado p/ o caso de uso
type GetEmployeeRequest = z.infer<typeof getEmployeeControllerSchema>;

export class GetEmployeeController {
	constructor(private getEmployeeUseCase: GetEmployeeUseCase) {}

	async handle(request: Request, response: Response): Promise<Response> {
		const { id, companyId, department, role } = request.employee;
		const employeeId = request.params.id;

		const params: GetEmployeeRequest = {
			requester: { id, companyId, department, role },
			employeeId,
		};

		await validateParams.check(getEmployeeControllerSchema, params);

		const requestResult = await this.getEmployeeUseCase.execute(params);

		return response.json(requestResult);
	}
}

export const getEmployeeController = new GetEmployeeController(getEmployeeUseCase);
