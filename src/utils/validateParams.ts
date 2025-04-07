import { BadRequestError, UnprocessableEntityError } from "@errors/apiError";
import { ZodSchema } from "zod";

class ValidateParams {
	async check(schema: ZodSchema, params: any) {
		try {
			schema.parse(params);
		} catch (error: any) {
			let message = "Dados de requisição mal formatados";
			const errors = error.errors;

			for (const error of errors) {
				if (error.message === "Required") {
					message =
						"Dados de requisição mal formatados: um ou mais campos necessários não foram fornecidos.";
					throw new BadRequestError(message);
				}

				if (message === "Dados de requisição mal formatados") {
					message += `: ${error.message};`;
				} else {
					message += `${error.message};`;
				}
			}

			throw new UnprocessableEntityError(message);
		}
	}

	async parse(schema: ZodSchema, params: any) {
		try {
			const result = await schema.parse(params);

			return result;
		} catch (error: any) {
			let message = "Dados de requisição mal formatados";
			const errors = error.errors;

			for (const error of errors) {
				if (error.message === "Required") {
					message =
						"Dados de requisição mal formatados: um ou mais campos necessários não foram fornecidos.";
					throw new BadRequestError(message);
				}

				if (message === "Dados de requisição mal formatados") {
					message += `: ${error.message};`;
				} else {
					message += `${error.message};`;
				}
			}

			throw new UnprocessableEntityError(message);
		}
	}
}

export const validateParams = new ValidateParams();
