export interface UpdateCompanyDTO {
	id: string;
	toUpdate: {
		name?: string;
		email?: string;
	};
}
