import { ForbiddenError, NotFoundError } from "@errors/apiError";
import { ICompanyRepository } from "@repositories/companies/companyRepositoryInterface";
import { companyRepository } from "@repositories/companies/implementation/companyRepository";

interface UpdateCompanyUseCaseRequest {
	id: string;
	requester: {
		companyId: string;
		role: string;
	};
	toUpdate: {
		name?: string;
		email?: string;
	};
}

interface UpdateCompanyUseCaseResponse {
	success: boolean;
	data: {
		message: string;
	};
}

export class UpdateCompanyUseCase {
	constructor(private companyRepository: ICompanyRepository) {}

	async execute({
		id,
		requester,
		toUpdate: { name, email },
	}: UpdateCompanyUseCaseRequest): Promise<UpdateCompanyUseCaseResponse> {
		const company = await this.companyRepository.getById(id);

		if (!company) {
			throw new NotFoundError(
				"Dados não encontrados: nenhuma empresa encontrada com os critérios fornecidos.",
			);
		}

		if (company.id !== requester.companyId || requester.role !== "ADMIN") {
			throw new ForbiddenError(
				"Ação não permitida: usuário solicitante não possui as permissões necessárias para realizar esta operação.",
			);
		}

		await this.companyRepository.update({
			id: company.id,
			toUpdate: {
				email,
				name,
			},
		});

		return {
			success: true,
			data: {
				message: "Sucesso! Empresa atualizada.",
			},
		};
	}
}

export const updateCompanyUseCase = new UpdateCompanyUseCase(companyRepository);
