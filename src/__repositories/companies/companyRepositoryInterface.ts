import { CreateCompanyDTO } from "./dtos/createCompanyDTO";

export interface ICompanyRepository {
	create({ cnpj, email, name, departments }: CreateCompanyDTO): Promise<void>;
}
