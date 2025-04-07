import {
	getCompanyEmployeesUseCase,
	GetCompanyEmployeesUseCase,
} from "@useCases/employees/getCompanyEmployeesUseCase";
import { Request, Response } from "express";
import { validateParams } from "utils/validateParams";
import { z } from "zod";

const parsedQuerySchema = z
	.object({
		//Query de ordenação. Caso não seja enviado, define que o elemento a ser considerado na ordenação será o cargo do colaborador e a ordem como decrescente (do maior cargo p/ o menor cargo).
		order: z
			.object({
				sort: z.enum(["asc", "desc"]).optional().default("desc"),
				field: z.enum(["role", "createdAt", "task"]).optional().default("role"),
			})
			.optional()
			.default({}),
		//Query de paginação. Caso não seja enviado, define o limite de itens por página em 5 e a página atual como a 1.
		page: z
			.object({
				number: z
					.string()
					.optional()
					.default("1")
					.transform((val) => Number(val)),
				limit: z
					.string()
					.optional()
					.default("5")
					.transform((val) => Number(val)),
			})
			.optional()
			.default({}),
		//Query de filtragem. Caso não seja enviado, será mantido como undefined.
		filters: z
			.object({
				department: z
					.union([
						z.enum(["IT", "MARKETING", "HR", "CONTABILITY", "LEGAL"]),
						z.array(z.enum(["IT", "MARKETING", "HR", "CONTABILITY", "LEGAL"])),
					])
					.optional(),
				role: z
					.union([
						z.enum(["MASTER", "ADMIN", "MANAGER", "STAFF"]),
						z.array(z.enum(["MASTER", "ADMIN", "MANAGER", "STAFF"])),
					])
					.optional(),
			})
			.optional()
			.default({}),
	})
	//Define que o objeto de queries parseadas pode ser opcional. No caso de ser, define seus atributos como undefined também, ativando os seus valores padrão.
	.optional()
	.default({
		order: undefined,
		page: undefined,
	});

const getCompanyEmployeesControllerSchema = z.object({
	companyId: z.string().uuid(),
	requester: z.object({
		companyId: z.string().uuid(),
		role: z.enum(["MASTER", "ADMIN", "MANAGER", "STAFF"]),
	}),
	queries: parsedQuerySchema,
});

type GetCompanyEmployeesRequest = z.infer<typeof getCompanyEmployeesControllerSchema>;

export class GetCompanyEmployeesController {
	constructor(private getCompanyEmployeesUseCase: GetCompanyEmployeesUseCase) {}

	async handle(request: Request, response: Response): Promise<Response> {
		const { id: companyId } = request.params;
		const { role, companyId: requesterCompanyId } = request.employee;
		const queries = request.query;

		const parsedQuery: Record<string, any> = {};

		//Loop para formatar as queries p/ um formato mais amigável p/ o useCase
		for (const [key, value] of Object.entries(queries)) {
			const [section, field] = key.split("_");

			if (!parsedQuery[section]) {
				parsedQuery[section] = {};
			}

			if (Array.isArray(value)) {
				parsedQuery[section][field] = value;
			} else {
				parsedQuery[section][field] = value;
			}
		}

		//Parseamento dos parâmetros com a classe de validação
		const parsedParams: GetCompanyEmployeesRequest = await validateParams.parse(
			getCompanyEmployeesControllerSchema,
			{
				companyId,
				requester: {
					role,
					companyId: requesterCompanyId,
				},
				queries: Object.keys(parsedQuery).length > 0 ? parsedQuery : undefined,
			},
		);

		const requestResult = await this.getCompanyEmployeesUseCase.execute(parsedParams);

		return response.json(requestResult);
	}
}

export const getCompanyEmployeesController = new GetCompanyEmployeesController(
	getCompanyEmployeesUseCase,
);
