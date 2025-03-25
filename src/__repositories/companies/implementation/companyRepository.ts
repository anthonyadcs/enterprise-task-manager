import { prismaClient } from "dbConnection/prismaClient";
import { ICompanyRepository } from "../companyRepositoryInterface";
import { CreateCompanyDTO } from "../dtos/createCompanyDTO";

export class CompanyRepository implements ICompanyRepository {
	async create({ cnpj, email, name, departments }: CreateCompanyDTO): Promise<void> {
		try {
			await prismaClient.company.create({
				data: {
					departments,
					cnpj,
					email,
					name,
				},
			});
		} catch (error) {
			console.log(error);
			throw new Error();
		}
	}
}

export const companyRepository = new CompanyRepository();
