import { prismaClient } from "dbConnection/prismaClient";
import { ICompanyRepository } from "../companyRepositoryInterface";
import { CreateCompanyDTO } from "../dtos/createCompanyDTO";
import { UpdateCompanyDTO } from "../dtos/updateCompanyDTO";
import { Company } from "@prisma/client";

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

	async update({ id, toUpdate: { name, email } }: UpdateCompanyDTO): Promise<void> {
		try {
			await prismaClient.company.update({
				where: { id },
				data: {
					name,
					email,
				},
			});
		} catch (error) {
			console.log(error);
			throw new Error();
		}
	}

	async getById(id: string): Promise<Company | undefined> {
		try {
			return (
				(await prismaClient.company.findUnique({
					where: { id },
				})) || undefined
			);
		} catch (error) {
			console.log(error);
			throw new Error();
		}
	}
}

export const companyRepository = new CompanyRepository();
