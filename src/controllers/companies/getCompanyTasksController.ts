import { CompanyDepartment, TaskPriority, TaskStatus } from "@prisma/client";
import {
	GetCompanyTasksUseCase,
	getCompanyTasksUseCase,
} from "@useCases/companies/getCompanyTasksUseCase";
import { Request, Response } from "express";
import { validateParams } from "utils/validateParams";
import { z } from "zod";

const parsedQuerySchema = z
	.object({
		//Query de ordenação. Caso não seja enviado, define que o elemento a ser considerado na ordenação será o cargo do colaborador e a ordem como decrescente (do maior cargo p/ o menor cargo).
		order: z
			.object({
				sort: z.enum(["asc", "desc"]).optional().default("desc"),
				field: z
					.enum(["priority", "status", "endDate", "startDate"])
					.optional()
					.default("priority"),
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
				priority: z
					.string()
					.refine((val) =>
						//Verifica se todos os valores separados por "," pertencem ao conjunto permitido de prioridades.
						val
							.split(",")
							.every((p) => ["CRITICAL", "HIGH", "MEDIUM", "LOW"].includes(p)),
					)
					.transform((p) => {
						return p.split(",") as TaskPriority[];
					})
					.optional(),
				status: z
					.string()
					.refine((val) =>
						//Verifica se todos os valores separados por "," pertencem ao conjunto permitido de status.
						val
							.split(",")
							.every((s) =>
								["PENDING", "PARTIAL_DONE", "DONE", "PARTIAL_CANCELLED", "CANCELLED"].includes(s),
							),
					)
					.transform((s) => {
						return s.split(",") as TaskStatus[];
					})
					.optional(),
				department: z
					.string()
					.refine((val) =>
						//Verifica se todos os valores separados por "," pertencem ao conjunto permitido de status.
						val
							.split(",")
							.every((d) => ["MARKETING", "IT", "HR", "CONTABILITY", "LEGAL"].includes(d)),
					)
					.transform((d) => {
						return d.split(",") as CompanyDepartment[];
					})
					.optional(),
				startDate: z
					.string()
					.refine((sd) => !Number.isNaN(Date.parse(sd)))
					.transform((sd) => new Date(sd))
					.optional(),
				endDate: z
					.string()
					.refine((ed) => !Number.isNaN(Date.parse(ed)))
					.transform((ed) => new Date(ed))
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

const getCompanyTasksControllerSchema = z.object({
	companyId: z.string().uuid(),
	requester: z.object({
		id: z.string().uuid(),
		companyId: z.string().uuid(),
		role: z.enum(["MASTER", "ADMIN", "MANAGER", "STAFF"]),
		department: z.enum(["IT", "HR", "MARKETING", "CONTABILITY", "LEGAL"]),
	}),
	queries: parsedQuerySchema,
});

type GetCompanyTasksRequest = z.infer<typeof getCompanyTasksControllerSchema>;

export class GetCompanyTasksController {
	constructor(private getCompanyTasksUseCase: GetCompanyTasksUseCase) {}

	async handle(request: Request, response: Response): Promise<Response> {
		const companyId = request.params.id;
		const { role, department, id: requesterId, companyId: requesterCompanyId } = request.employee;
		const queries = request.query;

		const parsedQuery: Record<string, any> = {};

		for (const [key, value] of Object.entries(queries)) {
			const [section, filed] = key.split("_");

			if (!parsedQuery[section]) {
				parsedQuery[section] = {};
			}

			if (Array.isArray(value)) {
				parsedQuery[section][filed] = [];
				for (const val of value) {
					parsedQuery[section][filed].push(val);
				}
			} else {
				parsedQuery[section][filed] = value;
			}
		}

		const parsedParams: GetCompanyTasksRequest = await validateParams.parse(
			getCompanyTasksControllerSchema,
			{
				companyId,
				requester: {
					id: requesterId,
					companyId: requesterCompanyId,
					role,
					department,
				},
				queries: Object.keys(parsedQuery).length > 0 ? parsedQuery : undefined,
			},
		);

		const requestResult = await this.getCompanyTasksUseCase.execute(parsedParams);

		return response.json(requestResult);
	}
}

export const getCompanyTasksController = new GetCompanyTasksController(getCompanyTasksUseCase);
