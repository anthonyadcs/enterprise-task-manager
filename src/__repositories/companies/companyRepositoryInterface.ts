import { Company } from "@prisma/client";
import { CreateCompanyDTO } from "./dtos/createCompanyDTO";
import { UpdateCompanyDTO } from "./dtos/updateCompanyDTO";

export interface ICompanyRepository {
	create({ cnpj, email, name, departments }: CreateCompanyDTO): Promise<void>;
	update({ id, toUpdate }: UpdateCompanyDTO): Promise<void>;
	getById(id: string): Promise<Company | undefined>;
}
