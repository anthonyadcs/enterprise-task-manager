declare global {
	namespace Express {
		export interface Request {
			employee: {
				id: string;
			};
		}
	}
}

export {};
