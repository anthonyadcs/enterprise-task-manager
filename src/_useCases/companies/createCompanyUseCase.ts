import { ForbiddenError, UnprocessableEntityError } from "@errors/apiError";
import { CompanyDepartment } from "@prisma/client";
import { ICompanyRepository } from "@repositories/companies/companyRepositoryInterface";
import { companyRepository } from "@repositories/companies/implementation/companyRepository";

interface CreateCompanyUseCaseRequest {
	requester: {
		role: string;
	};
	cnpj: string;
	name: string;
	email: string;
	departments: CompanyDepartment[];
}

interface CreateCompanyUseCaseResponse {
	success: boolean;
	data: {
		message: string;
	};
}

export class CreateCompanyUseCase {
	constructor(private companyRepository: ICompanyRepository) {}

	async execute({
		requester,
		cnpj,
		name,
		email,
		departments,
	}: CreateCompanyUseCaseRequest): Promise<CreateCompanyUseCaseResponse> {
		if (requester.role !== "ADMIN") {
			throw new ForbiddenError(
				"Ação não permitida: usuário solicitante não possui as permissões necessárias para realizar esta operação.",
			);
		}

		const cnpjRegex = /^[0-9]{2}\.?[0-9]{3}\.?[0-9]{3}\/?[0-9]{4}\-?[0-9]{2}$/;

		const cnpjIsValid = cnpjRegex.test(cnpj);

		if (!cnpjIsValid) {
			throw new UnprocessableEntityError(
				"Erro na formatação dos campos: O CNPJ fornecido não é válido.",
			);
		}

		const formattedDepartments = departments.join(",");

		await this.companyRepository.create({
			name,
			cnpj,
			email,
			departments: formattedDepartments,
		});

		return {
			success: true,
			data: {
				message: "Sucesso! Empresa criada.",
			},
		};
	}
}

export const createCompanyUseCase = new CreateCompanyUseCase(companyRepository);
